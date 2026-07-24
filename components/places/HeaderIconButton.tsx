import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

type HeaderIconButtonProps = {
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
};

export default function HeaderIconButton({ onPress, icon = "plus", color = "#2563EB" }: HeaderIconButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={12} style={{ padding: 8 }}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </TouchableOpacity>
  );
}
