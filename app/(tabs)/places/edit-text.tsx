import HeaderTextButton from "@/components/HeaderTextButton";
import HeaderIconButton from "@/components/places/HeaderIconButton";
import { useThemeColors } from "@/hooks/useThemeColors";
import { backModal } from "@/utils/modalNav";
import { consumePendingTextCallback } from "@/utils/textSelectionBridge";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditTextScreen() {
  const params = useLocalSearchParams<{
    title?: string;
    subtitle?: string;
    placeholder?: string;
    initialValue?: string;
    submitLabel?: string;
    multiline?: string;
    keyboardType?: string;
    autoCapitalize?: string;
    showClear?: string;
    maxLength?: string;
    cancelIcon?: string;
  }>();
  const [value, setValue] = useState(params.initialValue ?? "");
  const colors = useThemeColors();

  const multiline = params.multiline === "true";
  const showClear = params.showClear === "true";
  const autoCapitalize = (params.autoCapitalize ?? "sentences") as "none" | "sentences" | "words" | "characters";
  const isNumberPad = params.keyboardType === "number-pad";

  const finish = (result: string) => {
    const callback = consumePendingTextCallback();
    callback?.(result);
    backModal();
  };

  const handleChangeText = (text: string) => {
    setValue(isNumberPad ? text.replace(/[^0-9]/g, "") : text);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: params.title || "Edit",
          headerLeft: () =>
            params.cancelIcon ? (
              <HeaderIconButton
                icon={params.cancelIcon as any}
                color={colors.textSecondary}
                onPress={backModal}
              />
            ) : (
              <HeaderTextButton title="Cancel" color={colors.textSecondary} onPress={backModal} />
            ),
          headerRight: () => (
            <HeaderTextButton title={params.submitLabel || "Save"} bold onPress={() => finish(value)} />
          ),
        }}
      />
      <View style={{ flex: 1, padding: 16 }}>
        {params.subtitle && (
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 12 }}>{params.subtitle}</Text>
        )}
        <TextInput
          value={value}
          onChangeText={handleChangeText}
          placeholder={params.placeholder}
          placeholderTextColor={colors.textSecondary}
          autoCapitalize={autoCapitalize}
          keyboardType={params.keyboardType as KeyboardTypeOptions | undefined}
          maxLength={params.maxLength ? Number(params.maxLength) : undefined}
          multiline={multiline}
          autoFocus
          returnKeyType={multiline ? "default" : "done"}
          style={{
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            minHeight: multiline ? 120 : undefined,
            textAlignVertical: multiline ? "top" : "center",
            color: colors.text,
          }}
        />
        {showClear && (
          <TouchableOpacity
            onPress={() => finish("")}
            style={{ marginTop: 16, alignItems: "center", paddingVertical: 10 }}
          >
            <Text style={{ color: colors.destructive, fontSize: 16, fontWeight: "600" }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
