import { AuthButton } from "@/components/AuthButton";
import { AuthDivider } from "@/components/AuthDivider";
import { AuthScreenContainer } from "@/components/AuthScreenContainer";
import useGoogleSignIn from "@/domain/auth/useGoogleSignIn";
import { useAuthTheme } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

const CheckYourEmailPage = () => {
  const router = useRouter();
  const { AuthColors, AuthStyles } = useAuthTheme();
  const params = useLocalSearchParams();
  const { handleGoogleSignIn } = useGoogleSignIn();

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "576724600295-1qvvi3u0t52o15eg1202mnc0phs9qejn.apps.googleusercontent.com",
      webClientId: "576724600295-o03u09d0l2jh5osvul7f1gci8l5r20m3.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  return (
    <AuthScreenContainer>
      <View style={AuthStyles.iconBadge}>
        <MaterialCommunityIcons name="email-check-outline" size={32} color={AuthColors.primary} />
      </View>
      <Text style={AuthStyles.title}>Check your email</Text>
      <Text style={AuthStyles.subtitle}>
        If an account exists for {params?.email ? <Text>{params?.email}</Text> : <Text>that email</Text>}, we&apos;ve
        sent a password reset link.
      </Text>

      <AuthButton title="Back to Log In" onPress={() => router.push("./LoginPage")} />

      <AuthDivider label="or" />

      <Text style={[AuthStyles.subtitle, { marginBottom: 12 }]}>This account may use Google sign-in instead.</Text>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleGoogleSignIn}
      />
    </AuthScreenContainer>
  );
};

export default CheckYourEmailPage;
