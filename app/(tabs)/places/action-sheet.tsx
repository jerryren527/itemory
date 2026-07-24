import { consumePendingActionCallback, SheetAction } from "@/utils/actionSelectionBridge";
import { backModal } from "@/utils/modalNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export default function ActionSheetScreen() {
  const params = useLocalSearchParams<{ title?: string; actions?: string }>();
  const actions: SheetAction[] = params.actions ? JSON.parse(params.actions) : [];

  const select = (key: string) => {
    const callback = consumePendingActionCallback();
    callback?.(key);
    backModal();
  };

  return (
    <>
      <Stack.Screen options={{ title: params.title || "Actions" }} />
      <ScrollView style={{ flex: 1 }}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={action.key}
            onPress={() => select(action.key)}
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
      </ScrollView>
    </>
  );
}
