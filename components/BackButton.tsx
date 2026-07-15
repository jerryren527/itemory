import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

type BackButtonPropType = {
  tintColor?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  label?: string;
};

const BackButton = ({
  tintColor = "#db1010ff",
  canGoBack = true,
  onBack = () => {
    console.log("🚀 ~Default onBack");
  },
  label = "Default Label",
}) => {
  const router = useRouter();

  if (!canGoBack) return null;

  return (
    <Pressable
      onPress={() => onBack()}
      // onPress={() => {
      //   console.log("🚀 ~BackButton Pressed");
      //   router.back();
      // }}
    >
      <Text
        style={{
          color: tintColor,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default BackButton;
