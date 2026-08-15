import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

export type HomeRowItem = {
  id: number;
  name: string;
  address: string | null;
  updated_at: string;
  is_primary: boolean;
  is_shared: boolean;
  is_creator: boolean;
  owner_username: string | null;
};

type HomeRowProps = {
  item: HomeRowItem;
  onPress: (item: HomeRowItem) => void;
  onMenuPress: (item: HomeRowItem) => void;
  showDateModified?: boolean;
};

export default function HomeRow({ item, onPress, onMenuPress, showDateModified }: HomeRowProps) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
        <MaterialCommunityIcons name="home-outline" size={28} color={colors.icon} />
        <View style={{ marginLeft: 14, flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 16, color: colors.text }}>{item.name}</Text>
            {item.is_primary && <MaterialCommunityIcons name="crown" size={16} color="#F5A623" />}
            {item.is_shared && (
              <MaterialCommunityIcons name="account-multiple-outline" size={16} color={colors.textSecondary} />
            )}
          </View>
          {showDateModified ? (
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              Modified: {new Date(item.updated_at).toLocaleString()}
            </Text>
          ) : (
            item.owner_username && (
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Owner: {item.owner_username}</Text>
            )
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onMenuPress(item)} hitSlop={12} style={{ padding: 16 }}>
        <MaterialCommunityIcons name="dots-vertical" size={22} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );
}
