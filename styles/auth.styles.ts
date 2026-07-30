// auth.styles.ts
import { ThemeColors } from "@/constants/theme";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useColorScheme, StyleSheet } from "react-native";

export const AuthSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const FONT_SIZES = {
  title: 28,
  subtitle: 16,
  body: 15,
  button: 16,
  label: 13,
};

const MAX_CONTENT_WIDTH = 420;
const CONTROL_HEIGHT = 52;
const RADIUS = 14;

function buildAuthColors(colors: ThemeColors, isDark: boolean) {
  return {
    background: colors.background,
    surface: colors.surfaceAlt,
    surfaceFocused: isDark ? "#1E3A5F" : "#EFF6FF",
    primary: colors.tint,
    primaryPressed: isDark ? "#3B82F6" : "#1D4ED8",
    primaryDisabled: isDark ? "#1E3A5F" : "#93C5FD",
    primaryText: isDark ? "#04121F" : "#FFFFFF",
    secondarySurface: isDark ? "#1E3A5F" : "#EFF6FF",
    text: colors.text,
    mutedText: colors.textSecondary,
    placeholder: colors.textMuted,
    icon: colors.textMuted,
    iconFocused: colors.tint,
    border: colors.border,
    borderFocused: colors.tint,
    divider: colors.border,
    error: colors.destructive,
    errorBackground: colors.destructiveBackground,
    errorBorder: isDark ? "#5C2626" : "#FECACA",
    backButtonSurface: isDark ? "rgba(255,255,255,0.08)" : "rgba(17, 24, 39, 0.05)",
  };
}

function buildAuthStyles(AuthColors: ReturnType<typeof buildAuthColors>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: AuthColors.background,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: AuthSpacing.lg,
      justifyContent: "center",
      alignItems: "center",
    },

    container: {
      flex: 1,
      paddingHorizontal: AuthSpacing.lg,
      justifyContent: "center",
      alignItems: "center",
    },

    content: {
      width: "100%",
      maxWidth: MAX_CONTENT_WIDTH,
    },

    backButton: {
      position: "absolute",
      left: AuthSpacing.md,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: AuthColors.backButtonSurface,
      alignItems: "center",
      justifyContent: "center",
    },

    iconBadge: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: AuthColors.secondarySurface,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: AuthSpacing.lg,
    },

    logoBadge: {
      width: 72,
      height: 72,
      borderRadius: 20,
      alignSelf: "center",
      marginBottom: AuthSpacing.lg,
    },

    title: {
      fontSize: FONT_SIZES.title,
      fontWeight: "700",
      color: AuthColors.text,
      textAlign: "center",
      marginBottom: AuthSpacing.sm,
      letterSpacing: -0.3,
    },

    subtitle: {
      fontSize: FONT_SIZES.subtitle,
      lineHeight: 22,
      color: AuthColors.mutedText,
      textAlign: "center",
      marginBottom: AuthSpacing.xl,
    },

    fieldWrapper: {
      marginBottom: AuthSpacing.md,
    },

    fieldLabel: {
      fontSize: FONT_SIZES.label,
      fontWeight: "600",
      color: AuthColors.mutedText,
      marginBottom: AuthSpacing.xs,
      marginLeft: 2,
    },

    inputShell: {
      flexDirection: "row",
      alignItems: "center",
      height: CONTROL_HEIGHT,
      backgroundColor: AuthColors.surface,
      borderRadius: RADIUS,
      borderWidth: 1.5,
      borderColor: "transparent",
      paddingHorizontal: AuthSpacing.md,
    },

    inputShellFocused: {
      backgroundColor: AuthColors.surfaceFocused,
      borderColor: AuthColors.borderFocused,
    },

    inputShellError: {
      borderColor: AuthColors.error,
    },

    inputIcon: {
      marginRight: AuthSpacing.sm,
    },

    input: {
      flex: 1,
      height: "100%",
      fontSize: FONT_SIZES.body,
      color: AuthColors.text,
    },

    inputTrailingIcon: {
      padding: AuthSpacing.xs,
      marginLeft: AuthSpacing.xs,
    },

    fieldErrorText: {
      fontSize: 12,
      color: AuthColors.error,
      marginTop: AuthSpacing.xs,
      marginLeft: 2,
    },

    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: AuthColors.errorBackground,
      borderWidth: 1,
      borderColor: AuthColors.errorBorder,
      borderRadius: RADIUS - 4,
      paddingVertical: AuthSpacing.sm,
      paddingHorizontal: AuthSpacing.md,
      marginBottom: AuthSpacing.md,
    },

    errorBannerIcon: {
      marginRight: AuthSpacing.sm,
    },

    errorBannerText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: AuthColors.error,
    },

    button: {
      height: CONTROL_HEIGHT,
      borderRadius: RADIUS,
      backgroundColor: AuthColors.primary,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },

    buttonPressed: {
      backgroundColor: AuthColors.primaryPressed,
    },

    buttonDisabled: {
      backgroundColor: AuthColors.primaryDisabled,
    },

    buttonSecondary: {
      backgroundColor: AuthColors.secondarySurface,
    },

    buttonSecondaryPressed: {
      backgroundColor: AuthColors.surfaceFocused,
    },

    buttonText: {
      color: AuthColors.primaryText,
      fontSize: FONT_SIZES.button,
      fontWeight: "600",
    },

    buttonTextSecondary: {
      color: AuthColors.primary,
    },

    buttonRow: {
      flexDirection: "row",
      gap: AuthSpacing.sm,
    },

    link: {
      marginTop: AuthSpacing.lg,
      alignSelf: "center",
    },

    linkText: {
      color: AuthColors.mutedText,
      fontSize: FONT_SIZES.body,
    },

    linkTextEmphasis: {
      color: AuthColors.primary,
      fontWeight: "600",
    },

    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: AuthSpacing.lg,
    },

    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: AuthColors.divider,
    },

    dividerText: {
      marginHorizontal: AuthSpacing.md,
      fontSize: 13,
      color: AuthColors.mutedText,
    },

    socialButtonsGroup: {
      width: "100%",
      alignItems: "center",
      gap: AuthSpacing.sm,
    },

    formRow: {
      flexDirection: "row",
      alignItems: "center",
      alignContent: "center",
    },
  });
}

export function useAuthTheme() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const isDark = scheme === "dark";
  const AuthColors = buildAuthColors(colors, isDark);
  const AuthStyles = buildAuthStyles(AuthColors);
  return { AuthColors, AuthStyles };
}
