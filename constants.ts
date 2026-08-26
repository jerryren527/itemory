// Google OAuth Constants
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/callback`;
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// Native GoogleSignin config — shared by every screen that calls GoogleSignin.configure().
// Same values for dev and production builds: Google's Android check matches by SHA-1
// regardless of package name, and iOS matches by URL scheme rather than bundle ID, so
// neither platform needs a dev-specific client.
export const GOOGLE_SIGNIN_CONFIG = {
  iosClientId: "576724600295-1qvvi3u0t52o15eg1202mnc0phs9qejn.apps.googleusercontent.com",
  webClientId: "576724600295-o03u09d0l2jh5osvul7f1gci8l5r20m3.apps.googleusercontent.com",
  profileImageSize: 150,
};

// Environment Constants
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;

// Django Constants
export const BACKEND_URL = process.env.BACKEND_URL;