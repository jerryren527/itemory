import { AuthStyles } from "@/styles/auth.styles";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const VerifyEmailPage = () => {
  const router = useRouter();
  const local = useLocalSearchParams();

  return (
    <View style={AuthStyles.screen}>
      <View style={AuthStyles.container}>
        <View style={AuthStyles.content}>
          <Text style={AuthStyles.title}>Verify Your Email Address</Text>
          <Text style={{ ...AuthStyles.subtitle, textAlign: "left" }}>
            We've sent an email to {local.email} to verify your email address and activate your account. The link in the
            email will expire in 24 hours. You might need to check the Spam folder.
          </Text>

          <View style={{ flexDirection: "row", gap: 5 }}>
            <Pressable
              style={{ ...AuthStyles.button, backgroundColor: "#808080", flex: 1 }}
              onPress={() => {
                router.back();
              }}
            >
              <Text style={AuthStyles.buttonText}>Back</Text>
            </Pressable>

            <Pressable
              style={{ ...AuthStyles.button, flex: 1 }}
              onPress={() => {
                router.replace("./LoginPage");
              }}
            >
              <Text style={AuthStyles.buttonText}>Log In</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default VerifyEmailPage;
