import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createValueBridge } from "./valueSelectionBridge";

export type SheetAction = {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  destructive?: boolean;
};

// The value is the selected action's key.
const bridge = createValueBridge<string>();

export const setPendingActionCallback = bridge.setPending;
export const consumePendingActionCallback = bridge.consumePending;
