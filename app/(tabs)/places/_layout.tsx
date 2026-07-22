import { Stack } from "expo-router";

export default function PlacesLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, animation: "none" }}>
      <Stack.Screen name="index" options={{ title: "Places" }} />
      <Stack.Screen name="node/[nodeType]/[nodeId]" />
      <Stack.Screen name="search" options={{ title: "Search" }} />
    </Stack>
  );
}
