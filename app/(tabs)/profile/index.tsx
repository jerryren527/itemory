import { HomeRowItem } from "@/components/places/HomeRow";
import ProfileHeaderCard from "@/components/profile/ProfileHeaderCard";
import { SettingsRow, SettingsSection } from "@/components/profile/SettingsSection";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/interceptors/axios";
import { setPendingOptionCallback } from "@/utils/optionSelectionBridge";
import { pushModal } from "@/utils/modalNav";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useContext, useState } from "react";
import { Alert, ScrollView } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [signingOut, setSigningOut] = useState(false);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [pendingTrashHomeId, setPendingTrashHomeId] = useState<string | null>(null);
  const colors = useThemeColors();

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

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

  const openTrash = async () => {
    if (loadingTrash) return;
    setLoadingTrash(true);
    try {
      const res = await api.get("/app/homes", authHeaders);
      const ownedHomes = (res.data.homes as HomeRowItem[]).filter((h) => h.is_creator);

      if (ownedHomes.length === 0) {
        Alert.alert("No Homes", "You don't own any homes, so there's no trash to manage.");
      } else if (ownedHomes.length === 1) {
        pushModal({ pathname: "/(tabs)/profile/trash", params: { homeId: String(ownedHomes[0].id) } });
      } else {
        setPendingOptionCallback((homeId) => setPendingTrashHomeId(homeId));
        pushModal({
          pathname: "/(tabs)/profile/pick-option",
          params: {
            title: "Choose a Home",
            options: JSON.stringify(ownedHomes.map((h) => ({ label: h.name, value: String(h.id) }))),
          },
        });
      }
    } catch {
      Alert.alert("Error", "Could not load your homes.");
    } finally {
      setLoadingTrash(false);
    }
  };

  // Mirrors the deferred-action pattern used by the Places tab: pushing a
  // follow-up modal synchronously from the picker's callback would race with
  // pick-option's own router.back() — apply it once this screen regains focus.
  useFocusEffect(
    useCallback(() => {
      if (!pendingTrashHomeId) return;
      const homeId = pendingTrashHomeId;
      setPendingTrashHomeId(null);
      pushModal({ pathname: "/(tabs)/profile/trash", params: { homeId } });
    }, [pendingTrashHomeId]),
  );

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

      <SettingsSection title="Places">
        <SettingsRow
          icon="trash-can-outline"
          label="Trash"
          subtitle="Recover or permanently delete rooms, containers, and items"
          onPress={openTrash}
          loading={loadingTrash}
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
