import PlaceRow, { PlaceRowItem } from "@/components/places/PlaceRow";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { useThemeColors } from "@/hooks/useThemeColors";
import { setPendingActionCallback, SheetAction } from "@/utils/actionSelectionBridge";
import { pushModal } from "@/utils/modalNav";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, View } from "react-native";
import axios from "axios";

type TrashEntry = PlaceRowItem & { deleted_at: string };

export default function TrashScreen() {
  const { homeId } = useLocalSearchParams<{ homeId: string }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [entries, setEntries] = useState<TrashEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const colors = useThemeColors();

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const loadTrash = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get(`/app/home/${homeId}/trash`, authHeaders);
      setEntries(res.data.trash);
    } catch {
      setErrorMessage("Could not load trash.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeId]);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const showError = (err: unknown, fallback: string) => {
    const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? fallback) : fallback;
    Alert.alert("Error", message);
  };

  const handleRecover = async (entry: TrashEntry) => {
    try {
      await api.post(`/app/place-node/${entry.type}/${entry.id}/restore`, {}, authHeaders);
      await loadTrash();
    } catch (err) {
      showError(err, "Could not recover this.");
    }
  };

  const handlePermanentDelete = (entry: TrashEntry) => {
    Alert.alert("Delete Permanently", `Permanently delete "${entry.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post(`/app/place-node/${entry.type}/${entry.id}/permanent-delete`, {}, authHeaders);
            await loadTrash();
          } catch (err) {
            showError(err, "Could not permanently delete this.");
          }
        },
      },
    ]);
  };

  const openActionSheet = (item: PlaceRowItem) => {
    // Rows are always rendered from `entries`, so PlaceRow hands the same
    // TrashEntry object back - it never constructs a plain PlaceRowItem.
    const entry = item as TrashEntry;
    setPendingActionCallback((action) => {
      if (action === "recover") handleRecover(entry);
      else if (action === "permanentDelete") handlePermanentDelete(entry);
    });
    const actions: SheetAction[] = [
      { key: "recover", label: "Recover", icon: "restore" },
      { key: "permanentDelete", label: "Delete Permanently", icon: "delete-forever-outline", destructive: true },
    ];
    pushModal({
      pathname: "/(tabs)/profile/action-sheet",
      params: { title: entry.name, actions: JSON.stringify(actions) },
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: "Trash" }} />
      <View style={{ flex: 1 }}>
        {errorMessage && <Text style={{ color: colors.destructive, padding: 16 }}>{errorMessage}</Text>}
        {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

        {!loading && entries && entries.length === 0 && (
          <View style={{ padding: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>Trash is empty.</Text>
          </View>
        )}

        {!loading && entries && entries.length > 0 && (
          <FlatList
            data={entries}
            keyExtractor={(entry) => `${entry.type}-${entry.id}`}
            renderItem={({ item: entry }) => (
              <PlaceRow
                item={entry}
                subtitle={`Trashed ${new Date(entry.deleted_at).toLocaleString()}`}
                onPress={openActionSheet}
                onMenuPress={openActionSheet}
              />
            )}
          />
        )}
      </View>
    </>
  );
}
