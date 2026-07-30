// import AuthProvider from "@/context/auth-context";
// import { Redirect } from "expo-router";

import AuthProvider from "@/context/auth-context";
import { NavigationDarkTheme, NavigationLightTheme } from "@/constants/theme";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  // console.log("🚀 ~ROOT LAYOUT RENDERED");
  // TODO: Access the AuthContext here (we have access to it from the AuthProvider)
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={scheme === "dark" ? NavigationDarkTheme : NavigationLightTheme}>
        <AuthProvider>
          {/* TODO: conditionally render the main app or Login Page based on user authentcation state */}
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "none", // Android only
            }}
          />
          {/* <Slot /> */}
        </AuthProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
