import { createValueBridge } from "./valueSelectionBridge";

// The value is the new local/remote photo URI, or null if the photo was removed.
const bridge = createValueBridge<string | null>();

export const setPendingPhotoCallback = bridge.setPending;
export const consumePendingPhotoCallback = bridge.consumePending;
