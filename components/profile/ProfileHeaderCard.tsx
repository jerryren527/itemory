import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

const AVATAR_COLORS = ["#2563EB", "#7C3AED", "#DB2777", "#DC2626", "#D97706", "#059669", "#0891B2"];

function colorForString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = value.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsForString(value: string) {
  return value.trim().slice(0, 1).toUpperCase() || "?";
}

type ProfileHeaderCardProps = {
  username: string | null;
  email: string | null;
  emailVerified: boolean | null;
  hasGoogle: boolean | null;
  hasApple: boolean | null;
};

export default function ProfileHeaderCard({
  username,
  email,
  emailVerified,
  hasGoogle,
  hasApple,
}: ProfileHeaderCardProps) {
  const displayName = username ?? email ?? "there";
  const avatarSeed = username ?? email ?? "?";

  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 16,
        marginHorizontal: 16,
        marginTop: 16,
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          backgroundColor: colorForString(avatarSeed),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 34, fontWeight: "600", color: "white" }}>{initialsForString(avatarSeed)}</Text>
      </View>

      <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 14 }}>
        {username ? `@${username}` : displayName}
      </Text>

      {email && (
        <Text style={{ fontSize: 14, color: "grey", marginTop: 2 }} numberOfLines={1}>
          {email}
        </Text>
      )}

      {(emailVerified || hasGoogle || hasApple) && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 14 }}>
          {emailVerified && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "#F1F3F4",
                borderRadius: 14,
                paddingVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <MaterialCommunityIcons name="check-decagram" size={14} color="#059669" />
              <Text style={{ fontSize: 12, color: "#444" }}>Verified</Text>
            </View>
          )}
          {hasGoogle && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "#F1F3F4",
                borderRadius: 14,
                paddingVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <MaterialCommunityIcons name="google" size={14} color="#555" />
              <Text style={{ fontSize: 12, color: "#444" }}>Google</Text>
            </View>
          )}
          {hasApple && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "#F1F3F4",
                borderRadius: 14,
                paddingVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <MaterialCommunityIcons name="apple" size={14} color="#555" />
              <Text style={{ fontSize: 12, color: "#444" }}>Apple</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
