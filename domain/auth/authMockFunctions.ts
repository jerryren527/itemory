import * as SecureStore from "expo-secure-store";

export async function fakeLoginSuccess() {
  /**
   * Return the response shape of a successful login with a delay.
   */
  await new Promise((resolve) => setTimeout(resolve, 5000)); // simulate delay
  const response = {
    data: {
      tokens: {
        access: "myFakeAccessToken123",
        refresh: "myFakeRefreshToken123",
      },
      email: "testuser@example.com",
      id: 99999,
      has_password: true,
      email_verified: true,
      google_account_linked: false,
    },
  };

  return response;
}

export async function fakeLoginFailure() {
  /**
   * Return the response shape of a successful login with a delay.
   */
  await new Promise((resolve) => setTimeout(resolve, 5000)); // simulate delay
  const error = {
    response: {
      status: 401,
      data: {
        message: "Invalid credentials",
      },
    },
    isAxiosError: true,
  };

  throw error;
}

export async function fakeLogout() {
  /**
   * Simulate a successful logout with a delay.
   */
  await new Promise((resolve) => setTimeout(resolve, 5000)); // simulate delay
  return;
}

export async function fakeGenerateAccessToken() {
  /**
   * Fake generate an access token with a delay.
   */
  await new Promise((resolve) => setTimeout(resolve, 3000)); // simulate delay
  // random number between 1 and 100
  const randomNum = Math.floor(Math.random() * (100 - 1 + 1)) + 1;

  const newAccessToken = "myNewFakeAccessToken" + randomNum;
  return newAccessToken;
}

export async function clearSecureStore() {
  console.log("Clearing SecureStore");
  await SecureStore.deleteItemAsync("refreshToken");
}

export async function fakeSignupNetworkFailure() {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const error = {
    response: {
      status: 500,
      data: {
        message: "Network Error",
      },
    },
    isAxiosError: true,
  };
  throw error;
}
