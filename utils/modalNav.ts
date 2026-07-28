import { router } from "expo-router";

// iOS's native modal presentation can't handle a new present/dismiss while
// one is already animating — firing a push while the previous modal is still
// mid-dismiss (or vice versa) corrupts the view controller stack and crashes.
// `transitioning` is kept in sync with every transition in the places stack
// (see the Stack's `screenListeners` in app/(tabs)/places/_layout.tsx), no
// matter what triggered it (a header button, a swipe-to-dismiss gesture, or
// one of the calls below), so a fast second tap is dropped instead of
// crashing the app.
let transitioning = false;

export function setTransitioning(value: boolean) {
  transitioning = value;
}

export function pushModal(route: Parameters<typeof router.push>[0]) {
  if (transitioning) return;
  router.push(route);
}

export function backModal() {
  if (transitioning) return;
  router.back();
}
