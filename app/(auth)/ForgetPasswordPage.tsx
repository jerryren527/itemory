import { AuthButton } from "@/components/AuthButton";
import { AuthScreenContainer } from "@/components/AuthScreenContainer";
import { AuthTextField } from "@/components/AuthTextField";
import { AuthStyles } from "@/styles/auth.styles";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import api from "../../interceptors/axios";

type ForgetPasswordFormType = {
  email: string;
};

const ForgetPasswordPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgetPasswordFormType) => {
    if (loading) return; // prevents double taps

    setLoading(true);

    try {
      await api.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/send-reset-password-email`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      router.push({
        pathname: "./CheckYourEmailPage",
        params: { email: data?.email },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log("🚀 ~message:", err.message);
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
    <AuthScreenContainer onBack={() => router.back()}>
      <Text style={AuthStyles.title}>Forgot your password?</Text>
      <Text style={AuthStyles.subtitle}>
        Enter the email address associated with your account. We&apos;ll send you a link to reset your password.
      </Text>

      <AuthTextField
        control={control}
        name="email"
        label="Email"
        placeholder="Email"
        icon="email-outline"
        inputMode="email"
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
        returnKeyType="done"
        onSubmitEditing={handleSubmit(onSubmit)}
      />

      <AuthButton title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: 8 }} />
    </AuthScreenContainer>
  );
};

export default ForgetPasswordPage;
