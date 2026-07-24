import { consumePendingOptionCallback } from "@/utils/optionSelectionBridge";
import { backModal } from "@/utils/modalNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";

type Option = { label: string; value: string };

export default function PickOptionScreen() {
  const params = useLocalSearchParams<{ title?: string; options?: string; value?: string }>();
  const options: Option[] = params.options ? JSON.parse(params.options) : [];

  const select = (value: string) => {
    const callback = consumePendingOptionCallback();
    callback?.(value);
    backModal();
  };

  return (
    <>
      <Stack.Screen options={{ title: params.title || "Select" }} />
      <ScrollView style={{ flex: 1 }}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => select(option.value)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderTopWidth: index === 0 ? 1 : 0,
              borderTopColor: "#eee",
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <Text style={{ fontSize: 16 }}>{option.label}</Text>
            {params.value === option.value && <MaterialCommunityIcons name="check" size={20} color="#2563EB" />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}
