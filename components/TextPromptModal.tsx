import { useEffect, useState } from "react";
import { ActivityIndicator, Button, Keyboard, KeyboardTypeOptions, Modal, Text, TextInput, View } from "react-native";

type TextPromptModalProps = {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  submitLabel?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  onClear?: () => void;
  errorMessage?: string | null;
  loading?: boolean;
};

export default function TextPromptModal({
  visible,
  title,
  placeholder,
  initialValue = "",
  submitLabel = "Save",
  autoCapitalize = "sentences",
  keyboardType,
  multiline,
  onSubmit,
  onCancel,
  onClear,
  errorMessage,
  loading,
}: TextPromptModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>{title}</Text>

          {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="grey"
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            multiline={multiline}
            autoFocus
            returnKeyType={multiline ? "default" : "done"}
            onSubmitEditing={multiline ? undefined : Keyboard.dismiss}
            style={{
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              minHeight: multiline ? 100 : undefined,
              textAlignVertical: multiline ? "top" : "center",
            }}
          />

          {loading ? (
            <ActivityIndicator />
          ) : (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              {onClear ? <Button title="Clear" onPress={onClear} color="#808080" /> : <View />}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button title="Cancel" onPress={onCancel} color="#808080" />
                <Button title={submitLabel} onPress={() => onSubmit(value)} />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
