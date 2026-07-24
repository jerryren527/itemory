import { Text, TouchableOpacity } from "react-native";

type HeaderTextButtonProps = {
  title: string;
  onPress: () => void;
  color?: string;
  bold?: boolean;
};

export default function HeaderTextButton({ title, onPress, color = "#2563EB", bold }: HeaderTextButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={12} style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
      <Text style={{ color, fontSize: 16, fontWeight: bold ? "600" : "400" }}>{title}</Text>
    </TouchableOpacity>
  );
}
