import { createValueBridge } from "./valueSelectionBridge";

const bridge = createValueBridge<string>();

export const setPendingDateCallback = bridge.setPending;
export const consumePendingDateCallback = bridge.consumePending;
