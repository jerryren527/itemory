const { withMainApplication } = require("@expo/config-plugins");

// Railway's edge proxy triggers a spurious network error on Android's OkHttp
// client over HTTP/2 — the response is delivered completely and correctly,
// but the client still reports the request as failed (observed as axios
// ERR_NETWORK with a 201 status buried in the underlying request object).
// Forcing HTTP/1.1 for all native networking avoids the broken HTTP/2 path.
// See: app/(tabs)/places/create-node.tsx (originally surfaced as "Something
// went wrong" when adding rooms/containers/items).
module.exports = function withHttp1Only(config) {
  return withMainApplication(config, (config) => {
    if (config.modResults.language !== "kt") {
      throw new Error("withHttp1Only expects a Kotlin MainApplication.kt");
    }

    let { contents } = config.modResults;

    if (!contents.includes("OkHttpClientProvider")) {
      contents = contents.replace(
        "import com.facebook.react.defaults.DefaultReactNativeHost\n",
        `import com.facebook.react.defaults.DefaultReactNativeHost\n` +
          `import com.facebook.react.modules.network.OkHttpClientProvider\n` +
          `import okhttp3.Protocol\n`,
      );

      contents = contents.replace(
        /^([ \t]*)loadReactNative\(this\)/m,
        `$1OkHttpClientProvider.setOkHttpClientFactory {\n` +
          `$1  OkHttpClientProvider.createClientBuilder(this).protocols(listOf(Protocol.HTTP_1_1)).build()\n` +
          `$1}\n` +
          `$1loadReactNative(this)`,
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};
