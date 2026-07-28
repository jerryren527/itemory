import HeaderTextButton from "@/components/HeaderTextButton";
import { backModal } from "@/utils/modalNav";
import { consumePendingTextCallback } from "@/utils/textSelectionBridge";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardTypeOptions, TextInput, View } from "react-native";

export default function EditTextScreen() {
  const params = useLocalSearchParams<{
    title?: string;
    placeholder?: string;
    initialValue?: string;
    submitLabel?: string;
    multiline?: string;
    keyboardType?: string;
    autoCapitalize?: string;
    showClear?: string;
  }>();
  const [value, setValue] = useState(params.initialValue ?? "");

  const multiline = params.multiline === "true";
  const showClear = params.showClear === "true";
  const autoCapitalize = (params.autoCapitalize ?? "sentences") as "none" | "sentences" | "words" | "characters";

  const finish = (result: string) => {
    const callback = consumePendingTextCallback();
    callback?.(result);
    backModal();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: params.title || "Edit",
          headerLeft: () =>
            showClear ? (
              <HeaderTextButton title="Clear" color="#808080" onPress={() => finish("")} />
            ) : (
              <HeaderTextButton title="Cancel" color="#808080" onPress={backModal} />
            ),
          headerRight: () => (
            <HeaderTextButton title={params.submitLabel || "Save"} bold onPress={() => finish(value)} />
          ),
        }}
      />
      <View style={{ flex: 1, padding: 16 }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={params.placeholder}
          placeholderTextColor="grey"
          autoCapitalize={autoCapitalize}
          keyboardType={params.keyboardType as KeyboardTypeOptions | undefined}
          multiline={multiline}
          autoFocus
          returnKeyType={multiline ? "default" : "done"}
          style={{
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            minHeight: multiline ? 120 : undefined,
            textAlignVertical: multiline ? "top" : "center",
          }}
        />
      </View>
    </>
  );
}
