import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

type GoogleUserType = {
  name: string | null;
  email: string | null;
  photo: string | null;
};

export default function GoogleLoginForm() {
  const [user, setUser] = useState<GoogleUserType>({ name: "kennis", email: "kennis.gmail", photo: "kennis.png" });
  const [googleName, setGoogleName] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [googlePicture, setGooglePicture] = useState<string | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "576724600295-1qvvi3u0t52o15eg1202mnc0phs9qejn.apps.googleusercontent.com",
      webClientId: "576724600295-o03u09d0l2jh5osvul7f1gci8l5r20m3.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  useEffect(() => {
    console.log("🚀 ~googleName:", googleName);
    console.log("🚀 ~googleEmail:", googleEmail);
    console.log("🚀 ~googlePicture:", googlePicture);
  }, [googleName, googleEmail, googlePicture]);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log("🚀 ~response", response);
      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        console.log("🚀 ~🚀 ~ handleGoogleSignIn ~ idToken:", idToken);

        // const { name, email, photo } = user;
        // console.log("🚀 ~🚀 ~ handleGoogleSignIn ~ photo:", photo);
        // console.log("🚀 ~🚀 ~ handleGoogleSignIn ~ email:", email);
        // console.log("🚀 ~🚀 ~ handleGoogleSignIn ~ name:", name);

        const body = {
          // googleName: name,
          // googleEmail: email,
          // googlePhoto: photo,`
          idToken: idToken,
        };

        console.log(
          "🚀 ~process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL:",
          process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL,
        );

        const res = await axios.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/google-sign-in`, body, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setGoogleName(res.data.name);
        setGoogleEmail(res.data.email);
        setGooglePicture(res.data.picture);

        console.log("🚀 ~res.data:", res.data);
      }
      // setIsSubmitting(false);
    } catch (error) {
      console.log("🚀 ~error:", error);
    }
  };

  const handleGoogleSignOut = async () => {
    const response = await GoogleSignin.signOut();
    console.log("🚀 ~response:", response);
    console.log("🚀 ~Setting user to kennis...");
    setUser({ name: "kennis", email: "kennis.gmail", photo: "kennis.png" });
  };

  return (
    <View>
      <Text>This is the Google Login Form</Text>
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} />
      <Button title="Sign out" onPress={handleGoogleSignOut} />
    </View>
  );
}
