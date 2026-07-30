import { useThemeColors } from "@/hooks/useThemeColors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Children, ReactElement, ReactNode } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type SettingsSectionProps = {
  title?: string;
  children: ReactNode;
};

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const colors = useThemeColors();
  const rows = Children.toArray(children);

  return (
    <View style={{ marginTop: 24, marginHorizontal: 16 }}>
      {title && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: colors.textSecondary,
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
          backgroundColor: colors.surface,
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
          <View key={index} style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.border }}>
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
  trailingTextColor,
  showChevron = true,
  onPress,
  destructive,
  loading,
  loadingColor,
}: SettingsRowProps) {
  const colors = useThemeColors();
  const contentColor = destructive ? colors.destructive : colors.text;

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
      <MaterialCommunityIcons name={icon} size={22} color={destructive ? colors.destructive : colors.icon} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: contentColor }}>{label}</Text>
        {subtitle && (
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 1 }} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={loadingColor ?? (destructive ? colors.destructive : colors.tint)} />
      ) : (
        <>
          {trailingText && (
            <Text style={{ fontSize: 14, fontWeight: "600", color: trailingTextColor ?? colors.textSecondary }}>
              {trailingText}
            </Text>
          )}
          {onPress && showChevron && (
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
          )}
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
