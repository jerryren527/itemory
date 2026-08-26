const IS_DEV = process.env.APP_VARIANT === "development";

// Lets the dev and production variants install side by side on the same
// device — each needs its own bundle ID/package, or installing one
// overwrites the other. Everything else stays in app.json as the shared
// base config; production behavior is unchanged when APP_VARIANT is unset.
module.exports = ({ config }) => ({
  ...config,
  name: IS_DEV ? "Itemory (Dev)" : config.name,
  ios: {
    ...config.ios,
    bundleIdentifier: IS_DEV ? "com.itemory.dev" : config.ios.bundleIdentifier,
  },
  android: {
    ...config.android,
    package: IS_DEV ? "com.itemory.dev" : config.android.package,
  },
});
