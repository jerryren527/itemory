const { withPodfile } = require("@expo/config-plugins");

// GoogleSignIn's Swift dependencies (AppCheckCore, GoogleUtilities,
// RecaptchaInterop) require modular headers to build as static libraries.
// CocoaPods has no config-file equivalent for this, so it has to be injected
// into the generated Podfile directly.
module.exports = function withModularHeaders(config) {
  return withPodfile(config, (config) => {
    if (!config.modResults.contents.includes("use_modular_headers!")) {
      config.modResults.contents = config.modResults.contents.replace(
        /(platform :ios,.*\n)/,
        `$1use_modular_headers!\n`,
      );
    }
    return config;
  });
};
