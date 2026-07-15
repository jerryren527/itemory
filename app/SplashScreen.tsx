import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      {/* <View style={styles.logoContainer}>
        <Text style={styles.logo}>Itemory</Text>
      </View> */}

      <ActivityIndicator size="large" color="#4F46E5" />

      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#0F172A",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  logoContainer: {
    marginBottom: 40,
  },

  logo: {
    fontSize: 42,
    fontWeight: "700",
    color: "black",
    letterSpacing: 1,
  },

  loadingText: {
    marginTop: 20,
    fontSize: 14,
    color: "#94A3B8",
  },
});
