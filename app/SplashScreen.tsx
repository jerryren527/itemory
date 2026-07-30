import { useThemeColors } from "@/hooks/useThemeColors";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* <View style={styles.logoContainer}>
        <Text style={styles.logo}>Itemory</Text>
      </View> */}

      <ActivityIndicator size="large" color={colors.tint} />

      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logoContainer: {
    marginBottom: 40,
  },

  logo: {
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: 1,
  },

  loadingText: {
    marginTop: 20,
    fontSize: 14,
  },
});
