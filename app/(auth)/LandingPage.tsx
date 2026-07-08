import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import useAppleSignIn from "@/domain/auth/useAppleSignIn";
import useGoogleSignIn from "@/domain/auth/useGoogleSignIn";
import { AuthStyles } from "@/styles/auth.styles";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { HttpStatusCode } from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useContext, useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

const LandingPage = () => {
  const router = useRouter();
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  console.log("🚀 ~ LandingPage.tsx:16 ~ LandingPage ~ state:", JSON.stringify(state, null, 2));
  const { handleGoogleSignIn } = useGoogleSignIn();
  const { handleAppleSignIn } = useAppleSignIn();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      // console.log("🚀 ~ LandingPage.tsx:24 ~ fetchToken ~ refreshToken:", refreshToken);
    };

    GoogleSignin.configure({
      iosClientId: "576724600295-1qvvi3u0t52o15eg1202mnc0phs9qejn.apps.googleusercontent.com",
      webClientId: "576724600295-o03u09d0l2jh5osvul7f1gci8l5r20m3.apps.googleusercontent.com",
      profileImageSize: 150,
    });

    // const fetchToken = async () => {
    //   try {
    //     const token = await SecureStore.getItemAsync("refreshToken");
    //   } catch (err) {}
    // };

    fetchToken();
  }, []);

  const onPressGoogle = async () => {
    try {
      setErrorMessage(null);
      await handleGoogleSignIn();
    } catch (err: any) {
      console.log("🚀 ~ LandingPage.tsx:47 ~ onPressGoogle ~ err:", err);
      if (err?.status === HttpStatusCode.Conflict) {
        setErrorMessage(`${err?.response.data.message}`);
        return;
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
    <View style={AuthStyles.screen}>
      <View style={AuthStyles.container}>
        <View style={AuthStyles.content}>
          <Text style={AuthStyles.title}>Itemory</Text>
          {/* <Text style={AuthStyles.subtitle}>Sign in to your account</Text> */}
          {/* <TextInput style={AuthStyles.input} placeholder="Email" /> */}
          {/* <TextInput style={AuthStyles.input} placeholder="Password" secureTextEntry /> */}
          <Pressable
            style={AuthStyles.button}
            onPress={() => {
              setErrorMessage(null);
              router.push("./SignUpPage");
            }}
          >
            <Text style={AuthStyles.buttonText}>Sign Up</Text>
          </Pressable>

          <Pressable
            style={AuthStyles.button}
            onPress={() => {
              setErrorMessage(null);
              router.push("./LoginPage");
            }}
          >
            <Text style={AuthStyles.buttonText}>Log In</Text>
          </Pressable>

          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={onPressGoogle}
            // disabled={}
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

          {/* <Pressable style={AuthStyles.link}>
            <Text style={AuthStyles.linkText}>Forgot password?</Text>
          </Pressable> */}
          {errorMessage && <Text>{errorMessage}</Text>}
        </View>
      </View>
    </View>
  );
};

export default LandingPage;
