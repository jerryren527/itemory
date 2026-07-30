import { useAuthTheme } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type AuthErrorBannerProps = {
  message: string | null;
};

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  const { AuthColors, AuthStyles } = useAuthTheme();
  if (!message) return null;

  return (
    <View style={AuthStyles.errorBanner}>
      <MaterialCommunityIcons name="alert-circle" size={18} color={AuthColors.error} style={AuthStyles.errorBannerIcon} />
      <Text style={AuthStyles.errorBannerText}>{message}</Text>
    </View>
  );
}
