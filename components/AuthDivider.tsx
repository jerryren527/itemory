import { AuthStyles } from "@/styles/auth.styles";
import React from "react";
import { Text, View } from "react-native";

type AuthDividerProps = {
  label?: string;
};

export function AuthDivider({ label = "or" }: AuthDividerProps) {
  return (
    <View style={AuthStyles.dividerRow}>
      <View style={AuthStyles.dividerLine} />
      <Text style={AuthStyles.dividerText}>{label}</Text>
      <View style={AuthStyles.dividerLine} />
    </View>
  );
}
