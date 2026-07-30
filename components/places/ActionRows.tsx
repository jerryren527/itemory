import { SheetAction } from "@/utils/actionSelectionBridge";
import { useThemeColors } from "@/hooks/useThemeColors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

type ActionRowsProps = {
  actions: SheetAction[];
  onSelect: (key: string) => void;
};

export default function ActionRows({ actions, onSelect }: ActionRowsProps) {
  const colors = useThemeColors();
  return (
    <>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={action.key}
          onPress={() => onSelect(action.key)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderTopWidth: index === 0 ? 1 : 0,
            borderTopColor: colors.border,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name={action.icon}
            size={20}
            color={action.destructive ? colors.destructive : colors.icon}
          />
          <Text style={{ fontSize: 16, color: action.destructive ? colors.destructive : colors.text }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </>
  );
}
