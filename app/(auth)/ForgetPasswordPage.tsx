import { AuthStyles } from "@/styles/auth.styles";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native";
import api from "../../interceptors/axios";
import SplashScreen from "../SplashScreen";

type ForgetPasswordFormType = {
  email: string;
};

const ForgetPasswordPage = () => {
  const router = useRouter();
  // const [emailInput, setEmailInput] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgetPasswordFormType) => {
    console.log("🚀 ~FORGETPASSWORDPAGE data:", data);
    if (loading) return; // prevents double taps

    setLoading(true);

    try {
      const res = await api.post(
        `${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/send-reset-password-email`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("🚀 ~res.data?.message:", res.data?.message);

      router.push({
        pathname: "./CheckYourEmailPage",
        params: { email: data?.email },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("🚀 ~message:", err.message);

        if (err.response) {
          console.log("🚀 ~status:", err.response.status);
          console.log("🚀 ~data:", err.response.data);
          console.log("🚀 ~err.response.data:", err.response.data?.message);
          console.log("🚀 ~headers:", err.response.headers);
        } else if (err.request) {
          console.log("🚀 ~request:", err.request);
        } else {
          console.log("🚀 ~config:", err.config);
        }
      }

      // Navigate to next screen even if email does not exist.
      router.push({
        pathname: "./CheckYourEmailPage",
        params: { email: data?.email },
      });
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
            <View style={AuthStyles.content}>
              <Text style={AuthStyles.title}>Forgot your password?</Text>
              <Text style={AuthStyles.subtitle}>
                Enter the email address associated with your account. We'll send you a link to reset your password.
              </Text>

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

              <View style={{ flexDirection: "row", gap: 5 }}>
                <View style={{ flex: 1 }}>
                  <Button title="Back" onPress={() => router.back()} color="#808080" />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Submit" onPress={handleSubmit(onSubmit)} />
                </View>
              </View>

              {/* <TextInput
            placeholder="Email Addresss"
            style={AuthStyles.input}
            onChangeText={(text) => setEmailInput(text)}
            value={emailInput}
          /> */}

              {/* <Pressable style={AuthStyles.button} onPress={handleSubmit(onSubmit)}> */}
              {/* <Pressable style={AuthStyles.button} onPress={() => handleSubmit(onSubmit)}>
            <Text style={AuthStyles.buttonText}>Send Reset Link</Text>
          </Pressable> */}
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default ForgetPasswordPage;
