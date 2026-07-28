import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { AuthStyles } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import SplashScreen from "../SplashScreen";

type SignUpFormType = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const SignUpPage = () => {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext); // keep here for testing purposes.

  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // show/hide password
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  // show/hide confirPpassword
  const [hideConfirmPassword, setHideConfirmPassword] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const onSubmit = async (data: SignUpFormType) => {
    // console.log("🚀 ~data:", data);

    if (loading) return; // prevents double taps

    setLoading(true);

    try {
      const res = await api.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/register`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // await fakeSignupNetworkFailure();

      setErrorMessage(null); // Clear any error message upon successful form submission
      // console.log("🚀 ~res.data:", res.data);

      // Set the account email to context or something, as long as VerifyEmailPage gets the email.

      // Use Expo Router navigation params to pass params to the page you are navigating to.
      router.push({
        pathname: "./VerifyEmailPage",
        params: { email: data.email },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // console.log("🚀 ~message:", err.message);

        if (err.response) {
          // console.log("🚀 ~status:", err.response.status);
          // console.log("🚀 ~data:", err.response.data);
          // console.log("🚀 ~err.response.data.message:", err.response.data?.message);
          setErrorMessage(err.response.data?.message);
          // console.log("🚀 ~headers:", err.response.headers);
        } else if (err.request) {
          // console.log("🚀 ~request:", err.request);
        } else {
          // console.log("🚀 ~config:", err.config);
        }
      } else {
        console.log("🚀 ~ SignUpPage.tsx:86 ~ onSubmit ~ err:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const onPress = () => {
    // Testing: calling verify-email backend route
    // console.log("🚀 ~inside onPress");
  };

  const passwordValue = watch("password"); // watch a single form field

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
            <Text style={AuthStyles.title}>Sign Up</Text>
            <View style={AuthStyles.content}>
              <Text>{errorMessage ? <Text style={{ color: "red" }}>{errorMessage}</Text> : null}</Text>

              {/* Email */}
              <View>
                <Text>Email{errors.email?.message && <Text> ({errors.email.message})</Text>}</Text>
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

              {/* Username */}
              <View>
                <Text>Username{errors.username?.message && <Text> ({errors.username.message})</Text>}</Text>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: "Username is required.",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: "Username can only contain letters, numbers, and underscores.",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Username"
                      placeholderTextColor="grey"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      style={AuthStyles.input}
                      autoCapitalize="none"
                    />
                  )}
                  name="username"
                />
              </View>

              {/* Password */}
              <View>
                <Text>Password{errors.password?.message && <Text> ({errors.password.message})</Text>}</Text>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: "Password is required",
                    },
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters long",
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, // at least one uppercase letter, at least one number, at least one special character
                      message:
                        "Password must have at least one uppercase letter, at least one number, and at least one special character.",
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

              {/* Confirm Password */}
              <View>
                <Text>
                  Confirm Password{errors.confirmPassword?.message && <Text> ({errors.confirmPassword.message})</Text>}
                </Text>
                <Controller
                  control={control}
                  rules={{
                    validate: (value) => value === passwordValue || "Passwords do not match.",
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ ...AuthStyles.inputWithShowHide }}>
                      <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="grey"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        style={{ flex: 1, color: "black", height: "100%", fontSize: 14 }}
                        secureTextEntry={hideConfirmPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
                        style={{ height: "100%", justifyContent: "center" }}
                      >
                        <MaterialCommunityIcons name={hideConfirmPassword ? "eye-off" : "eye"} size={24} color="grey" />
                      </TouchableOpacity>
                    </View>
                  )}
                  name="confirmPassword"
                />
              </View>

              <View style={{ flexDirection: "row", gap: 5 }}>
                <View style={{ flex: 1 }}>
                  <Button title="Back" onPress={() => router.replace("/")} color="#808080" />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Submit" onPress={handleSubmit(onSubmit)} />
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default SignUpPage;
