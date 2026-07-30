import HeaderIconButton from "@/components/places/HeaderIconButton";
import HomeRow, { HomeRowItem } from "@/components/places/HomeRow";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { setPendingActionCallback, SheetAction } from "@/utils/actionSelectionBridge";
import { pushModal } from "@/utils/modalNav";
import { setPendingOptionCallback } from "@/utils/optionSelectionBridge";
import { setPendingTextCallback } from "@/utils/textSelectionBridge";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useContext, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import SearchBar from "@/components/places/SearchBar";
import { useThemeColors } from "@/hooks/useThemeColors";

type SortOption = "name_asc" | "name_desc" | "date_new" | "date_old";

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: "Name (A to Z)",
  name_desc: "Name (Z to A)",
  date_new: "Date modified (New to Old)",
  date_old: "Date modified (Old to New)",
};

type PendingHomeAction = {
  home: HomeRowItem;
  action: string;
};

export default function Index() {
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const primaryHome = state.primaryHome;

  const [homes, setHomes] = useState<HomeRowItem[] | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("name_asc");
  const [pendingHomeAction, setPendingHomeAction] = useState<PendingHomeAction | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const colors = useThemeColors();

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const loadHomes = async () => {
    try {
      const res = await api.get("/app/homes", authHeaders);
      setHomes(res.data.homes);
    } catch (err) {
      console.log("err", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomes();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadHomes();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const sortedHomes = useMemo(() => {
    if (!homes) return [];
    const copy = [...homes];
    switch (sortOption) {
      case "name_asc":
        copy.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        copy.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "date_new":
        copy.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
      case "date_old":
        copy.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
        break;
    }
    // The primary home always leads the list, regardless of sort order.
    copy.sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
    return copy;
  }, [homes, sortOption]);

  const showError = (err: unknown, fallback: string) => {
    const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? fallback) : fallback;
    Alert.alert("Error", message);
  };

  const handleSetPrimary = async (home: HomeRowItem) => {
    try {
      await api.post("/app/set-primary-home", { home_id: home.id }, authHeaders);
      await loadHomes();
    } catch {
      Alert.alert("Error", "Could not set this home as primary.");
    }
  };

  const handleDelete = (home: HomeRowItem) => {
    Alert.alert("Delete Home", `Delete "${home.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post(`/app/home/${home.id}/delete`, {}, authHeaders);
            await loadHomes();
          } catch {
            Alert.alert("Error", "Could not delete this home.");
          }
        },
      },
    ]);
  };

  const openRename = (home: HomeRowItem) => {
    setPendingTextCallback(async (value) => {
      try {
        await api.post(`/app/home/${home.id}/rename`, { name: value, expected_updated_at: home.updated_at }, authHeaders);
        await loadHomes();
      } catch (err) {
        showError(err, "Could not rename this home.");
      }
    });
    pushModal({
      pathname: "/(tabs)/places/edit-text",
      params: { title: `Rename "${home.name}"`, placeholder: "Home name", initialValue: home.name, submitLabel: "Save" },
    });
  };

  const openEditAddress = (home: HomeRowItem) => {
    setPendingTextCallback(async (value) => {
      try {
        await api.post(`/app/home/${home.id}/address`, { address: value, expected_updated_at: home.updated_at }, authHeaders);
        await loadHomes();
      } catch (err) {
        showError(err, "Could not update the address.");
      }
    });
    pushModal({
      pathname: "/(tabs)/places/edit-text",
      params: {
        title: `Edit address for "${home.name}"`,
        placeholder: "Address",
        initialValue: home.address ?? "",
        submitLabel: "Save",
      },
    });
  };

  const openShare = (home: HomeRowItem) => {
    setPendingTextCallback(async (value) => {
      const username = value.trim();
      if (!username) return;
      try {
        await api.post(`/app/home/${home.id}/share`, { username }, authHeaders);
        await loadHomes();
      } catch (err) {
        showError(err, "Could not share this home.");
      }
    });
    pushModal({
      pathname: "/(tabs)/places/edit-text",
      params: {
        title: `Share "${home.name}"`,
        placeholder: "Username",
        initialValue: "",
        submitLabel: "Share",
        autoCapitalize: "none",
      },
    });
  };

  const openManageAccess = (home: HomeRowItem) => {
    pushModal({ pathname: "/(tabs)/places/manage-access", params: { homeId: String(home.id) } });
  };

  const buildHomeActions = (home: HomeRowItem): SheetAction[] => {
    const actions: SheetAction[] = [];
    if (home.is_creator) actions.push({ key: "share", label: "Share", icon: "account-plus-outline" });
    if (home.is_creator) {
      actions.push({ key: "manageAccess", label: "Manage access", icon: "account-multiple-outline" });
    }
    if (home.is_creator) actions.push({ key: "rename", label: "Rename", icon: "pencil-outline" });
    if (home.is_creator) actions.push({ key: "address", label: "Edit Address", icon: "map-marker-outline" });
    if (!home.is_primary) actions.push({ key: "setPrimary", label: "Set as Primary", icon: "star-outline" });
    if (home.is_creator) {
      actions.push({ key: "delete", label: "Delete", icon: "delete-outline", destructive: true });
    }
    return actions;
  };

  const openHomeActionSheet = (home: HomeRowItem) => {
    setPendingActionCallback((action) => setPendingHomeAction({ home, action }));
    pushModal({
      pathname: "/(tabs)/places/action-sheet",
      params: { title: home.name, actions: JSON.stringify(buildHomeActions(home)) },
    });
  };

  // The action-sheet screen's bridge callback only records *which* action was
  // picked; the actual follow-up (often another push, e.g. to edit-text) runs
  // here once this screen regains focus (i.e. after action-sheet's own
  // router.back() has settled) — pushing synchronously from within the
  // callback would race with that pending pop.
  const handlePendingHomeAction = useCallback(() => {
    if (!pendingHomeAction) return;
    const { home, action } = pendingHomeAction;
    setPendingHomeAction(null);

    if (action === "share") openShare(home);
    else if (action === "manageAccess") openManageAccess(home);
    else if (action === "rename") openRename(home);
    else if (action === "address") openEditAddress(home);
    else if (action === "delete") handleDelete(home);
    else if (action === "setPrimary") handleSetPrimary(home);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingHomeAction]);

  useFocusEffect(
    useCallback(() => {
      handlePendingHomeAction();
    }, [handlePendingHomeAction]),
  );

  const openSortMenu = () => {
    setPendingOptionCallback((value) => setSortOption(value as SortOption));
    pushModal({
      pathname: "/(tabs)/places/pick-option",
      params: {
        title: "Sort by",
        value: sortOption,
        options: JSON.stringify(
          (Object.keys(SORT_LABELS) as SortOption[]).map((key) => ({ label: SORT_LABELS[key], value: key })),
        ),
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{ headerRight: () => <HeaderIconButton onPress={() => pushModal("/(tabs)/places/create-home")} /> }}
      />

      <SearchBar mode="link" placeholder="Search" onPress={() => router.push("/(tabs)/places/search")} />

      {primaryHome === null && (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: "center" }}>
            You don&apos;t have a home yet.
          </Text>
        </View>
      )}

      {homes && homes.length > 0 && (
        <TouchableOpacity
          onPress={openSortMenu}
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 6,
            marginHorizontal: 12,
            marginBottom: 8,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 16,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          <MaterialCommunityIcons name="sort" size={16} color={colors.icon} />
          <Text style={{ fontSize: 14, color: colors.text }}>{SORT_LABELS[sortOption]}</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={sortedHomes}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <HomeRow
            item={item}
            showDateModified={sortOption === "date_new" || sortOption === "date_old"}
            onPress={(home) =>
              router.push({
                pathname: "/(tabs)/places/node/[nodeType]/[nodeId]",
                params: { nodeType: "home", nodeId: String(home.id), name: home.name },
              })
            }
            onMenuPress={openHomeActionSheet}
          />
        )}
      />
    </>
  );
}
