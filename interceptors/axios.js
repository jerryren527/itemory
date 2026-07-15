// axios.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}`,
  timeout: 10000,
});

const PUBLIC_ENDPOINTS = [
  "/app/login",
  "/app/verify-email/",
  "/app/register",
  "/app/google-sign-in",
  "/app/send-reset-password-email",
  "/app/reset-password/",
];

// TODO: try later
// Attach access token automatically
// api.interceptors.request.use(async (config) => {
//   const accessToken = await SecureStore.getItemAsync("accessToken");

//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }

//   return config;
// });

api.interceptors.request.use((request) => {
  // console.log("🚀 ~ axios.js:23 ~ INSIDE AXIOS INTERCEPTOR. request:", request);
  return request;
});

api.interceptors.response.use(
  (response) => {
    // console.log("🚀 ~INSIDE AXIOS INTERCEPTOR. response:", response);
    return response;
  },
  async (error) => {
    const url = error.config.url;
    // console.log("🚀 ~ axios.js:43 ~ url:", url);
    // If the requested url is a public endpoint, do not continue with axios interceptor logic
    if (PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint))) {
      // console.log("🚀 ~ axios.js:43 ~ This url is a public endpoint:", url);
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // console.log("🚀 ~ axios.js:34 ~ error.response?.status:", error.response?.status);

      try {
        // If no refresh in progress → start one. If not promise in progress, start one.
        // Resolve/Reject the promise
        const newAccessToken = await refreshAccessToken();

        const originalRequest = error.config;
        // Update original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        // console.log("🚀 ~err:", err);
        if (axios.isAxiosError(err)) {
          // console.log("🚀 ~message:", err.message);

          if (err.response) {
            // console.log("🚀 ~status:", err.response.status);
            // console.log("🚀 ~data:", err.response.data);
            // console.log("🚀 ~err.response.data:", err.response.data?.message);
            // console.log("🚀 ~headers:", err.response.headers);
          } else if (err.request) {
            // console.log("🚀 ~request:", err.request);
          } else {
            // console.log("🚀 ~config:", err.config);
          }

          return Promise.reject(err);
        }
      }
    } else {
      // console.log("🚀 ~Not 401, rejecting Promise.");
      return Promise.reject(error); // If not 401 → reject so it bubbles up to the try/catch block of application code.
    }
  },
);

// Returns Promise
async function refreshAccessToken() {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  // console.log("🚀 ~refreshToken from securestore:", refreshToken);

  const response = await axios.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/api/token/refresh/`, {
    refresh: refreshToken,
  });

  const newAccessToken = response.data.access;

  const newRefreshToken = response.data.refresh;
  await SecureStore.setItemAsync("refreshToken", newRefreshToken);

  return newAccessToken;
}

export default api;
