import { consumePendingOptionCallback } from "@/utils/optionSelectionBridge";
import { backModal } from "@/utils/modalNav";
import { useThemeColors } from "@/hooks/useThemeColors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Option = { label: string; value: string };

export default function PickOptionScreen() {
  const params = useLocalSearchParams<{ title?: string; options?: string; value?: string; layout?: string }>();
  const options: Option[] = params.options ? JSON.parse(params.options) : [];
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const select = (value: string) => {
    const callback = consumePendingOptionCallback();
    callback?.(value);
    backModal();
  };

  const isCentered = params.layout === "centered";

  return (
    <>
      <Stack.Screen options={{ title: params.title || "Select" }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {isCentered
          ? options.map((option, index) => {
              const selected = params.value === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => select(option.value)}
                  style={{
                    paddingVertical: 14,
                    borderTopWidth: index === 0 ? 1 : 0,
                    borderTopColor: colors.border,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: selected ? colors.surfaceAlt : undefined,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      textAlign: "center",
                      fontWeight: selected ? "700" : "400",
                      color: selected ? colors.tint : colors.text,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })
          : options.map((option, index) => (
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
                  borderTopColor: colors.border,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>{option.label}</Text>
                {params.value === option.value && (
                  <MaterialCommunityIcons name="check" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
      </ScrollView>
    </>
  );
}
