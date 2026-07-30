import HeaderTextButton from "@/components/HeaderTextButton";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import { useThemeColors } from "@/hooks/useThemeColors";
import api from "@/interceptors/axios";
import { backModal } from "@/utils/modalNav";
import { useHeaderHeight } from "@react-navigation/elements";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { Stack } from "expo-router";
import { useContext, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ChangePasswordScreen = () => {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const colors = useThemeColors();
  const headerHeight = useHeaderHeight();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [settingPassword, setSettingPassword] = useState<boolean>(false);
  const [hideOldPassword, setHideOldPassword] = useState<boolean>(true);
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState<boolean>(true);

  const hasPassword = state.capabilities.hasPassword;

  // Apple-only accounts (no Google linked) may have an Apple private-relay email on
  // file, so they must supply a real email address when setting a password. Accounts
  // with Google linked already have a real email saved, so no email field is needed.
  const requiresEmail = !state.capabilities.hasGoogle && !state.capabilities.emailVerified;

  const handleSetPassword = async () => {
    if (settingPassword) return;

    if (hasPassword && !oldPassword) {
      setErrorMessage("Old password is required.");
      return;
    }

    if (!password || password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (requiresEmail && !email) {
      setErrorMessage("Email is required.");
      return;
    }

    setSettingPassword(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.post(
        "/app/password/set",
        {
          ...(hasPassword && { old_password: oldPassword }),
          ...(requiresEmail && { email }),
          password,
          confirm_password: confirmPassword,
        },
        { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
      );

      const wasChangingExistingPassword = hasPassword;

      setEmail("");
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
      dispatch({ type: "PASSWORD_SET", payload: requiresEmail ? { email } : undefined });
      setSuccessMessage(wasChangingExistingPassword ? "Password changed successfully." : "Password set successfully.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(err.response?.data?.message ?? "Could not set password.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setSettingPassword(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: hasPassword ? "Change Password" : "Set Password",
          headerLeft: () => <HeaderTextButton title="Cancel" color={colors.textSecondary} onPress={backModal} />,
          headerRight: () =>
            settingPassword ? undefined : (
              <HeaderTextButton title="Save" bold onPress={handleSetPassword} />
            ),
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
          {errorMessage && (
            <View style={bannerStyle(colors.destructiveBackground)}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.destructive} />
              <Text style={{ color: colors.destructive, fontSize: 14, flex: 1 }}>{errorMessage}</Text>
            </View>
          )}

          {successMessage && (
            <View style={bannerStyle(colors.successBackground)}>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.success} />
              <Text style={{ color: colors.success, fontSize: 14, flex: 1 }}>{successMessage}</Text>
            </View>
          )}

          {requiresEmail && (
            <View>
              <Text style={[labelStyle, { color: colors.textSecondary }]}>Email</Text>
              <View style={[fieldStyle, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  inputMode="email"
                  autoFocus
                  returnKeyType="next"
                  style={{ flex: 1, fontSize: 16, color: colors.text }}
                />
              </View>
            </View>
          )}

          {hasPassword && (
            <PasswordField
              label="Old Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              hidden={hideOldPassword}
              onToggleHidden={() => setHideOldPassword(!hideOldPassword)}
              autoFocus={!requiresEmail}
            />
          )}

          <PasswordField
            label={hasPassword ? "New Password" : "Password"}
            value={password}
            onChangeText={setPassword}
            hidden={hidePassword}
            onToggleHidden={() => setHidePassword(!hidePassword)}
            autoFocus={!requiresEmail && !hasPassword}
          />

          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            hidden={hideConfirmPassword}
            onToggleHidden={() => setHideConfirmPassword(!hideConfirmPassword)}
          />

          {settingPassword && <ActivityIndicator color={colors.tint} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  hidden: boolean;
  onToggleHidden: () => void;
  autoFocus?: boolean;
};

function PasswordField({ label, value, onChangeText, hidden, onToggleHidden, autoFocus }: PasswordFieldProps) {
  const colors = useThemeColors();

  return (
    <View>
      <Text style={[labelStyle, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[fieldStyle, { borderColor: colors.border, backgroundColor: colors.surfaceAlt }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          secureTextEntry={hidden}
          autoFocus={autoFocus}
          returnKeyType="done"
          style={{ flex: 1, fontSize: 16, color: colors.text }}
        />
        <TouchableOpacity onPress={onToggleHidden} hitSlop={10}>
          <MaterialCommunityIcons name={hidden ? "eye-off-outline" : "eye-outline"} size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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

export default ChangePasswordScreen;
