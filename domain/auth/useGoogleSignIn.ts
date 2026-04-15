import { AuthContext } from "@/context/auth-context";
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import axios from "axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useContext } from "react";
import { AuthState } from "./authTypes";

const useGoogleSignIn = () => {
  const router = useRouter();
  const { dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log("🚀 ~response", response);

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;

        const body = {
          idToken: idToken,
        };

        const res = await axios.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/google-sign-in`, body, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("🚀 ~res.data.name:", res.data.name);
        console.log("🚀 ~res.data.email:", res.data.email);
        console.log("🚀 ~res.data.picture:", res.data.picture);

        console.log("🚀 ~res.data:", res.data);
        console.log("🚀 ~res.data.refresh_token:", res.data.refresh_token);
        console.log("🚀 ~res.data.access_token:", res.data.access_token);

        await SecureStore.setItemAsync("refreshToken", res.data.refresh_token);

        dispatch({
          type: "LOGIN_SUCCEEDED",
          payload: { accessToken: res.data.access_token, authProvider: "google" },
        });

        router.replace("/");
      }
    } catch (err) {
      // console.error("🚀 ~ useGoogleSignIn.ts:13 ~ handleGoogleSignIn ~ err:", err);
      throw err;
    }
  };

  return { handleGoogleSignIn };
};

export default useGoogleSignIn;
