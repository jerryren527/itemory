import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Children, ReactElement, ReactNode } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type SettingsSectionProps = {
  title?: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const rows = Children.toArray(children);

  return (
    <View style={{ marginTop: 24, marginHorizontal: 16 }}>
      {title && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: "grey",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 6,
            marginLeft: 12,
          }}
        >
          {title}
        </Text>
      )}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      >
        {rows.map((row, index) => (
          <View key={index} style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: "#eee" }}>
            {row as ReactElement}
          </View>
        ))}
      </View>
    </View>
  );
}

type SettingsRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  subtitle?: string;
  trailingText?: string;
  trailingTextColor?: string;
  showChevron?: boolean;
  onPress?: () => void;
  destructive?: boolean;
  loading?: boolean;
  loadingColor?: string;
};

export function SettingsRow({
  icon,
  label,
  subtitle,
  trailingText,
  trailingTextColor = "grey",
  showChevron = true,
  onPress,
  destructive,
  loading,
  loadingColor,
}: SettingsRowProps) {
  const contentColor = destructive ? "#D32F2F" : "black";

  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <MaterialCommunityIcons name={icon} size={22} color={destructive ? "#D32F2F" : "#555"} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: contentColor }}>{label}</Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: "grey", marginTop: 1 }} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={loadingColor ?? (destructive ? "#D32F2F" : "#2563EB")} />
      ) : (
        <>
          {trailingText && (
            <Text style={{ fontSize: 14, fontWeight: "600", color: trailingTextColor }}>{trailingText}</Text>
          )}
          {onPress && showChevron && <MaterialCommunityIcons name="chevron-right" size={20} color="#C4C4C4" />}
        </>
      )}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.6}>
      {content}
    </TouchableOpacity>
  );
}
