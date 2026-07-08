import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

const SettingsScreen = () => {
  const router = useRouter();
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linking, setLinking] = useState<boolean>(false);
  const [unlinking, setUnlinking] = useState<boolean>(false);

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: "576724600295-1qvvi3u0t52o15eg1202mnc0phs9qejn.apps.googleusercontent.com",
      webClientId: "576724600295-o03u09d0l2jh5osvul7f1gci8l5r20m3.apps.googleusercontent.com",
      profileImageSize: 150,
    });
  }, []);

  const handleLinkGoogle = async () => {
    if (linking) return;

    setLinking(true);
    setErrorMessage(null);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;

        await api.post(
          "/app/google/link",
          { idToken },
          { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
        );

        dispatch({ type: "GOOGLE_LINKED" });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Could not link Google account.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (unlinking) return;

    setUnlinking(true);
    setErrorMessage(null);

    try {
      await api.post(
        "/app/google/unlink",
        {},
        { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
      );

      dispatch({ type: "GOOGLE_UNLINKED" });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Could not unlink Google account.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Settings</Text>

      {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}

      {state.capabilities.hasGoogle ? (
        <Button title="Unlink Google" onPress={handleUnlinkGoogle} disabled={unlinking} />
      ) : (
        <Button title="Link Google Account" onPress={handleLinkGoogle} disabled={linking} />
      )}

      <Button title="Back" onPress={() => router.back()} />
    </View>
  );
};

export default SettingsScreen;