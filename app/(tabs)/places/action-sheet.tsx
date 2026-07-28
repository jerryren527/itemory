import ActionRows from "@/components/places/ActionRows";
import { consumePendingActionCallback, SheetAction } from "@/utils/actionSelectionBridge";
import { backModal } from "@/utils/modalNav";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";

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
        <ActionRows actions={actions} onSelect={select} />
      </ScrollView>
    </>
  );
}
