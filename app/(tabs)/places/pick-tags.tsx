import HeaderTextButton from "@/components/HeaderTextButton";
import { useThemeColors } from "@/hooks/useThemeColors";
import { backModal } from "@/utils/modalNav";
import { consumePendingTagsCallback } from "@/utils/tagsSelectionBridge";
import { joinTags, parseTags } from "@/utils/tags";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PickTagsScreen() {
  const { tags: initialTags, title } = useLocalSearchParams<{ tags?: string; title?: string }>();
  const [tags, setTags] = useState<string[]>(() => parseTags(initialTags ?? "") ?? []);
  const [draft, setDraft] = useState("");
  const colors = useThemeColors();

  const finish = (result: string) => {
    const callback = consumePendingTagsCallback();
    callback?.(result);
    backModal();
  };

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  // Every space the user types commits the word before it as a chip; typing
  // (or pasting) multiple words at once commits all but the trailing partial word.
  const handleChangeText = (text: string) => {
    if (!text.includes(" ")) {
      setDraft(text);
      return;
    }
    const parts = text.split(" ");
    const trailing = parts.pop() ?? "";
    parts.forEach(addTag);
    setDraft(trailing);
  };

  const handleSubmitEditing = () => {
    addTag(draft);
    setDraft("");
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const pendingTags = draft.trim() ? [...tags, draft.trim()] : tags;
    finish(joinTags(pendingTags));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: title || "Tags",
          headerLeft: () => <HeaderTextButton title="Clear" color={colors.textSecondary} onPress={() => finish("")} />,
          headerRight: () => <HeaderTextButton title="Save" bold onPress={handleSave} />,
        }}
      />
      <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 8,
              minHeight: 44,
            }}
          >
            {tags.map((tag, index) => (
              <View
                key={`${tag}-${index}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: 16,
                  paddingVertical: 6,
                  paddingLeft: 12,
                  paddingRight: 8,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.tint }}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(index)} hitSlop={8}>
                  <MaterialCommunityIcons name="close" size={14} color={colors.tint} />
                </TouchableOpacity>
              </View>
            ))}

            <TextInput
              value={draft}
              onChangeText={handleChangeText}
              onSubmitEditing={handleSubmitEditing}
              submitBehavior="submit"
              placeholder={tags.length === 0 ? "Type a tag and press space or return" : "Add another"}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoFocus
              returnKeyType="done"
              style={{ flexGrow: 1, minWidth: 100, fontSize: 16, paddingVertical: 6, color: colors.text }}
            />
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </>
  );
}
