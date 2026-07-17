export type UserStateType =
  | "initializing"
  | "unauthenticated"
  | "signup_pending_verification"
  | "login_pending_verification"
  | "authenticated"
  | null;

type CapabilitiesType = {
  hasPassword: boolean | null;
  hasGoogle: boolean | null;
  hasApple: boolean | null;
  emailVerified: boolean | null; // TODO: Remove maybe because login with unverified email is 401
};

type TokenType = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type AuthState = {
  userId: number | null;
  email: string | null;
  googleEmail: string | null;
  primaryHome: number | null;
  userState: UserStateType;
  capabilities: CapabilitiesType;
  tokens: TokenType;
  authProvider: string | null; // E.g. "email", "google"
};
