import PlaceRow, { PlaceRowItem } from "@/components/places/PlaceRow";
import SearchBar from "@/components/places/SearchBar";
import SearchScopeToggle from "@/components/places/SearchScopeToggle";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { setPendingActionCallback, SheetAction } from "@/utils/actionSelectionBridge";
import { pushModal } from "@/utils/modalNav";
import { setPendingTextCallback } from "@/utils/textSelectionBridge";
import axios from "axios";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Keyboard, Text, View } from "react-native";

type SearchScope = "folder" | "everywhere";

type SearchResult = PlaceRowItem & { home_name?: string };

type PendingAction = { item: SearchResult; action: string };

export default function SearchScreen() {
  const { originType, originId, originName } = useLocalSearchParams<{
    originType: string;
    originId: string;
    originName?: string;
  }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>(originType ? "folder" : "everywhere");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const requestIdRef = useRef(0);

  const runSearch = (text: string, currentScope: SearchScope) => {
    if (!text.trim()) {
      setResults(null);
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setLoading(true);

    const params: Record<string, string> = { q: text.trim(), scope: currentScope };
    if (currentScope === "folder") {
      params.origin_type = originType;
      params.origin_id = originId;
    }

    api
      .get("/app/search", {
        params,
        headers: { Authorization: `Bearer ${state.tokens.accessToken}` },
      })
      .then((res) => {
        if (thisRequestId === requestIdRef.current) {
          setResults(res.data.results);
        }
      })
      .catch((err) => {
        console.log("err", err);
      })
      .finally(() => {
        if (thisRequestId === requestIdRef.current) {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    const timeout = setTimeout(() => runSearch(query, scope), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, scope]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    runSearch(query, scope);
  };

  const handleResultPress = (item: PlaceRowItem) => {
    router.push({
      pathname: "/(tabs)/places/node/[nodeType]/[nodeId]",
      params: { nodeType: item.type, nodeId: String(item.id), name: item.name },
    });
  };

  const openRename = (item: SearchResult) => {
    setPendingTextCallback(async (value) => {
      if (!value.trim()) {
        Alert.alert("Error", "Name is required.");
        return;
      }
      try {
        await api.post(`/app/place-node/${item.type}/${item.id}/rename`, { name: value.trim() }, authHeaders);
        setResults((prev) => prev?.map((r) => (r.id === item.id && r.type === item.type ? { ...r, name: value.trim() } : r)) ?? null);
      } catch (err) {
        const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? "Something went wrong.") : "Something went wrong.";
        Alert.alert("Error", message);
      }
    });
    pushModal({
      pathname: "/(tabs)/places/edit-text",
      params: { title: `Rename "${item.name}"`, placeholder: "Name", initialValue: item.name, submitLabel: "Save" },
    });
  };

  const handleDeleteResult = (item: SearchResult) => {
    Alert.alert("Delete", `Delete "${item.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post(`/app/place-node/${item.type}/${item.id}/delete`, {}, authHeaders);
            setResults((prev) => prev?.filter((r) => !(r.id === item.id && r.type === item.type)) ?? null);
          } catch {
            Alert.alert("Error", "Could not delete this.");
          }
        },
      },
    ]);
  };

  const openActionSheet = (item: SearchResult) => {
    setPendingActionCallback((action) => setPendingAction({ item, action }));
    const actions: SheetAction[] = [
      { key: "rename", label: "Rename", icon: "pencil-outline" },
      { key: "delete", label: "Delete", icon: "delete-outline", destructive: true },
    ];
    pushModal({
      pathname: "/(tabs)/places/action-sheet",
      params: { title: item.name, actions: JSON.stringify(actions) },
    });
  };

  // See node/[nodeType]/[nodeId].tsx for why this follow-up dispatch is
  // deferred to a focus-regain effect rather than run inside the action-sheet
  // callback directly.
  const handlePendingAction = useCallback(() => {
    if (!pendingAction) return;
    const { item, action } = pendingAction;
    setPendingAction(null);

    if (action === "rename") openRename(item);
    else if (action === "delete") handleDeleteResult(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAction]);

  useFocusEffect(
    useCallback(() => {
      handlePendingAction();
    }, [handlePendingAction]),
  );

  return (
    <>
      <Stack.Screen options={{ title: "Search" }} />
      <SearchBar
        mode="active"
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSubmit}
        autoFocus
        placeholder={originName ? `Search in ${originName}` : "Search"}
      />
      {originType && <SearchScopeToggle scope={scope} onChange={setScope} folderLabel={originName ?? "This folder"} />}

      {loading && (
        <View style={{ paddingVertical: 12, alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      )}

      {!loading && results && results.length === 0 && (
        <View style={{ paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ color: "grey" }}>No results.</Text>
        </View>
      )}

      <FlatList
        data={results ?? []}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => (
          <PlaceRow
            item={item}
            onPress={handleResultPress}
            subtitle={scope === "everywhere" ? item.home_name : undefined}
            onMenuPress={openActionSheet}
          />
        )}
      />
    </>
  );
}
