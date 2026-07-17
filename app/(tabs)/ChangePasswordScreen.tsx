import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { AuthStyles } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useContext, useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";

const ChangePasswordScreen = () => {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
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

  // Apple-only accounts (no Google linked) may have an Apple private-relay email on
  // file, so they must supply a real email address when setting a password. Accounts
  // with Google linked already have a real email saved, so no email field is needed.
  const requiresEmail = !state.capabilities.hasGoogle && !state.capabilities.emailVerified;

  const handleSetPassword = async () => {
    if (settingPassword) return;

    if (state.capabilities.hasPassword && !oldPassword) {
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
          ...(state.capabilities.hasPassword && { old_password: oldPassword }),
          ...(requiresEmail && { email }),
          password,
          confirm_password: confirmPassword,
        },
        { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } },
      );

      const wasChangingExistingPassword = state.capabilities.hasPassword;

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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "600" }}>
        {state.capabilities.hasPassword ? "Change Password" : "Set Password"}
      </Text>

      {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
      {successMessage && <Text style={{ color: "green" }}>{successMessage}</Text>}

      <View style={{ alignItems: "center", gap: 8 }}>
        {requiresEmail && (
          <TextInput
            placeholder="Email"
            placeholderTextColor="grey"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            inputMode="email"
            style={{ borderWidth: 1, borderColor: "grey", borderRadius: 4, padding: 8, width: 220 }}
          />
        )}

        {state.capabilities.hasPassword && (
          <View style={{ ...AuthStyles.inputWithShowHide, width: 220 }}>
            <TextInput
              placeholder="Old Password"
              placeholderTextColor="grey"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry={hideOldPassword}
              style={{ flex: 1, color: "black", height: "100%", fontSize: 14 }}
            />
            <TouchableOpacity
              onPress={() => setHideOldPassword(!hideOldPassword)}
              style={{ height: "100%", justifyContent: "center" }}
            >
              <MaterialCommunityIcons name={hideOldPassword ? "eye-off" : "eye"} size={24} color="grey" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ ...AuthStyles.inputWithShowHide, width: 220 }}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="grey"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hidePassword}
            style={{ flex: 1, color: "black", height: "100%", fontSize: 14 }}
          />
          <TouchableOpacity
            onPress={() => setHidePassword(!hidePassword)}
            style={{ height: "100%", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name={hidePassword ? "eye-off" : "eye"} size={24} color="grey" />
          </TouchableOpacity>
        </View>

        <View style={{ ...AuthStyles.inputWithShowHide, width: 220 }}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="grey"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={hideConfirmPassword}
            style={{ flex: 1, color: "black", height: "100%", fontSize: 14 }}
          />
          <TouchableOpacity
            onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
            style={{ height: "100%", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name={hideConfirmPassword ? "eye-off" : "eye"} size={24} color="grey" />
          </TouchableOpacity>
        </View>

        <Button
          title={state.capabilities.hasPassword ? "Change Password" : "Set Password"}
          onPress={handleSetPassword}
          disabled={settingPassword}
        />
      </View>
    </View>
  );
};

export default ChangePasswordScreen;
