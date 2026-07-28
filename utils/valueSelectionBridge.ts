// Expo Router pushes don't return a value to the screen that pushed them, so
// a pushed "pick a value" screen hands its result back through a one-shot
// callback registered right before navigating, rather than through params.
export function createValueBridge<T>() {
  let pendingCallback: ((value: T) => void) | null = null;

  return {
    setPending(callback: (value: T) => void) {
      pendingCallback = callback;
    },
    consumePending(): ((value: T) => void) | null {
      const callback = pendingCallback;
      pendingCallback = null;
      return callback;
    },
  };
}
