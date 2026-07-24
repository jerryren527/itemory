import HeaderIconButton from "@/components/places/HeaderIconButton";
import PlaceRow, { PlaceRowItem } from "@/components/places/PlaceRow";
import SearchBar from "@/components/places/SearchBar";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { setPendingActionCallback, SheetAction } from "@/utils/actionSelectionBridge";
import { setPendingDateCallback } from "@/utils/dateSelectionBridge";
import { pushModal } from "@/utils/modalNav";
import { CATEGORY_OPTIONS, CreateNodeKind } from "@/utils/nodeFields";
import { setPendingOptionCallback } from "@/utils/optionSelectionBridge";
import { setPendingTagsCallback } from "@/utils/tagsSelectionBridge";
import { parseTags } from "@/utils/tags";
import { setPendingTextCallback } from "@/utils/textSelectionBridge";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

type ItemField = "name" | "description" | "comment" | "picture";

const ITEM_FIELD_CONFIG: Record<
  ItemField,
  { title: string; placeholder: string; keyboardType?: "number-pad" | "url"; multiline?: boolean }
> = {
  name: { title: "Rename Item", placeholder: "Name" },
  description: { title: "Edit Description", placeholder: "Description", multiline: true },
  comment: { title: "Edit Comment", placeholder: "Comment", multiline: true },
  picture: { title: "Edit Picture URL", placeholder: "https://..." },
};

type ItemCheckout = { user_id: number; username: string; quantity: number };

type NodeDetails = {
  name: string;
  description: string | null;
  picture: string | null;
  quantity?: number;
  available_quantity?: number;
  checkouts?: ItemCheckout[];
  can_manage_checkouts?: boolean;
  expiration_date?: string | null;
  category?: string | null;
  tags?: string[] | null;
  comment?: string | null;
  level?: number | null;
};

type NodeResponse = {
  node_details: NodeDetails;
  children: PlaceRowItem[];
};

type PendingAction =
  | { kind: "addChoice"; choice: CreateNodeKind }
  | { kind: "childAction"; child: PlaceRowItem; action: string }
  | { kind: "selfAction"; action: string };

function getItemFieldValue(item: NodeDetails, field: ItemField): string {
  switch (field) {
    case "name":
      return item.name;
    case "description":
      return item.description ?? "";
    case "comment":
      return item.comment ?? "";
    case "picture":
      return item.picture ?? "";
  }
}

