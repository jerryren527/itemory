import { createValueBridge } from "./valueSelectionBridge";

// The value is a comma-joined tags string, matching the format the rest of
// the app (create/edit item forms) already stores tags in.
const bridge = createValueBridge<string>();

export const setPendingTagsCallback = bridge.setPending;
export const consumePendingTagsCallback = bridge.consumePending;
