import HeaderTextButton from "@/components/HeaderTextButton";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/interceptors/axios";
import { backModal } from "@/utils/modalNav";
import { useHeaderHeight } from "@react-navigation/elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "axios";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useContext, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const DeleteAccountScreen = () => {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const colors = useThemeColors();
  const headerHeight = useHeaderHeight();
  const [password, setPassword] = useState<string>("");
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const hasPassword = state.capabilities.hasPassword;

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setErrorMessage(null);

    try {
      await api.post(
        "/app/account/delete",
        { ...(hasPassword && { password }) },
        { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
      );

      try {
        await GoogleSignin.signOut();
      } catch {
        // Not necessarily signed in via Google — safe to ignore.
      }
      await SecureStore.deleteItemAsync("refreshToken");
      dispatch({ type: "LOGOUT" });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Could not delete account.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (deleting) return;

    if (hasPassword && !password) {
      setErrorMessage("Password is required.");
      return;
    }

    Alert.alert(
      "Delete Account",
      "This permanently deletes your account and cannot be undone. Homes only you belong to are deleted along with everything in them; shared homes stay intact for other members.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDeleteAccount },
      ],
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Delete Account",
          headerLeft: () => <HeaderTextButton title="Cancel" color={colors.textSecondary} onPress={backModal} />,
          headerRight: () =>
            deleting ? undefined : (
              <HeaderTextButton title="Delete" bold color={colors.destructive} onPress={confirmDelete} />
            ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
          <View style={bannerStyle(colors.destructiveBackground)}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.destructive} />
            <Text style={{ color: colors.destructive, fontSize: 14, flex: 1 }}>
              This permanently deletes your account and all of your data. This cannot be undone.
            </Text>
          </View>

          {errorMessage && (
            <View style={bannerStyle(colors.destructiveBackground)}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.destructive} />
              <Text style={{ color: colors.destructive, fontSize: 14, flex: 1 }}>{errorMessage}</Text>
            </View>
          )}

          {hasPassword && (
            <View>
              <Text style={[labelStyle, { color: colors.textSecondary }]}>Confirm Password</Text>
              <View style={[fieldStyle, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  secureTextEntry={hidePassword}
                  autoFocus
                  returnKeyType="done"
                  style={{ flex: 1, fontSize: 16, color: colors.text }}
                />
                <TouchableOpacity onPress={() => setHidePassword(!hidePassword)} hitSlop={10}>
                  <MaterialCommunityIcons
                    name={hidePassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {deleting && <ActivityIndicator color={colors.destructive} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const labelStyle = {
  fontSize: 13,
  fontWeight: "600" as const,
  marginBottom: 6,
  marginLeft: 2,
};

const fieldStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 8,
  borderWidth: 1,
  borderRadius: 12,
  paddingHorizontal: 14,
  height: 50,
};

const bannerStyle = (backgroundColor: string) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 8,
  backgroundColor,
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 14,
});

export default DeleteAccountScreen;
