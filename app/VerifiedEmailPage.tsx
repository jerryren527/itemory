import { AuthButton } from "@/components/AuthButton";
import { AuthScreenContainer } from "@/components/AuthScreenContainer";
import { AuthColors, AuthStyles } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const VerifiedEmailPage = () => {
  const router = useRouter();

  return (
    <AuthScreenContainer>
      <View style={AuthStyles.iconBadge}>
        <MaterialCommunityIcons name="check-decagram-outline" size={32} color={AuthColors.primary} />
      </View>
      <Text style={AuthStyles.title}>Email Verified</Text>
      <Text style={AuthStyles.subtitle}>Your email address was successfully verified.</Text>

      <AuthButton title="Log In" onPress={() => router.push("./LoginPage")} />
    </AuthScreenContainer>
  );
};

export default VerifiedEmailPage;
