import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { Redirect, router, Tabs } from "expo-router";
import { useContext } from "react";
import { Button } from "react-native";

export default function TabsLayout() {
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  if (state.userState !== "authenticated") {
    return <Redirect href="/" />;
  }

  return (
    <Tabs>
      <Tabs.Screen name="places" options={{ title: "Places", headerShown: false }} />
      <Tabs.Screen name="CheckedOutScreen" options={{ title: "Checked Out" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen
        name="SettingsScreen"
        options={{
          title: "Settings",
          href: null,
          headerShown: true,
          headerLeft: () => <Button title="Back" onPress={() => router.push("/profile")} />,
        }}
      />
      <Tabs.Screen
        name="ChangePasswordScreen"
        options={{
          title: "Password",
          href: null,
          headerShown: true,
          headerLeft: () => <Button title="Back" onPress={() => router.push("/SettingsScreen")} />,
        }}
      />
    </Tabs>
  );
}
