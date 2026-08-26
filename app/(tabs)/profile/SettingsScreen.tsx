import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";
import { SettingsRow, SettingsSection } from "@/components/profile/SettingsSection";
import { GOOGLE_SIGNIN_CONFIG } from "@/constants";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/interceptors/axios";
import { pushModal } from "@/utils/modalNav";
import { setPendingTextCallback } from "@/utils/textSelectionBridge";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin";
import axios from "axios";
import * as AppleAuthentication from "expo-apple-authentication";
import { useContext, useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";

const SettingsScreen = () => {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const colors = useThemeColors();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [linking, setLinking] = useState<boolean>(false);
  const [unlinking, setUnlinking] = useState<boolean>(false);
  const [linkingApple, setLinkingApple] = useState<boolean>(false);
  const [unlinkingApple, setUnlinkingApple] = useState<boolean>(false);

  const showError = (err: unknown, fallback: string) => {
    const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? fallback) : fallback;
    Alert.alert("Error", message);
  };

  useEffect(() => {
    GoogleSignin.configure(GOOGLE_SIGNIN_CONFIG);
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

  const openUsernameEditor = () => {
    setPendingTextCallback(async (value) => {
      const username = value.trim();
      if (!username || username === state.username) return;

      try {
        await api.post(
          "/app/username",
          { username },
          { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
        );
        dispatch({ type: "USERNAME_SET", payload: { username } });
      } catch (err) {
        showError(err, "Could not update username.");
      }
    });

    pushModal({
      pathname: "/(tabs)/profile/edit-text",
      params: {
        title: "Change Username",
        placeholder: "Username",
        initialValue: state.username ?? "",
        submitLabel: "Save",
        autoCapitalize: "none",
      },
    });
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }} contentContainerStyle={{ paddingBottom: 40 }}>
      <ProfileHeaderCard
        username={state.username}
        email={state.email}
        emailVerified={state.capabilities.emailVerified}
        hasGoogle={state.capabilities.hasGoogle}
        hasApple={state.capabilities.hasApple}
      />

      {errorMessage && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: colors.destructiveBackground,
            borderRadius: 10,
            marginTop: 16,
            marginHorizontal: 16,
            paddingVertical: 10,
            paddingHorizontal: 14,
          }}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.destructive} />
          <Text style={{ color: colors.destructive, fontSize: 14, flex: 1 }}>{errorMessage}</Text>
        </View>
      )}

      <SettingsSection title="Profile">
        <SettingsRow
          icon="account-outline"
          label="Username"
          subtitle={state.username ? `@${state.username}` : "Not set"}
          onPress={openUsernameEditor}
        />
      </SettingsSection>

      <SettingsSection title="Security">
        <SettingsRow
          icon="lock-outline"
          label={state.capabilities.hasPassword ? "Change Password" : "Set Password"}
          onPress={() => pushModal("/(tabs)/profile/ChangePasswordScreen")}
        />
      </SettingsSection>

      <SettingsSection>
        <SettingsRow
          icon="account-remove-outline"
          label="Delete Account"
          destructive
          onPress={() => pushModal("/(tabs)/profile/DeleteAccountScreen")}
        />
      </SettingsSection>

      <SettingsSection title="Linked Accounts">
        <SettingsRow
          icon="google"
          label="Google"
          subtitle={state.capabilities.hasGoogle ? (state.googleEmail ?? "Connected") : "Not connected"}
          onPress={state.capabilities.hasGoogle ? handleUnlinkGoogle : handleLinkGoogle}
          loading={state.capabilities.hasGoogle ? unlinking : linking}
          showChevron={false}
          trailingText={state.capabilities.hasGoogle ? "Unlink" : "Connect"}
          trailingTextColor={state.capabilities.hasGoogle ? colors.destructive : colors.tint}
        />

        {Platform.OS === "ios" && (
          <SettingsRow
            icon="apple"
            label="Apple"
            subtitle={state.capabilities.hasApple ? "Connected" : "Not connected"}
            onPress={state.capabilities.hasApple ? handleUnlinkApple : handleLinkApple}
            loading={state.capabilities.hasApple ? unlinkingApple : linkingApple}
            showChevron={false}
            trailingText={state.capabilities.hasApple ? "Unlink" : "Connect"}
            trailingTextColor={state.capabilities.hasApple ? colors.destructive : colors.tint}
          />
        )}
      </SettingsSection>
    </ScrollView>
  );
};

export default SettingsScreen;
