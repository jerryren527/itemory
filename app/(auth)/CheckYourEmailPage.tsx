import useGoogleSignIn from "@/domain/auth/useGoogleSignIn";
import { AuthStyles } from "@/styles/auth.styles";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

const CheckYourEmailPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { handleGoogleSignIn } = useGoogleSignIn();
  console.log("🚀 ~🚀 ~ CheckYourEmailPage ~ params.email:", params.email);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "576724600295-1qvvi3u0t52o15eg1202mnc0phs9qejn.apps.googleusercontent.com",
      webClientId: "576724600295-o03u09d0l2jh5osvul7f1gci8l5r20m3.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  return (
    <View style={AuthStyles.screen}>
      <View style={AuthStyles.container}>
        <View style={AuthStyles.content}>
          <Text style={AuthStyles.title}>Check your email</Text>
          <Text style={AuthStyles.subtitle}>
            If an account exists for {params?.email ? <Text>{params?.email}</Text> : <Text>that email</Text>}, we've
            sent a password reset link.
          </Text>
          {/* <TextInput style={AuthStyles.input} placeholder="Email" /> */}
          {/* <TextInput style={AuthStyles.input} placeholder="Password" secureTextEntry /> */}
          <Pressable
            style={{ ...AuthStyles.button, marginBottom: 32 }}
            onPress={() => {
              router.push("./LoginPage");
            }}
          >
            <Text style={AuthStyles.buttonText}>Back to Log In</Text>
          </Pressable>

          <Text style={AuthStyles.subtitle}>This account may use Google sign-in instead.</Text>
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
          />
        </View>
      </View>
    </View>
  );
};

export default CheckYourEmailPage;
