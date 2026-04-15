import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import useGoogleSignIn from "@/domain/auth/useGoogleSignIn";
import { AuthStyles } from "@/styles/auth.styles";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useContext, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const LandingPage = () => {
  const router = useRouter();
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  console.log("🚀 ~ LandingPage.tsx:14 ~ LandingPage ~ state:", JSON.stringify(state, null, 2));
  const { handleGoogleSignIn } = useGoogleSignIn();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      // console.log("🚀 ~ LandingPage.tsx:20 ~ fetchToken ~ refreshToken:", refreshToken);
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
    } catch (err) {
      console.log("🚀 ~ LandingPage.tsx:39 ~ onPressGoogle ~ err:", err);
      setErrorMessage("Please check your internet connection.");
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
