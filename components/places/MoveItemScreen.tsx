import HeaderIconButton from "@/components/places/HeaderIconButton";
import HeaderTextButton from "@/components/HeaderTextButton";
import PlaceRow, { PlaceRowItem } from "@/components/places/PlaceRow";
import { useThemeColors } from "@/hooks/useThemeColors";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { backModal } from "@/utils/modalNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

type HomeOption = { id: number; name: string };

/** A level the user has drilled into within the modal's own internal navigation stack. */
type Level = { kind: "home" | "room" | "container"; id: number; name: string };

export default function MoveItemScreen() {
  const { itemId, itemName, roomId, containerId, expectedUpdatedAt } = useLocalSearchParams<{
    itemId: string;
    itemName?: string;
    roomId?: string;
    containerId?: string;
    expectedUpdatedAt?: string;
  }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const colors = useThemeColors();

  const [path, setPath] = useState<Level[]>([]);
  const [homes, setHomes] = useState<HomeOption[] | null>(null);
  const [children, setChildren] = useState<PlaceRowItem[] | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [moving, setMoving] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const currentLevel = path[path.length - 1];
  const currentRoomId = roomId ? Number(roomId) : null;
  const currentContainerId = containerId ? Number(containerId) : null;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadStatus((prev) => (prev === "ready" ? prev : "loading"));
      try {
        if (!currentLevel) {
          const res = await api.get("/app/homes", authHeaders);
          if (cancelled) return;
          setHomes(res.data.homes.map((h: any) => ({ id: h.id, name: h.name })));
        } else {
          const res = await api.get(`/app/place-node/${currentLevel.kind}/${currentLevel.id}`, authHeaders);
          if (cancelled) return;
          setChildren(res.data.children);
        }
        if (!cancelled) setLoadStatus("ready");
      } catch {
        if (!cancelled) setLoadStatus("error");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel?.kind, currentLevel?.id]);

  const openHome = (home: HomeOption) => setPath([{ kind: "home", id: home.id, name: home.name }]);

  const openChild = (child: PlaceRowItem) => {
    if (child.type !== "room" && child.type !== "container") return;
    const level: Level = { kind: child.type, id: child.id, name: child.name };
    setPath((prev) => [...prev, level]);
  };

  const goBack = () => {
    if (path.length > 0) setPath((prev) => prev.slice(0, -1));
    else backModal();
  };

  const isValidTarget =
    !!currentLevel &&
    ((currentLevel.kind === "room" && currentLevel.id !== currentRoomId) ||
      (currentLevel.kind === "container" && currentLevel.id !== currentContainerId));

  const handleMove = async () => {
    if (!currentLevel || !isValidTarget) return;
    setMoving(true);
    try {
      const payload =
        currentLevel.kind === "room"
          ? { room_id: currentLevel.id, expected_updated_at: expectedUpdatedAt }
          : { container_id: currentLevel.id, expected_updated_at: expectedUpdatedAt };
      await api.post(`/app/item/${itemId}/move`, payload, authHeaders);
      backModal();
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? "Could not move this item.") : "Could not move this item.";
      Alert.alert("Error", message);
    } finally {
      setMoving(false);
    }
  };

  const title = currentLevel ? currentLevel.name : "Homes";

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerLeft: () =>
            path.length > 0 ? (
              <HeaderIconButton key="back" icon="chevron-left" color={colors.tint} onPress={goBack} />
            ) : (
              <HeaderTextButton key="cancel" title="Cancel" color={colors.textSecondary} onPress={goBack} />
            ),
          headerRight: () => {
            if (!isValidTarget) return undefined;
            return moving ? <ActivityIndicator /> : <HeaderTextButton title="Move" bold onPress={handleMove} />;
          },
        }}
      />

      {loadStatus === "loading" && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      )}

      {loadStatus === "error" && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.text }}>Something went wrong.</Text>
        </View>
      )}

      {loadStatus === "ready" && !currentLevel && (
        <FlatList
          data={homes ?? []}
          keyExtractor={(home) => String(home.id)}
          ListEmptyComponent={
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <Text style={{ color: colors.textSecondary }}>You don&apos;t have any homes yet.</Text>
            </View>
          }
          renderItem={({ item: home }) => (
            <TouchableOpacity
              onPress={() => openHome(home)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <MaterialCommunityIcons name="home-outline" size={28} color={colors.icon} />
              <Text style={{ marginLeft: 14, flex: 1, fontSize: 16, color: colors.text }}>{home.name}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      )}

      {loadStatus === "ready" && currentLevel && (
        <FlatList
          data={children ?? []}
          keyExtractor={(child) => `${child.type}-${child.id}`}
          ListEmptyComponent={
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <Text style={{ color: colors.textSecondary }}>This is empty.</Text>
            </View>
          }
          renderItem={({ item: child }) => <PlaceRow item={child} onPress={openChild} />}
        />
      )}
    </>
  );
}
