import { setTransitioning } from "@/utils/modalNav";
import { Stack } from "expo-router";

const MODAL_SCREEN_OPTIONS = { presentation: "modal" as const, animation: "slide_from_bottom" as const };

export default function StarredLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: true, animation: "none" }}
      screenListeners={{
        transitionStart: () => setTransitioning(true),
        transitionEnd: () => setTransitioning(false),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Starred" }} />
      <Stack.Screen name="node/[nodeType]/[nodeId]" />
      <Stack.Screen name="search" options={{ title: "Search" }} />
      <Stack.Screen name="pick-date" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="pick-tags" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="edit-text" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="pick-option" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="action-sheet" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="photo" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="create-node" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="edit-quantity" options={MODAL_SCREEN_OPTIONS} />
      <Stack.Screen name="move-node" options={MODAL_SCREEN_OPTIONS} />
    </Stack>
  );
}
