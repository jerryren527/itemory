import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, Text, TouchableOpacity } from "react-native";
import { useThemeColors } from "@/hooks/useThemeColors";

type HeaderIconButtonProps = {
  onPress: () => void;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
  size?: number;
  label?: string;
};

// iOS 26's "liquid glass" nav bar has a known react-native-screens/expo-router
// bug (e.g. software-mansion/react-native-screens#2990, #3226): during header
// transitions the native UINavigationBar briefly reports an expanded size to
// Yoga, and a header button without a hard-pinned width/height stretches to
// fill it and sometimes sticks that way (the "big plus button" glitch).
// `minHeight`/padding-based sizing does NOT prevent this - only an explicit
// numeric width+height with alignSelf:"center" (so the button can't be
// stretched by its flex parent) does. iOS only; Android is untouched.
const IOS_ICON_SIZE = 22;
const IOS_ICON_ONLY_SIZE = 34; // fixed square frame for icon-only buttons
const IOS_LABEL_HEIGHT = 34; // fixed height for icon+label buttons (width follows label text)

export default function HeaderIconButton({ onPress, icon = "plus", color, size = 24, label }: HeaderIconButtonProps) {
  const colors = useThemeColors();
  const tint = color ?? colors.tint;
  const iconSize = Platform.OS === "ios" ? IOS_ICON_SIZE : size;

  const iosFrame = label
    ? { height: IOS_LABEL_HEIGHT, alignSelf: "center" as const, paddingHorizontal: 8 }
    : { width: IOS_ICON_ONLY_SIZE, height: IOS_ICON_ONLY_SIZE, alignSelf: "center" as const };

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={12}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        justifyContent: "center",
        ...(Platform.OS === "ios" ? iosFrame : { padding: 8 }),
      }}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={tint} />
      {label && <Text style={{ color: tint, fontWeight: "600", fontSize: 15 }}>{label}</Text>}
    </TouchableOpacity>
  );
}
