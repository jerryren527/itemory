import { createValueBridge } from "./valueSelectionBridge";

const bridge = createValueBridge<string>();

export const setPendingTextCallback = bridge.setPending;
export const consumePendingTextCallback = bridge.consumePending;
