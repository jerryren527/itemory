import { useAuthTheme } from "@/styles/auth.styles";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Keyboard, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthScreenContainerProps = {
  children: React.ReactNode;
  onBack?: () => void;
};

export function AuthScreenContainer({ children, onBack }: AuthScreenContainerProps) {
  const { AuthColors, AuthStyles } = useAuthTheme();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Only scroll if the keyboard is covering content, or the content itself overflows the screen
  // (e.g. a small device, or a form with many fields) — otherwise the page shouldn't move at all.
  const canScroll = keyboardHeight > 0 || contentHeight > viewportHeight;

  return (
    <View style={AuthStyles.screen}>
      {onBack && (
        <Pressable onPress={onBack} style={[AuthStyles.backButton, { top: insets.top + 8 }]} hitSlop={12}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={AuthColors.text} />
        </Pressable>
      )}
      <ScrollView
        onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
        onContentSizeChange={(_width, height) => setContentHeight(height)}
        contentContainerStyle={[
          AuthStyles.scrollContent,
          { paddingTop: insets.top + (onBack ? 64 : 32), paddingBottom: insets.bottom + 32 + keyboardHeight },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={canScroll}
        bounces={canScroll}
      >
        <View style={AuthStyles.content}>{children}</View>
      </ScrollView>
    </View>
  );
}
