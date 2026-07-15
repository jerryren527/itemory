import PasswordLoginForm from "@/components/PasswordLoginForm";
import React from "react";
import { Text, View } from "react-native";

export default function PasswordLoginPage() {
  // Wrapper component that adds styling to PasswordLoginForm component
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Password Login Page</Text>
      <PasswordLoginForm />
    </View>
  );
}
