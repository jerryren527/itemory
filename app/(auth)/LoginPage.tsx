import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import useGoogleSignIn from "@/domain/auth/useGoogleSignIn";
import api from "@/interceptors/axios";
import { AuthStyles } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuthFlowUI } from "../context/auth-flow-ui-context";
import SplashScreen from "../SplashScreen";

type LoginFormType = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    // watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // call useContext to use AuthContext
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const { isSubmitting, setIsSubmitting } = useAuthFlowUI();
  const { handleGoogleSignIn } = useGoogleSignIn();
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  // console.log("🚀 ~ LoginPage.tsx:40 ~ LoginPage ~ isSubmitting:", isSubmitting);
  // console.log("🚀 ~ LoginPage.tsx:41 ~ LandingPage ~ state:", JSON.stringify(state, null, 2));

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "576724600295-1qvvi3u0t52o15eg1202mnc0phs9qejn.apps.googleusercontent.com",
      webClientId: "576724600295-o03u09d0l2jh5osvul7f1gci8l5r20m3.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  const onSubmit = async (data: LoginFormType) => {
    // setIsSubmitting(true);
    // console.log("🚀 ~ LoginPage.tsx:53 ~ onSubmit ~ data:", data);
    if (loading) return; // prevents double taps

    setLoading(true);

    try {
      const res = await api.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      // const res = await fakeLoginSuccess();
      // const res = await fakeLoginFailure();
      // console.log("🚀 ~ LoginPage.tsx:63 ~ onSubmit ~ res:", res);
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
      console.log("🚀 ~ LoginPage.tsx:80 ~ onSubmit ~ primaryHome:", primaryHome);

      // TODO: save tokens to secure store and authContext
      // Saving refresh token to SecureStore.
      await SecureStore.setItemAsync("refreshToken", refresh);
      // setIsSubmitting(false);
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      // console.log("🚀 ~ LoginPage.tsx:80 ~ onSubmit ~ refreshToken:", refreshToken);

      // Saving both access and refresh tokens to authContext
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
      // console.error("🚀 ~ LoginPage.tsx:53 ~ onSubmit ~ err:", err);
      // setErrorMessage("Network error. Check your internet.");
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // console.log("🚀 ~ LoginPage.tsx:108 ~ onSubmit ~ err.response:", JSON.stringify(err.response, null, 2));
          // console.log("🚀 ~status:", err.response.status);
          // console.log("🚀 ~data:", err.response.data);
          console.log("🚀 ~ LoginPage.tsx:118 ~ onSubmit ~ err.response.data?.message:", err.response.data?.message);
          setErrorMessage(err.response.data?.message);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
      }}
    >
      {loading ? (
        <SplashScreen />
      ) : (
        <View style={AuthStyles.screen}>
          <View style={AuthStyles.container}>
            <Text style={AuthStyles.content}>{isSubmitting && "Is Submitting"}</Text>
            <Text style={AuthStyles.title}>Log In</Text>
            <View style={AuthStyles.content}>
              <Text>{errorMessage ? <Text style={{ color: "red" }}>{errorMessage}</Text> : null}</Text>
              {/* Email */}
              <View>
                <Text>Email{errors.email && <Text> ({errors.email.message})</Text>}</Text>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: "Email is required.",
                    },
                    pattern: {
                      value:
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      message: "Please enter a valid email",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="grey"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      style={AuthStyles.input}
                      inputMode="email"
                    />
                  )}
                  name="email"
                />
              </View>

              {/* Password */}
              <View>
                <Text>Password{errors.password && <Text> ({errors.password.message})</Text>}</Text>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: "Password is required",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ ...AuthStyles.inputWithShowHide }}>
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor="grey"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{ flex: 1, color: "black", height: "100%", fontSize: 14 }}
                        secureTextEntry={hidePassword}
                      />
                      <TouchableOpacity
                        onPress={() => setHidePassword(!hidePassword)}
                        style={{ height: "100%", justifyContent: "center" }}
                      >
                        <MaterialCommunityIcons name={hidePassword ? "eye-off" : "eye"} size={24} color="grey" />
                      </TouchableOpacity>
                    </View>
                  )}
                  name="password"
                />
              </View>

              <View style={{ flexDirection: "row", gap: 5 }}>
                <View style={{ flex: 1 }}>
                  <Button title="Back" onPress={() => router.replace("/")} color="#808080" disabled={loading} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Submit" onPress={handleSubmit(onSubmit)} disabled={loading} />
                </View>
              </View>

              <Text
                onPress={() => router.push("./ForgetPasswordPage")}
                style={{ ...AuthStyles.subtitle, marginTop: 10 }}
              >
                Forgot Password?
              </Text>
              <Text style={{ textAlign: "center", marginBottom: 32 }}>or</Text>

              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleSignIn}
                disabled={loading}
              />
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default LoginPage;
