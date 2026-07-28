import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

type Member = {
  id: number;
  username: string;
};

export default function ManageAccessScreen() {
  const { homeId } = useLocalSearchParams<{ homeId: string }>();
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  useEffect(() => {
    let cancelled = false;

    const loadMembers = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const res = await api.get(`/app/home/${homeId}/members`, authHeaders);
        if (!cancelled) setMembers(res.data.members);
      } catch {
        if (!cancelled) setErrorMessage("Could not load members.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMembers();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeId]);

  const handleRemove = (member: Member) => {
    Alert.alert("Remove member", `Remove @${member.username} from this home?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post(`/app/home/${homeId}/remove-member`, { user_id: member.id }, authHeaders);
            setMembers((prev) => prev?.filter((m) => m.id !== member.id) ?? null);
          } catch {
            Alert.alert("Error", "Could not remove that member.");
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Manage Access" }} />
      <View style={{ flex: 1, padding: 16 }}>
        {errorMessage && <Text style={{ color: "red" }}>{errorMessage}</Text>}
        {loading && <ActivityIndicator />}

        {!loading && members && (
          <FlatList
            data={members}
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                }}
              >
                <Text style={{ fontSize: 16 }}>@{item.username}</Text>
                {/* Manage Access is creator-only, so the current user viewing this list
                    is always the creator — hide the remove control on their own row. */}
                {item.id !== state.userId && (
                  <TouchableOpacity onPress={() => handleRemove(item)} hitSlop={8}>
                    <MaterialCommunityIcons name="close" size={20} color="#D32F2F" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
      </View>
    </>
  );
}
