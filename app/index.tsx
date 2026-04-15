import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext, useEffect } from "react";
import LandingPage from "./(auth)/LandingPage";
import SplashScreen from "./SplashScreen";

// Landing Page
export default function Index() {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext); // keep here for testing purposes.
  const userState = state.userState;
  // console.log("🚀 ~ index.tsx:15 ~ Index ~ state:", JSON.stringify(state, null, 2));

  useEffect(() => {
    const fetchToken = async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      // console.log("🚀 ~ index.tsx:29 ~ fetchToken ~ refreshToken:", refreshToken);
    };

    fetchToken();
  }, []);

  switch (userState) {
    case "initializing":
      return <SplashScreen />;
    case "authenticated":
      return <Redirect href="./(tabs)/places" />;
    // return <MainApp />;
  }

  return (
    <>
      <LandingPage />
    </>
  );
}
