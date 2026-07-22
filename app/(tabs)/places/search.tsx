import PlaceRow, { PlaceRowItem } from "@/components/places/PlaceRow";
import SearchBar from "@/components/places/SearchBar";
import SearchScopeToggle from "@/components/places/SearchScopeToggle";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Text, View } from "react-native";

type SearchScope = "folder" | "everywhere";

type SearchResult = PlaceRowItem & { home_name?: string };

export default function SearchScreen() {
  const { originType, originId, originName } = useLocalSearchParams<{
    originType: string;
    originId: string;
    originName?: string;
  }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("folder");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

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
      <SearchScopeToggle scope={scope} onChange={setScope} folderLabel={originName ?? "This folder"} />

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
          />
        )}
      />
    </>
  );
}
