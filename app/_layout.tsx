// import AuthProvider from "@/context/auth-context";
// import { Redirect } from "expo-router";

import AuthProvider from "@/context/auth-context";
import { Stack } from "expo-router";

export default function RootLayout() {
  // console.log("🚀 ~ROOT LAYOUT RENDERED");
  // TODO: Access the AuthContext here (we have access to it from the AuthProvider)

  return (
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
  );
}
