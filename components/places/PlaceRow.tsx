import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export type PlaceRowItem = {
  id: number;
  name: string;
  type: "room" | "container" | "item";
  thumbnail?: string | null;
  quantity?: number | null;
  expiration_date?: string | null;
};

type PlaceRowProps = {
  item: PlaceRowItem;
  onPress: (item: PlaceRowItem) => void;
  subtitle?: string;
};

const ICON_BY_TYPE: Record<PlaceRowItem["type"], keyof typeof MaterialCommunityIcons.glyphMap> = {
  room: "home-outline",
  container: "archive-outline",
  item: "cube-outline",
};

export default function PlaceRow({ item, onPress, subtitle }: PlaceRowProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
      }}
    >
      <MaterialCommunityIcons name={ICON_BY_TYPE[item.type]} size={28} color="#555" />
      <View style={{ marginLeft: 14, flex: 1 }}>
        <Text style={{ fontSize: 16 }}>{item.name}</Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: "grey" }}>{subtitle}</Text>
        )}
        {item.type === "item" && item.quantity != null && (
          <Text style={{ fontSize: 13, color: "grey" }}>Qty: {item.quantity}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
