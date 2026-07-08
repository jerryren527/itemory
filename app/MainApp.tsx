import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { useContext, useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import api from "../interceptors/axios";
import SplashScreen from "./SplashScreen";

const MainApp = () => {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext); // keep here for testing purposes.
  console.log("🚀 ~ MainApp.tsx:12 ~ MainApp ~ state:", state);
  const userState = state.userState;
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "576724600295-1qvvi3u0t52o15eg1202mnc0phs9qejn.apps.googleusercontent.com",
      webClientId: "576724600295-o03u09d0l2jh5osvul7f1gci8l5r20m3.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  const handleGoogleSignOut = async () => {
    const response = await GoogleSignin.signOut();
    dispatch({ type: "LOGOUT" });
    // Refreshing the page
  };

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // if (state.authProvider === "google") {
      //   const response = await GoogleSignin.signOut();
      // }
      // Always GoogleSignin.signOut(), even if the user authenticated via email/password and not Google sign-in. Because without this, the google account picker will not show and instead log in with the last google account that logged in.
      const googleResponse = await GoogleSignin.signOut();
      console.log("🚀 ~ MainApp.tsx:25 ~ handleLogout ~ googleResponse:", googleResponse);

      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      // console.log("🚀 ~ index.tsx:48 ~ handleLogout ~ refreshToken before logging out:", refreshToken);

      await api.post("/api/logout/", {
        refresh: refreshToken,
      });

      // await fakeLogout();
      // delete refresh token from securestore.
      await SecureStore.deleteItemAsync("refreshToken");

      const refreshToken2 = await SecureStore.getItemAsync("refreshToken");
      // console.log("🚀 ~ index.tsx:59 ~ handleLogout ~ refreshToken after logging out:", refreshToken2);

      dispatch({ type: "LOGOUT" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCall = async () => {
    try {
      const res = await api.get("/app/test-view", {
        headers: {
          Authorization: `Bearer ${state.tokens.accessToken}`,
        },
      });
    } catch (err) {
      console.log(err);

      // call logout endpoint, which runs simplejwt's logout view that blacklists the expired refresh token.
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        await api.post("/api/logout/", {
          refresh: refreshToken,
        });
      } catch (logoutErr) {}

      // Redirect user to login page.
      dispatch({ type: "LOGOUT" });
      // router.replace("/");
    }
  };

  return (
    <>
      {loading ? (
        <SplashScreen />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Main App UI</Text>
          <Button title="Logout" onPress={handleLogout} />
          <Button title="Test" onPress={handleTestCall} />
        </View>
      )}
    </>
  );
};

export default MainApp;
