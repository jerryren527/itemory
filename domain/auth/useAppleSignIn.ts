import { AuthContext } from "@/context/auth-context";
import axios from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext } from "react";
import { Alert } from "react-native";
import { AuthState } from "./authTypes";

const useAppleSignIn = () => {
  const router = useRouter();
  const { dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);

  const completeSignIn = async (res: any) => {
    await SecureStore.setItemAsync("refreshToken", res.data.refresh_token);

    dispatch({
      type: "LOGIN_SUCCEEDED",
      payload: {
        accessToken: res.data.access_token,
        authProvider: "apple",
        email: res.data.email,
        userId: res.data.id,
        hasApple: res.data.apple_account_linked,
      },
    });

    router.replace("/");
  };

  // No account is linked to this Apple ID yet. Ask the user whether they're new
  // (create an account via apple/confirm) or already have an account under a
  // different sign-in method (send them to log in with email/password).
  const promptNewAppleUser = (identityToken: string) => {
    return new Promise<void>((resolve, reject) => {
      Alert.alert(
        "Welcome",
        "Is this your first time signing in, or do you have an existing account?",
        [
          {
            text: "I have an existing account",
            onPress: () => {
              router.push("./LoginPage");
              resolve();
            },
          },
          {
            text: "This is my first time",
            onPress: async () => {
              try {
                const res = await axios.post(
                  `${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/apple/confirm`,
                  { identityToken },
                  { headers: { "Content-Type": "application/json" } },
                );
                await completeSignIn(res);
                resolve();
              } catch (err) {
                reject(err);
              }
            },
          },
        ],
        { cancelable: false },
      );
    });
  };

  const handleAppleSignIn = async () => {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const res = await axios.post(
      `${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/app/apple-sign-in`,
      { identityToken: credential.identityToken },
      { headers: { "Content-Type": "application/json" } },
    );

    if (res.data.status === "new_apple_user") {
      await promptNewAppleUser(credential.identityToken as string);
      return;
    }

    await completeSignIn(res);
  };

  return { handleAppleSignIn };
};

export default useAppleSignIn;
