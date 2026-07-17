import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { Redirect, Tabs } from "expo-router";
import { useContext } from "react";

export default function TabsLayout() {
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  if (state.userState !== "authenticated") {
    return <Redirect href="/" />;
  }

  return (
    <Tabs>
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="places" options={{ title: "Places" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
