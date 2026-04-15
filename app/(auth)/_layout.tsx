import { Slot } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import AuthFlowUIProvider from "../context/auth-flow-ui-context";

// TODO: create Auth
export default function AuthLayout() {
  // console.log("🚀 ~inside app/(auth)/_layout");
  // console.log("🚀 ~AUTH LAYOUT RENDERED");

  return (
    <AuthFlowUIProvider>
      <Slot />
      {/* <Stack
        screenOptions={{
          headerShown: false,
          // headerBackVisible: false, // usually true by default
          // headerLeft: ({ canGoBack, label }) => {
          //   return <BackButton canGoBack={canGoBack} label={label} />;
          // },
        }}
      /> */}
    </AuthFlowUIProvider>
  );
}

const styles = StyleSheet.create({});
