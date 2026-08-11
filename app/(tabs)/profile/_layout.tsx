import { setTransitioning } from "@/utils/modalNav";
import { Stack } from "expo-router";

const MODAL_SCREEN_OPTIONS = { presentation: "modal" as const, animation: "slide_from_bottom" as const };

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: true, animation: "none" }}
      screenListeners={{
        transitionStart: () => setTransitioning(true),
        transitionEnd: () => setTransitioning(false),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Profile" }} />
      <Stack.Screen name="SettingsScreen" options={{ title: "Account & Security" }} />
      <Stack.Screen name="ChangePasswordScreen" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="DeleteAccountScreen" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="edit-text" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="action-sheet" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="pick-option" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="trash" options={MODAL_SCREEN_OPTIONS} />
    </Stack>
  );
}
