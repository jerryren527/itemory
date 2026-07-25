import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export type PlaceRowItem = {
  id: number;
  name: string;
  type: "room" | "container" | "item";
  thumbnail?: string | null;
  quantity?: number | null;
  expiration_date?: string | null;
  is_starred?: boolean;
  updated_at?: string;
};

type PlaceRowProps = {
  item: PlaceRowItem;
  onPress: (item: PlaceRowItem) => void;
  subtitle?: string;
  onMenuPress?: (item: PlaceRowItem) => void;
  onReturnPress?: (item: PlaceRowItem) => void;
  showDateModified?: boolean;
};

const ICON_BY_TYPE: Record<PlaceRowItem["type"], keyof typeof MaterialCommunityIcons.glyphMap> = {
  room: "home-outline",
  container: "archive-outline",
  item: "cube-outline",
};

export default function PlaceRow({
  item,
  onPress,
  subtitle,
  onMenuPress,
  onReturnPress,
  showDateModified,
}: PlaceRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
      }}
    >
      <TouchableOpacity
        onPress={() => onPress(item)}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
        }}
      >
        <MaterialCommunityIcons name={ICON_BY_TYPE[item.type]} size={28} color="#555" />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
            {item.is_starred && <MaterialCommunityIcons name="star" size={16} color="#F5A623" />}
          </View>
          {showDateModified && item.updated_at ? (
            <Text style={{ fontSize: 13, color: "grey" }}>Modified: {new Date(item.updated_at).toLocaleString()}</Text>
          ) : (
            subtitle && <Text style={{ fontSize: 13, color: "grey" }}>{subtitle}</Text>
          )}
          {item.type === "item" && item.quantity != null && (
            <Text style={{ fontSize: 13, color: "grey" }}>Qty: {item.quantity}</Text>
          )}
        </View>
      </TouchableOpacity>

      {onReturnPress && (
        <TouchableOpacity onPress={() => onReturnPress(item)} hitSlop={12} style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: "#2563EB", fontWeight: "600" }}>Return</Text>
        </TouchableOpacity>
      )}

      {onMenuPress && (
        <TouchableOpacity onPress={() => onMenuPress(item)} hitSlop={12} style={{ padding: 16 }}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color="#555" />
        </TouchableOpacity>
      )}
    </View>
  );
}
