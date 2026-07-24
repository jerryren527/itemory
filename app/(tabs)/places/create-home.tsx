import HeaderTextButton from "@/components/HeaderTextButton";
import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { backModal } from "@/utils/modalNav";
import axios from "axios";
import { Stack } from "expo-router";
import { useContext, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";

export default function CreateHomeScreen() {
  const { state, dispatch } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  const handleCreate = async () => {
    if (!name.trim()) {
      setErrorMessage("Home name is required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await api.post("/app/create-home", { name: name.trim(), address: address.trim() || null }, authHeaders);

      if (state.primaryHome === null) {
        dispatch({ type: "PRIMARY_HOME_SET", payload: { primaryHome: res.data.id } });
      }
      backModal();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setErrorMessage(err.response.data?.message ?? "An unexpected error occurred.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add a Home",
          headerLeft: () => <HeaderTextButton title="Cancel" color="#808080" onPress={backModal} />,
          headerRight: () => (loading ? undefined : <HeaderTextButton title="Create" bold onPress={handleCreate} />),
        }}
      />
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}

        <View>
          <Text style={{ marginBottom: 6, color: "grey" }}>Home name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Home name"
            placeholderTextColor="grey"
            autoFocus
            returnKeyType="next"
            style={inputStyle}
          />
        </View>

        <View>
          <Text style={{ marginBottom: 6, color: "grey" }}>Address (optional)</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            placeholderTextColor="grey"
            returnKeyType="done"
            style={inputStyle}
          />
        </View>

        {loading && <ActivityIndicator />}
      </View>
    </>
  );
}

const inputStyle = {
  borderColor: "#ccc",
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
};
