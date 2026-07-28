import { SheetAction } from "@/utils/actionSelectionBridge";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

type ActionRowsProps = {
  actions: SheetAction[];
  onSelect: (key: string) => void;
};

export default function ActionRows({ actions, onSelect }: ActionRowsProps) {
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
            borderTopColor: "#eee",
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
          }}
        >
          <MaterialCommunityIcons name={action.icon} size={20} color={action.destructive ? "#D32F2F" : "#555"} />
          <Text style={{ fontSize: 16, color: action.destructive ? "#D32F2F" : "black" }}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </>
  );
}
