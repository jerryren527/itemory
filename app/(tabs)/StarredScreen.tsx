import PlaceRow, { PlaceRowItem } from "@/components/places/PlaceRow";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useContext, useMemo, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type SortOption = "name_asc" | "name_desc" | "date_new" | "date_old";

const SORT_LABELS: Record<SortOption, string> = {
  name_asc: "Name (A to Z)",
  name_desc: "Name (Z to A)",
  date_new: "Date Modified (New to Old)",
  date_old: "Date Modified (Old to New)",
};

const TYPE_RANK: Record<PlaceRowItem["type"], number> = { room: 0, container: 1, item: 2 };

type StarredItem = PlaceRowItem & { home_name?: string };

export default function StarredScreen() {
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const [items, setItems] = useState<StarredItem[] | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("name_asc");
  const [sortExpanded, setSortExpanded] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const loadStarred = async () => {
    try {
      const res = await api.get("/app/starred-nodes", authHeaders);
      setItems(res.data.results);
    } catch (err) {
      console.log("err", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStarred();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const sortedItems = useMemo(() => {
    if (!items) return [];
    const copy = [...items];
    switch (sortOption) {
      case "name_asc":
        copy.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        copy.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "date_new":
        copy.sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime());
        break;
      case "date_old":
        copy.sort((a, b) => new Date(a.updated_at!).getTime() - new Date(b.updated_at!).getTime());
        break;
    }
    // Stable resort: rooms lead, then containers, then items, preserving the
    // chosen sort's order within each group.
    copy.sort((a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type]);
    return copy;
  }, [items, sortOption]);

  const selectSort = (option: SortOption) => {
    setSortOption(option);
    setSortExpanded(false);
  };

  const handlePress = (item: PlaceRowItem) => {
    router.push({
      pathname: "/(tabs)/places/node/[nodeType]/[nodeId]",
      params: { nodeType: item.type, nodeId: String(item.id), name: item.name },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {items && items.length > 0 && (
        <View
          style={{
            marginHorizontal: 12,
            marginTop: 12,
            marginBottom: 8,
            alignSelf: "flex-start",
            position: "relative",
            zIndex: 10,
            elevation: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setSortExpanded((prev) => !prev)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: "#F1F3F4",
            }}
          >
            <MaterialCommunityIcons name="sort" size={16} color="#555" />
            <Text style={{ fontSize: 14 }}>{SORT_LABELS[sortOption]}</Text>
            <MaterialCommunityIcons name={sortExpanded ? "chevron-up" : "chevron-down"} size={16} color="#555" />
          </TouchableOpacity>

          {sortExpanded && (
            <View
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 4,
                minWidth: 240,
                borderRadius: 8,
                backgroundColor: "white",
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => selectSort(key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: key === sortOption ? "600" : "400" }}>
                    {SORT_LABELS[key]}
                  </Text>
                  {key === sortOption && <MaterialCommunityIcons name="check" size={16} color="#2563EB" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {items && items.length === 0 && (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <Text style={{ color: "grey" }}>Nothing starred yet.</Text>
        </View>
      )}

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => (
          <PlaceRow
            item={item}
            onPress={handlePress}
            subtitle={item.home_name}
            showDateModified={sortOption === "date_new" || sortOption === "date_old"}
          />
        )}
      />
    </View>
  );
}
