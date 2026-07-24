import { createValueBridge } from "./valueSelectionBridge";

const bridge = createValueBridge<string>();

export const setPendingOptionCallback = bridge.setPending;
export const consumePendingOptionCallback = bridge.consumePending;
