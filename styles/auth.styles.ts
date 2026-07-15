// auth.styles.ts
import { StyleSheet } from "react-native";

const COLORS = {
  background: "#FFFFFF",
  primary: "#2563EB", // blue-600
  primaryText: "#FFFFFF",
  text: "#111827", // gray-900
  mutedText: "#6B7280", // gray-500
  border: "#E5E7EB", // gray-200
  error: "#DC2626",
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const FONT_SIZES = {
  title: 28,
  subtitle: 16,
  body: 14,
  button: 16,
};

const MAX_CONTENT_WIDTH = 420;

export const AuthStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
  },

  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },

  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.mutedText,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.md,
  },

  inputWithShowHide: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.md,
  },

  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.sm,
  },

  buttonText: {
    color: COLORS.primaryText,
    fontSize: FONT_SIZES.button,
    fontWeight: "600",
  },

  link: {
    marginTop: SPACING.lg,
    alignSelf: "center",
  },

  linkText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.body,
    fontWeight: "500",
  },

  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.body,
    marginBottom: SPACING.sm,
  },

  formRow: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
  },
});
