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

type HomeOption = { id: number; name: string; is_creator: boolean };

/** A level the user has drilled into within the modal's own internal navigation stack. */
type Level = { kind: "home" | "room" | "container"; id: number; name: string };

export default function MoveNodeScreen() {
  const { kind, nodeId, roomId, containerId, homeId, expectedUpdatedAt } = useLocalSearchParams<{
    kind: "item" | "container";
    nodeId: string;
    roomId?: string;
    containerId?: string;
    homeId?: string;
    expectedUpdatedAt?: string;
  }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const colors = useThemeColors();

  const [homes, setHomes] = useState<HomeOption[] | null>(null);
  // The Homes picker (an empty path) is only reachable by a home's creator -
  // a plain member's floor is the current home's room list, so their path
  // never legitimately goes below length 1. null until the initial /app/homes
  // fetch resolves which case applies.
  const [path, setPath] = useState<Level[] | null>(null);
  const [minPathLength, setMinPathLength] = useState(0);
  const [children, setChildren] = useState<PlaceRowItem[] | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [moving, setMoving] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const currentLevel = path && path.length > 0 ? path[path.length - 1] : undefined;
  const currentRoomId = roomId ? Number(roomId) : null;
  const currentContainerId = containerId ? Number(containerId) : null;

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const res = await api.get("/app/homes", authHeaders);
        if (cancelled) return;
        const list: HomeOption[] = res.data.homes.map((h: any) => ({ id: h.id, name: h.name, is_creator: h.is_creator }));
        setHomes(list);

        const home = list.find((h) => h.id === Number(homeId));
        const isOwner = home?.is_creator ?? false;
        setMinPathLength(isOwner ? 0 : 1);
        setPath(isOwner ? [] : [{ kind: "home", id: Number(homeId), name: home?.name ?? "" }]);
      } catch {
        if (!cancelled) setLoadStatus("error");
      }
    };
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (path === null) return;
    if (!currentLevel) {
      setLoadStatus("ready");
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadStatus((prev) => (prev === "ready" ? prev : "loading"));
      try {
        const res = await api.get(`/app/place-node/${currentLevel.kind}/${currentLevel.id}`, authHeaders);
        if (cancelled) return;
        setChildren(res.data.children);
        setLoadStatus("ready");
      } catch {
        if (!cancelled) setLoadStatus("error");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, currentLevel?.kind, currentLevel?.id]);

  const openHome = (home: HomeOption) => setPath([{ kind: "home", id: home.id, name: home.name }]);

  const openChild = (child: PlaceRowItem) => {
    if (child.type !== "room" && child.type !== "container") return;
    const level: Level = { kind: child.type, id: child.id, name: child.name };
    setPath((prev) => [...(prev ?? []), level]);
  };

  const goBack = () => {
    if (path && path.length > minPathLength) setPath((prev) => (prev ?? []).slice(0, -1));
    else backModal();
  };

  const isValidTarget =
    !!currentLevel &&
    ((currentLevel.kind === "room" && currentLevel.id !== currentRoomId) ||
      (currentLevel.kind === "container" && currentLevel.id !== currentContainerId)) &&
    // A container can't be moved directly into itself. (Moving it into one
    // of its own deeper descendants still slips past this client-side check,
    // but the backend rejects that with an explicit error.)
    !(kind === "container" && currentLevel.kind === "container" && currentLevel.id === Number(nodeId));

  const handleMove = async () => {
    if (!currentLevel || !isValidTarget) return;
    setMoving(true);
    try {
      const destinationKey =
        currentLevel.kind === "room" ? "room_id" : kind === "container" ? "parent_container_id" : "container_id";
      const payload = { [destinationKey]: currentLevel.id, expected_updated_at: expectedUpdatedAt };
      const endpoint = kind === "container" ? `/app/container/${nodeId}/move` : `/app/item/${nodeId}/move`;
      await api.post(endpoint, payload, authHeaders);
      backModal();
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? "Could not move this.") : "Could not move this.";
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
            path && path.length > minPathLength ? (
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
