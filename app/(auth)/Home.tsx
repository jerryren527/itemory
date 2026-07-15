import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Home = () => {
  console.log("🚀 ~AUTH INDEX RENDERED");

  return (
    <View style={styles.container}>
      <Text>AUTH INDEX</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "yellow",
  },
});

export default Home;
