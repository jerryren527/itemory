import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";
import { SettingsRow, SettingsSection } from "@/components/profile/SettingsSection";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/interceptors/axios";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext, useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [signingOut, setSigningOut] = useState(false);
  const colors = useThemeColors();

  const accountSubtitle = [
    state.capabilities.hasPassword && "Password",
    state.capabilities.hasGoogle && "Google",
    state.capabilities.hasApple && "Apple",
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await GoogleSignin.signOut();

      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      await api.post("/api/logout/", { refresh: refreshToken });
      await SecureStore.deleteItemAsync("refreshToken");
    } catch {
      // Even if the server-side logout call fails, still clear local session below.
    } finally {
      dispatch({ type: "LOGOUT" });
      setSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: handleSignOut },
    ]);
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

      <SettingsSection title="Account">
        <SettingsRow
          icon="shield-account-outline"
          label="Account & Security"
          subtitle={accountSubtitle || "Manage your login methods"}
          onPress={() => router.push("/(tabs)/profile/SettingsScreen")}
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow icon="information-outline" label="Version" trailingText={Constants.expoConfig?.version ?? "1.0.0"} />
      </SettingsSection>

      <SettingsSection>
        <SettingsRow icon="logout" label="Sign Out" destructive onPress={confirmSignOut} loading={signingOut} />
      </SettingsSection>
    </ScrollView>
  );
}
