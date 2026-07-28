import PlaceRow, { PlaceRowItem } from "@/components/places/PlaceRow";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { pushModal } from "@/utils/modalNav";
import { setPendingOptionCallback } from "@/utils/optionSelectionBridge";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

type SortOption = "name_asc" | "name_desc";

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: "Name (A to Z)",
  name_desc: "Name (Z to A)",
};

type CheckedOutItem = PlaceRowItem & { home_name?: string };

export default function CheckedOutScreen() {
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const [items, setItems] = useState<CheckedOutItem[] | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("name_asc");
  const [returningIds, setReturningIds] = useState<Set<number>>(new Set());

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const loadCheckedOut = async () => {
    try {
      const res = await api.get("/app/checked-out-items", authHeaders);
      setItems(res.data.results);
    } catch (err) {
      console.log("err", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCheckedOut();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const sortedItems = useMemo(() => {
    if (!items) return [];
    const copy = [...items];
    copy.sort((a, b) => (sortOption === "name_asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    return copy;
  }, [items, sortOption]);

  const toggleSort = () => {
    setSortOption((prev) => (prev === "name_asc" ? "name_desc" : "name_asc"));
  };

  const handlePress = (item: PlaceRowItem) => {
    router.push({
      pathname: "/(tabs)/checked-out/node/[nodeType]/[nodeId]",
      params: { nodeType: "item", nodeId: String(item.id), name: item.name },
    });
  };

  const handleReturn = (item: CheckedOutItem) => {
    if (returningIds.has(item.id)) return;

    const checkedOutQuantity = item.quantity ?? 0;

    setPendingOptionCallback(async (value) => {
      const quantity = Number(value);
      setReturningIds((prev) => new Set(prev).add(item.id));
      try {
        await api.post(`/app/item/${item.id}/return`, { quantity }, authHeaders);
        if (quantity >= checkedOutQuantity) {
          setItems((prev) => prev?.filter((i) => i.id !== item.id) ?? null);
        } else {
          setItems((prev) => prev?.map((i) => (i.id === item.id ? { ...i, quantity: checkedOutQuantity - quantity } : i)) ?? null);
        }
      } catch (err) {
        console.log("err", axios.isAxiosError(err) ? err.response?.data : err);
      } finally {
        setReturningIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    });

    pushModal({
      pathname: "/(tabs)/checked-out/pick-option",
      params: {
        title: "Return Quantity",
        value: String(checkedOutQuantity),
        options: JSON.stringify(
          Array.from({ length: checkedOutQuantity }, (_, i) => ({ label: String(i + 1), value: String(i + 1) })),
        ),
        layout: "centered",
      },
    });
  };

  return (
    <>
      {items && items.length > 0 && (
        <TouchableOpacity
          onPress={toggleSort}
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 6,
            marginHorizontal: 12,
            marginTop: 12,
            marginBottom: 8,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 16,
            backgroundColor: "#F1F3F4",
          }}
        >
          <MaterialCommunityIcons
            name={sortOption === "name_asc" ? "sort-alphabetical-ascending" : "sort-alphabetical-descending"}
            size={16}
            color="#555"
          />
          <Text style={{ fontSize: 14 }}>{SORT_LABELS[sortOption]}</Text>
        </TouchableOpacity>
      )}

      {items && items.length === 0 && (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: "grey" }}>Nothing checked out.</Text>
        </View>
      )}

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PlaceRow
            item={item}
            onPress={handlePress}
            subtitle={item.home_name}
            onReturnPress={returningIds.has(item.id) ? undefined : handleReturn}
          />
        )}
        ListFooterComponent={
          returningIds.size > 0 ? (
            <View style={{ paddingVertical: 12, alignItems: "center" }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </>
  );
}
