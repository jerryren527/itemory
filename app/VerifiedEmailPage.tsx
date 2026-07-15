import { AuthStyles } from "@/styles/auth.styles";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const VerifiedEmailPage = () => {
  const router = useRouter();

  return (
    <View style={AuthStyles.screen}>
      <View style={AuthStyles.container}>
        <View style={AuthStyles.content}>
          <Text style={AuthStyles.title}>Email Verified</Text>
          <Text style={AuthStyles.subtitle}>Your email address was successfully verified.</Text>

          <Pressable
            style={{ ...AuthStyles.button, flex: 1 }}
            onPress={() => {
              router.push("./LoginPage");
            }}
          >
            <Text style={AuthStyles.buttonText}>Log In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default VerifiedEmailPage;
