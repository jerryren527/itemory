import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="search/index" options={{ title: "Search" }} />
      <Tabs.Screen name="places/index" options={{ title: "Places" }} />
      <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
    </Tabs>
  );
}
