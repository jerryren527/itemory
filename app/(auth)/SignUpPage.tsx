import { AuthButton } from "@/components/AuthButton";
import { AuthErrorBanner } from "@/components/AuthErrorBanner";
import { AuthScreenContainer } from "@/components/AuthScreenContainer";
import { AuthTextField } from "@/components/AuthTextField";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { AuthStyles } from "@/styles/auth.styles";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Text, TextInput } from "react-native";

type SignUpFormType = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const SignUpPage = () => {
  const { dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext); // keep here for testing purposes.

  const router = useRouter();
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const onSubmit = async (data: SignUpFormType) => {
    if (loading) return; // prevents double taps

    setLoading(true);

    try {
      await api.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/register`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setErrorMessage(null); // Clear any error message upon successful form submission

      // Use Expo Router navigation params to pass params to the page you are navigating to.
      router.push({
        pathname: "./VerifyEmailPage",
        params: { email: data.email },
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          setErrorMessage(err.response.data?.message);
        } else if (err.request) {
          setErrorMessage("Please check your internet connection");
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordValue = watch("password"); // watch a single form field

  return (
    <AuthScreenContainer onBack={() => router.replace("/")}>
      <Text style={AuthStyles.title}>Sign Up</Text>
      <Text style={AuthStyles.subtitle}>Create an account to start organizing your home.</Text>

      <AuthErrorBanner message={errorMessage} />

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
        returnKeyType="next"
        onSubmitEditing={() => usernameRef.current?.focus()}
        blurOnSubmit={false}
      />

      <AuthTextField
        ref={usernameRef}
        control={control}
        name="username"
        label="Username"
        placeholder="Username"
        icon="at"
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
        returnKeyType="next"
        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        blurOnSubmit={false}
      />

      <AuthTextField
        ref={confirmPasswordRef}
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm Password"
        icon="lock-check-outline"
        isPassword
        rules={{
          validate: (value: string) => value === passwordValue || "Passwords do not match.",
        }}
        returnKeyType="done"
        onSubmitEditing={handleSubmit(onSubmit)}
      />

      <AuthButton title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: 8 }} />

      <Text style={AuthStyles.link}>
        <Text style={AuthStyles.linkText}>Already have an account? </Text>
        <Text style={[AuthStyles.linkText, AuthStyles.linkTextEmphasis]} onPress={() => router.push("./LoginPage")}>
          Log In
        </Text>
      </Text>
    </AuthScreenContainer>
  );
};

export default SignUpPage;