export default function NodeScreen() {
  const { nodeType, nodeId, name } = useLocalSearchParams<{ nodeType: string; nodeId: string; name?: string }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [data, setData] = useState<NodeResponse | null>(null);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const loadNode = async (signal?: { cancelled: boolean }) => {
    setLoadStatus((prev) => (prev === "ready" ? prev : "loading"));

    try {
      const res = await api.get(`/app/place-node/${nodeType}/${nodeId}`, authHeaders);
      if (signal?.cancelled) return;
      setData(res.data);
      setLoadStatus("ready");
    } catch (err) {
      console.log("err", err);
      if (!signal?.cancelled) setLoadStatus((prev) => (prev === "ready" ? prev : "error"));
    }
  };

  useFocusEffect(
    useCallback(() => {
      const signal = { cancelled: false };
      loadNode(signal);
      return () => {
        signal.cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeType, nodeId]),
  );

  const title = data?.node_details?.name ?? name ?? "";

  const level = data?.node_details?.level;
  const canAddRoom = nodeType === "home";
  const canAddContainer = nodeType === "room" || (nodeType === "container" && typeof level === "number" && level < 5);
  const canAddItem = nodeType === "room" || nodeType === "container";
  const canAdd = canAddRoom || canAddContainer || canAddItem;

  const openCreateNode = (kind: CreateNodeKind) => {
    const parentKey =
      kind === "room"
        ? "home_id"
        : kind === "container"
          ? nodeType === "room"
            ? "room_id"
            : "parent_container_id"
          : nodeType === "room"
            ? "room_id"
            : "container_id";

    pushModal({
      pathname: "/(tabs)/places/create-node",
      params: { kind, parentKey, parentId: String(nodeId) },
    });
  };

  const openAddChoiceSheet = () => {
    setPendingActionCallback((choice) => setPendingAction({ kind: "addChoice", choice: choice as CreateNodeKind }));
    const actions: SheetAction[] = [
      { key: "container", label: "Add Container", icon: "archive-outline" },
      { key: "item", label: "Add Item", icon: "cube-outline" },
    ];
    pushModal({ pathname: "/(tabs)/places/action-sheet", params: { title: "Add", actions: JSON.stringify(actions) } });
  };

  const handleAddPress = () => {
    if (canAddRoom) openCreateNode("room");
    else if (canAddContainer) openAddChoiceSheet();
    else if (canAddItem) openCreateNode("item");
  };

  const handleItemFieldSubmit = async (field: ItemField, rawValue: string) => {
    if (field === "name" && !rawValue.trim()) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    try {
      if (field === "name") {
        await api.post(`/app/place-node/item/${nodeId}/rename`, { name: rawValue.trim() }, authHeaders);
      } else {
        await api.post(`/app/item/${nodeId}/update`, { [field]: rawValue.trim() || null }, authHeaders);
      }

      await loadNode();
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? "Something went wrong.") : "Something went wrong.";
      Alert.alert("Error", message);
    }
  };

  const openItemField = (item: NodeDetails, field: ItemField) => {
    const config = ITEM_FIELD_CONFIG[field];
    setPendingTextCallback((value) => handleItemFieldSubmit(field, value));
    pushModal({
      pathname: "/(tabs)/places/edit-text",
      params: {
        title: config.title,
        placeholder: config.placeholder,
        initialValue: getItemFieldValue(item, field),
        submitLabel: "Save",
        multiline: config.multiline ? "true" : "false",
        keyboardType: config.keyboardType,
        autoCapitalize: field === "picture" ? "none" : "sentences",
        showClear: field === "comment" || field === "description" ? "true" : "false",
      },
    });
  };

  const openQuantity = (item: NodeDetails) => {
    pushModal({
      pathname: "/(tabs)/places/edit-quantity",
      params: {
        itemId: String(nodeId),
        quantity: String(item.quantity ?? 1),
        availableQuantity: String(item.available_quantity ?? item.quantity ?? 1),
        checkouts: JSON.stringify(item.checkouts ?? []),
        canManageCheckouts: item.can_manage_checkouts ? "true" : "false",
      },
    });
  };

  const handleCategorySelect = async (value: string) => {
    try {
      await api.post(`/app/item/${nodeId}/update`, { category: value || null }, authHeaders);
      await loadNode();
    } catch {
      Alert.alert("Error", "Could not update category.");
    }
  };

  const openCategoryPicker = (item: NodeDetails) => {
    setPendingOptionCallback(handleCategorySelect);
    pushModal({
      pathname: "/(tabs)/places/pick-option",
      params: { title: "Category", value: item.category ?? "", options: JSON.stringify(CATEGORY_OPTIONS) },
    });
  };

  const handleDateSelect = async (value: string) => {
    try {
      await api.post(`/app/item/${nodeId}/update`, { expiration_date: value || null }, authHeaders);
      await loadNode();
    } catch {
      Alert.alert("Error", "Could not update expiration date.");
    }
  };

  const handleExpiresPress = () => {
    setPendingDateCallback(handleDateSelect);
    pushModal({
      pathname: "/(tabs)/places/pick-date",
      params: { value: data?.node_details?.expiration_date ?? "", title: "Expiration Date" },
    });
  };

  const handleTagsSelect = async (value: string) => {
    try {
      await api.post(`/app/item/${nodeId}/update`, { tags: parseTags(value) }, authHeaders);
      await loadNode();
    } catch {
      Alert.alert("Error", "Could not update tags.");
    }
  };

  const handleTagsPress = () => {
    setPendingTagsCallback(handleTagsSelect);
    pushModal({
      pathname: "/(tabs)/places/pick-tags",
      params: { tags: data?.node_details?.tags?.join(", ") ?? "", title: "Tags" },
    });
  };

  const openRenameChild = (child: PlaceRowItem) => {
    setPendingTextCallback(async (value) => {
      if (!value.trim()) {
        Alert.alert("Error", "Name is required.");
        return;
      }
      try {
        await api.post(`/app/place-node/${child.type}/${child.id}/rename`, { name: value.trim() }, authHeaders);
        await loadNode();
      } catch (err) {
        const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? "Something went wrong.") : "Something went wrong.";
        Alert.alert("Error", message);
      }
    });
    pushModal({
      pathname: "/(tabs)/places/edit-text",
      params: { title: `Rename "${child.name}"`, placeholder: "Name", initialValue: child.name, submitLabel: "Save" },
    });
  };

  const confirmDelete = (target: PlaceRowItem, onSuccess: () => void) => {
    Alert.alert("Delete", `Delete "${target.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post(`/app/place-node/${target.type}/${target.id}/delete`, {}, authHeaders);
            onSuccess();
          } catch {
            Alert.alert("Error", "Could not delete this.");
          }
        },
      },
    ]);
  };

  const handleDeleteChild = (child: PlaceRowItem) => confirmDelete(child, loadNode);

  const selfAsPlaceRowItem: PlaceRowItem = { id: Number(nodeId), name: title, type: "item" };
  const handleDeleteSelf = () => confirmDelete(selfAsPlaceRowItem, () => router.back());

  const openChildActionSheet = (child: PlaceRowItem) => {
    setPendingActionCallback((action) => setPendingAction({ kind: "childAction", child, action }));
    const actions: SheetAction[] = [
      { key: "rename", label: "Rename", icon: "pencil-outline" },
      { key: "delete", label: "Delete", icon: "delete-outline", destructive: true },
    ];
    pushModal({
      pathname: "/(tabs)/places/action-sheet",
      params: { title: child.name, actions: JSON.stringify(actions) },
    });
  };

  const openSelfActionSheet = () => {
    setPendingActionCallback((action) => setPendingAction({ kind: "selfAction", action }));
    const actions: SheetAction[] = [{ key: "delete", label: "Delete", icon: "delete-outline", destructive: true }];
    pushModal({ pathname: "/(tabs)/places/action-sheet", params: { title, actions: JSON.stringify(actions) } });
  };

  // The action-sheet screen's bridge callback only records *which* action was
  // picked; any follow-up push (e.g. to create-node or edit-text) runs here
  // once this screen regains focus (i.e. after action-sheet's own
  // router.back() has settled) — pushing synchronously from within the
  // callback would race with that pending pop.
  const handlePendingAction = useCallback(() => {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);

    if (action.kind === "addChoice") {
      openCreateNode(action.choice);
    } else if (action.kind === "childAction") {
      if (action.action === "rename") openRenameChild(action.child);
      else if (action.action === "delete") handleDeleteChild(action.child);
    } else if (action.kind === "selfAction") {
      if (action.action === "delete") handleDeleteSelf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAction]);

  useFocusEffect(
    useCallback(() => {
      handlePendingAction();
    }, [handlePendingAction]),
  );

  if (loadStatus === "loading") {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </>
    );
  }

  if (loadStatus === "error" || !data) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Something went wrong.</Text>
        </View>
      </>
    );
  }

  if (nodeType === "item") {
    const item = data.node_details;
    const categoryLabel = CATEGORY_OPTIONS.find((o) => o.value === (item.category ?? ""))?.label ?? "—";

    return (
      <>
        <Stack.Screen
          options={{
            title,
            headerRight: () => <HeaderIconButton icon="dots-vertical" color="#555" onPress={openSelfActionSheet} />,
          }}
        />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => openItemField(item, "name")}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}
          >
            <MaterialCommunityIcons name="cube-outline" size={32} color="#555" />
            <Text style={{ fontSize: 22, fontWeight: "600", flex: 1 }}>{item.name}</Text>
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => openItemField(item, "picture")}>
            {item.picture ? (
              <Image
                source={{ uri: item.picture }}
                style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 16, backgroundColor: "#eee" }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  height: 80,
                  borderRadius: 8,
                  marginBottom: 16,
                  backgroundColor: "#f5f5f5",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderStyle: "dashed",
                }}
              >
                <MaterialCommunityIcons name="image-plus-outline" size={22} color="#999" />
                <Text style={{ color: "grey", fontSize: 13, marginTop: 4 }}>Add Picture URL</Text>
              </View>
            )}
          </TouchableOpacity>

          <PressableDetailRow
            label="Description"
            value={item.description || "—"}
            onPress={() => openItemField(item, "description")}
          />
          <PressableDetailRow
            label="Quantity"
            value={
              item.available_quantity != null && item.available_quantity !== item.quantity
                ? `${item.available_quantity} of ${item.quantity ?? 1} available`
                : String(item.quantity ?? 1)
            }
            onPress={() => openQuantity(item)}
          />
          <PressableDetailRow label="Category" value={categoryLabel} onPress={() => openCategoryPicker(item)} />
          <PressableDetailRow label="Expires" value={item.expiration_date || "—"} onPress={handleExpiresPress} />
          <PressableDetailRow
            label="Tags"
            value={item.tags && item.tags.length > 0 ? item.tags.join(", ") : "—"}
            onPress={handleTagsPress}
          />
          <PressableDetailRow
            label="Comment"
            value={item.comment || "—"}
            onPress={() => openItemField(item, "comment")}
          />
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title, headerRight: canAdd ? () => <HeaderIconButton onPress={handleAddPress} /> : undefined }}
      />
      <SearchBar
        mode="link"
        placeholder={`Search in ${data.node_details.name}`}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/places/search",
            params: { originType: nodeType, originId: nodeId, originName: data.node_details.name },
          })
        }
      />
      <ScrollView>
        {data.children.map((child) => (
          <PlaceRow
            key={`${child.type}-${child.id}`}
            item={child}
            onPress={(rowItem) =>
              router.push({
                pathname: "/(tabs)/places/node/[nodeType]/[nodeId]",
                params: { nodeType: rowItem.type, nodeId: String(rowItem.id), name: rowItem.name },
              })
            }
            onMenuPress={openChildActionSheet}
          />
        ))}
      </ScrollView>
    </>
  );
}

function PressableDetailRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
      }}
    >
      <Text style={{ width: 100, color: "grey", fontSize: 14 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 14 }}>{value}</Text>
      <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />
    </TouchableOpacity>
  );
}
