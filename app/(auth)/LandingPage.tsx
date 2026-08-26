import { AuthButton } from "@/components/AuthButton";
import { AuthDivider } from "@/components/AuthDivider";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { AuthScreenContainer } from "@/components/AuthScreenContainer";
import { GOOGLE_SIGNIN_CONFIG } from "@/constants";
import useAppleSignIn from "@/domain/auth/useAppleSignIn";
import useGoogleSignIn from "@/domain/auth/useGoogleSignIn";
import { AuthSpacing, useAuthTheme } from "@/styles/auth.styles";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import axios, { HttpStatusCode } from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Platform, Text, View } from "react-native";

const LandingPage = () => {
  const router = useRouter();
  const { AuthStyles } = useAuthTheme();
  const { handleGoogleSignIn } = useGoogleSignIn();
  const { handleAppleSignIn } = useAppleSignIn();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    GoogleSignin.configure(GOOGLE_SIGNIN_CONFIG);
  }, []);

  const onPressGoogle = async () => {
    try {
      setErrorMessage(null);
      await handleGoogleSignIn();
    } catch (err: any) {
      console.log("🚀 ~ LandingPage.tsx:47 ~ onPressGoogle ~ err:", err);
      if (err?.status === HttpStatusCode.Conflict) {
        setErrorMessage(`${err?.response.data.message}`);
      } else if (axios.isAxiosError(err)) {
        if (err.response) {
          setErrorMessage(err.response.data?.message ?? `Sign-in failed (${err.response.status}).`);
        } else {
          setErrorMessage("Could not reach the server. Check your connection and try again.");
        }
      } else if (err?.code) {
        setErrorMessage(`Google sign-in failed: ${err.code}`);
      } else {
        setErrorMessage("Encountered an unknown error.");
      }
    }
  };

  const onPressApple = async () => {
    try {
      setErrorMessage(null);
      await handleAppleSignIn();
    } catch (err: any) {
      if (err?.code === "ERR_REQUEST_CANCELED") {
        // User dismissed the Apple sheet — no message needed
        return;
      }
      if (err?.code === "ERR_REQUEST_FAILED" || err?.code === "ERR_REQUEST_UNKNOWN") {
        console.log("🚀 ~ LandingPage.tsx ~ onPressApple ~ apple auth failed:", err);
        setErrorMessage("Apple Sign In is unavailable. Please try again.");
        return;
      }
      if (err?.isAxiosError) {
        console.log("🚀 ~ LandingPage.tsx ~ onPressApple ~ network/backend error:", err);
        setErrorMessage("Please check your internet connection.");
        return;
      }
      // SecureStore or unknown error
      console.log("🚀 ~ LandingPage.tsx ~ onPressApple ~ unexpected error:", {
        code: err?.code,
        message: err?.message,
        name: err?.constructor?.name,
      });
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthScreenContainer>
      <Image source={require("@/assets/images/icon.png")} style={AuthStyles.logoBadge} />
      <Text style={AuthStyles.title}>Itemory</Text>
      <Text style={AuthStyles.subtitle}>Organize everything you own</Text>

      <AuthErrorBanner message={errorMessage} />

      <AuthButton
        title="Sign Up"
        style={{ marginBottom: AuthSpacing.sm }}
        onPress={() => {
          setErrorMessage(null);
          router.push("./SignUpPage");
        }}
      />

      <AuthButton
        title="Log In"
        variant="secondary"
        onPress={() => {
          setErrorMessage(null);
          router.push("./LoginPage");
        }}
      />

      <AuthDivider label="or continue with" />

      <View style={AuthStyles.socialButtonsGroup}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={onPressGoogle}
        />

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={5}
            style={{ width: 192, height: 44 }}
            onPress={onPressApple}
          />
        )}
      </View>
    </AuthScreenContainer>
  );
};

export default LandingPage;
