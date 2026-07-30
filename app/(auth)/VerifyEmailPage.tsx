import { AuthButton } from "@/components/AuthButton";
import { AuthScreenContainer } from "@/components/AuthScreenContainer";
import { AuthColors, AuthStyles } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const VerifyEmailPage = () => {
  const router = useRouter();
  const local = useLocalSearchParams();

  return (
    <AuthScreenContainer>
      <View style={AuthStyles.iconBadge}>
        <MaterialCommunityIcons name="email-fast-outline" size={32} color={AuthColors.primary} />
      </View>
      <Text style={AuthStyles.title}>Verify Your Email Address</Text>
      <Text style={AuthStyles.subtitle}>
        We&apos;ve sent an email to {local.email} to verify your email address and activate your account. The link in the
        email will expire in 24 hours. You might need to check the Spam folder.
      </Text>

      <View style={AuthStyles.buttonRow}>
        <AuthButton title="Back" variant="secondary" onPress={() => router.back()} style={{ flex: 1 }} />
        <AuthButton title="Log In" onPress={() => router.replace("./LoginPage")} style={{ flex: 1 }} />
      </View>
    </AuthScreenContainer>
  );
};

export default VerifyEmailPage;
