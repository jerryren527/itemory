import { AuthContext } from "@/context/auth-context";
import axios from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext } from "react";
import { AuthState } from "./authTypes";

const useAppleSignIn = () => {
  const router = useRouter();
  const { dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const handleAppleSignIn = async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    let res = await axios.post(
      `${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/apple-sign-in`,
      { identityToken: credential.identityToken },
      { headers: { "Content-Type": "application/json" } },
    );

    if (res.data.status === "new_apple_user") {
      // No account exists for this Apple ID yet — create one using the same identity token.
      res = await axios.post(
        `${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/apple/confirm`,
        { identityToken: credential.identityToken },
        { headers: { "Content-Type": "application/json" } },
      );
    }

    await SecureStore.setItemAsync("refreshToken", res.data.refresh_token);

    dispatch({
      type: "LOGIN_SUCCEEDED",
      payload: { accessToken: res.data.access_token, authProvider: "apple" },
    });

    router.replace("/");
  };

  return { handleAppleSignIn };
};

export default useAppleSignIn;
