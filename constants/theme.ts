import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

export type ThemeColors = {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  icon: string;
  tint: string;
  destructive: string;
  destructiveBackground: string;
  success: string;
  successBackground: string;
};

export const Colors: Record<"light" | "dark", ThemeColors> = {
  light: {
    background: "#FFFFFF",
    backgroundSecondary: "#F2F2F7",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F3F4",
    border: "#EAEAEA",
    text: "#000000",
    textSecondary: "#6B6B6B",
    textMuted: "#999999",
    icon: "#555555",
    tint: "#2563EB",
    destructive: "#D32F2F",
    destructiveBackground: "#FDECEC",
    success: "#059669",
    successBackground: "#E7F5EC",
  },
  dark: {
    background: "#000000",
    backgroundSecondary: "#1C1C1E",
    surface: "#1C1C1E",
    surfaceAlt: "#2C2C2E",
    border: "#38383A",
    text: "#FFFFFF",
    textSecondary: "#A1A1A6",
    textMuted: "#8E8E93",
    icon: "#ADADB0",
    tint: "#60A5FA",
    destructive: "#FF453A",
    destructiveBackground: "#3A1F1F",
    success: "#32D74B",
    successBackground: "#1C3324",
  },
};

export const NavigationLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.destructive,
  },
};

export const NavigationDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.destructive,
  },
};
