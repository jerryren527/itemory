import { AuthColors, AuthStyles } from "@/styles/auth.styles";
import React from "react";
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleProp, Text, ViewStyle } from "react-native";

type AuthButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AuthButton({ title, onPress, variant = "primary", loading = false, disabled = false, style }: AuthButtonProps) {
  const isDisabled = disabled || loading;
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        AuthStyles.button,
        isSecondary && AuthStyles.buttonSecondary,
        pressed && !isDisabled && (isSecondary ? AuthStyles.buttonSecondaryPressed : AuthStyles.buttonPressed),
        isDisabled && !isSecondary && AuthStyles.buttonDisabled,
        isDisabled && isSecondary && { opacity: 0.5 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? AuthColors.primary : AuthColors.primaryText} />
      ) : (
        <Text style={[AuthStyles.buttonText, isSecondary && AuthStyles.buttonTextSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}
