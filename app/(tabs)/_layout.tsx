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
      <Tabs.Screen name="places" options={{ title: "Places", headerShown: false }} />
      <Tabs.Screen name="checked-out" options={{ title: "Checked Out", headerShown: false }} />
      <Tabs.Screen name="starred" options={{ title: "Starred", headerShown: false }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", headerShown: false }} />
    </Tabs>
  );
}
