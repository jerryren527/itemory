import { Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

type SearchScope = "folder" | "everywhere";

type SearchScopeToggleProps = {
  scope: SearchScope;
  onChange: (scope: SearchScope) => void;
  folderLabel: string;
};

export default function SearchScopeToggle({ scope, onChange, folderLabel }: SearchScopeToggleProps) {
  return (
    <View style={{ flexDirection: "row", marginHorizontal: 12, marginBottom: 8 }}>
      <Chip label={folderLabel} active={scope === "folder"} onPress={() => onChange("folder")} />
      <Chip label="All homes" active={scope === "everywhere"} onPress={() => onChange("everywhere")} />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: active ? colors.tint : colors.surfaceAlt,
      }}
    >
      <Text style={{ color: active ? "white" : colors.text, fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}
