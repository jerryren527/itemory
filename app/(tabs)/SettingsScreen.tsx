import TextPromptModal from "@/components/TextPromptModal";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import axios from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Button, Platform, Text, View } from "react-native";

const SettingsScreen = () => {
  const router = useRouter();
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linking, setLinking] = useState<boolean>(false);
  const [unlinking, setUnlinking] = useState<boolean>(false);
  const [linkingApple, setLinkingApple] = useState<boolean>(false);
  const [unlinkingApple, setUnlinkingApple] = useState<boolean>(false);
  const [editingUsername, setEditingUsername] = useState<boolean>(false);
  const [savingUsername, setSavingUsername] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

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

        const res = await api.post(
          "/app/google/link",
          { idToken },
          { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
        );

        dispatch({ type: "GOOGLE_LINKED", payload: { email: res.data.google_email } });
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
      await api.post("/app/google/unlink", {}, { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } });

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

  const handleLinkApple = async () => {
    if (linkingApple) return;

    setLinkingApple(true);
    setErrorMessage(null);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });

      await api.post(
        "/app/apple/link",
        { identityToken: credential.identityToken },
        { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
      );

      dispatch({ type: "APPLE_LINKED" });
    } catch (err: any) {
      if (err?.code === "ERR_REQUEST_CANCELED") {
        // User dismissed the Apple sheet — no message needed
      } else if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Could not link Apple account.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLinkingApple(false);
    }
  };

  const handleSaveUsername = async (username: string) => {
    if (savingUsername) return;

    setSavingUsername(true);
    setUsernameError(null);

    try {
      await api.post(
        "/app/username",
        { username: username.trim() },
        { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
      );

      dispatch({ type: "USERNAME_SET", payload: { username: username.trim() } });
      setEditingUsername(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setUsernameError(err.response?.data?.message ?? "Could not update username.");
      } else {
        setUsernameError("Something went wrong. Please try again.");
      }
    } finally {
      setSavingUsername(false);
    }
  };

  const handleUnlinkApple = async () => {
    if (unlinkingApple) return;

    setUnlinkingApple(true);
    setErrorMessage(null);

    try {
      await api.post("/app/apple/unlink", {}, { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } });

      dispatch({ type: "APPLE_UNLINKED" });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Could not unlink Apple account.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setUnlinkingApple(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>Settings</Text>

      {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}

      <View style={{ alignItems: "center", gap: 4 }}>
        <Text style={{ color: "grey" }}>@{state.username}</Text>
        <Button title="Change Username" onPress={() => setEditingUsername(true)} />
      </View>

      <TextPromptModal
        visible={editingUsername}
        title="Change Username"
        placeholder="Username"
        initialValue={state.username ?? ""}
        autoCapitalize="none"
        loading={savingUsername}
        errorMessage={usernameError}
        onSubmit={handleSaveUsername}
        onCancel={() => {
          setEditingUsername(false);
          setUsernameError(null);
        }}
      />

      <Button
        title={state.capabilities.hasPassword ? "Change Password" : "Set Password"}
        onPress={() => router.push("/ChangePasswordScreen")}
      />

      {state.capabilities.hasGoogle ? (
        <View style={{ alignItems: "center", gap: 4 }}>
          <Text style={{ color: "grey" }}>{state.googleEmail}</Text>
          <Button title="Unlink Google" onPress={handleUnlinkGoogle} disabled={unlinking} />
        </View>
      ) : (
        <Button title="Link Google Account" onPress={handleLinkGoogle} disabled={linking} />
      )}

      {Platform.OS === "ios" &&
        (state.capabilities.hasApple ? (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ color: "grey" }}>Connected</Text>
            <Button title="Unlink Apple" onPress={handleUnlinkApple} disabled={unlinkingApple} />
          </View>
        ) : (
          <Button title="Link Apple Account" onPress={handleLinkApple} disabled={linkingApple} />
        ))}
    </View>
  );
};

export default SettingsScreen;
