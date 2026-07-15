import EmailLoginForm from "@/components/EmailLoginForm";
import React from "react";
import { Text, View } from "react-native";

export default function EmailLoginPage() {
  // Wrapper component that adds styling to EmailLoginForm component
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Email Login Page</Text>
      <EmailLoginForm />
    </View>
  );
}
