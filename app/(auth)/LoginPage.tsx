import { AuthButton } from "@/components/AuthButton";
import { AuthDivider } from "@/components/AuthDivider";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { AuthScreenContainer } from "@/components/AuthScreenContainer";
import { AuthTextField } from "@/components/AuthTextField";
import { GOOGLE_SIGNIN_CONFIG } from "@/constants";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import useAppleSignIn from "@/domain/auth/useAppleSignIn";
import useGoogleSignIn from "@/domain/auth/useGoogleSignIn";
import api from "@/interceptors/axios";
import { useAuthTheme } from "@/styles/auth.styles";
import { extractErrorMessage } from "@/utils/apiError";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import axios from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, Text, TextInput, View } from "react-native";

type LoginFormType = {
  identifier: string;
  password: string;
};

const LoginPage = () => {
  const router = useRouter();
  const { AuthStyles } = useAuthTheme();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const { handleGoogleSignIn } = useGoogleSignIn();
  const { handleAppleSignIn } = useAppleSignIn();
  const [loading, setLoading] = useState<boolean>(false);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    GoogleSignin.configure(GOOGLE_SIGNIN_CONFIG);
  }, []);

  const onSubmit = async (data: LoginFormType) => {
    if (loading) return; // prevents double taps

    setLoading(true);

    try {
      const res = await api.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setErrorMessage(null); // Clear any error message upon successful form submission

      const access = res.data.tokens?.access;
      const refresh = res.data.tokens?.refresh;

      const email = res.data?.email;
      const username = res.data?.username;
      const userId = res.data?.id;
      const hasPassword = res.data?.has_password;
      const emailVerified = res.data?.email_verified;
      const hasGoogle = res.data?.google_account_linked;
      const primaryHome = res.data?.primary_home;

      await SecureStore.setItemAsync("refreshToken", refresh);

      dispatch({
        type: "LOGIN_SUCCEEDED",
        payload: {
          email: email,
          username: username,
          userId: userId,
          hasPassword: hasPassword,
          emailVerified: emailVerified,
          hasGoogle: hasGoogle,
          accessToken: access,
          authProvider: "email",
          primaryHome: primaryHome,
        },
      });

      // reroute to (auth)/index.tsx
      router.replace("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setErrorMessage(extractErrorMessage(err.response.data, "Please check your input and try again."));
        } else if (err.request) {
          // If err.response is undefined, that means there was a network failure (when you turn wifi off on phone). But err.request still exists
          setErrorMessage("Please check your internet connection");
        } else {
          // Request never left due to configuration bug: invalid URL, missing env var. Axios throws before creating a request.
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onPressGoogle = async () => {
    try {
      setErrorMessage(null);
      await handleGoogleSignIn();
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        console.log("🚀 ~ LoginPage.tsx ~ onPressGoogle ~ network/backend error:", err);
        if (err.response) {
          setErrorMessage(err.response.data?.message ?? "Could not sign in with Google.");
        } else if (err.request) {
          setErrorMessage("Please check your internet connection.");
        } else {
          setErrorMessage(err.message);
        }
      } else if (err?.code) {
        console.log("🚀 ~ LoginPage.tsx ~ onPressGoogle ~ native error:", err);
        setErrorMessage(`Google sign-in failed: ${err.code}`);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
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
        console.log("🚀 ~ LoginPage.tsx ~ onPressApple ~ apple auth failed:", err);
        setErrorMessage("Apple Sign In is unavailable. Please try again.");
        return;
      }
      if (axios.isAxiosError(err)) {
        console.log("🚀 ~ LoginPage.tsx ~ onPressApple ~ network/backend error:", err);
        if (err.response) {
          setErrorMessage(err.response.data?.message ?? "Something went wrong. Please try again.");
        } else if (err.request) {
          // err.response is undefined but err.request exists: the request went out but no response came back (e.g. wifi off)
          setErrorMessage("Please check your internet connection.");
        } else {
          // Request never left due to a configuration bug: invalid URL, missing env var. Axios throws before creating a request.
          setErrorMessage(err.message);
        }
        return;
      }
      // SecureStore or unknown error
      console.log("🚀 ~ LoginPage.tsx ~ onPressApple ~ unexpected error:", {
        code: err?.code,
        message: err?.message,
        name: err?.constructor?.name,
      });
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <AuthScreenContainer onBack={() => router.replace("/")}>
      <Text style={AuthStyles.title}>Log In</Text>
      <Text style={AuthStyles.subtitle}>Welcome back. Log in to pick up where you left off.</Text>

      <AuthErrorBanner message={errorMessage} />

      <AuthTextField
        control={control}
        name="identifier"
        label="Email or Username"
        placeholder="Email or Username"
        icon="account-outline"
        rules={{
          required: {
            value: true,
            message: "Email or username is required.",
          },
        }}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        blurOnSubmit={false}
      />

      <AuthTextField
        ref={passwordRef}
        control={control}
        name="password"
        label="Password"
        placeholder="Password"
        icon="lock-outline"
        isPassword
        rules={{
          required: {
            value: true,
            message: "Password is required",
          },
        }}
        returnKeyType="done"
        onSubmitEditing={handleSubmit(onSubmit)}
      />

      <Text onPress={() => router.push("./ForgetPasswordPage")} style={[AuthStyles.linkText, { alignSelf: "flex-end", marginBottom: 20 }]}>
        Forgot Password?
      </Text>

      <AuthButton title="Log In" onPress={handleSubmit(onSubmit)} loading={loading} />

      <AuthDivider />

      <View style={AuthStyles.socialButtonsGroup}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={onPressGoogle}
          disabled={loading}
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

      <Text style={AuthStyles.link}>
        <Text style={AuthStyles.linkText}>Don&apos;t have an account? </Text>
        <Text style={[AuthStyles.linkText, AuthStyles.linkTextEmphasis]} onPress={() => router.push("./SignUpPage")}>
          Sign Up
        </Text>
      </Text>
    </AuthScreenContainer>
  );
};

export default LoginPage;
