/**
 * Global auth reducer
 */

import { AuthState, UserStateType } from "@/domain/auth/authTypes";

const nullInitialState = {
  userId: null,
  email: null,
  googleEmail: null,
  userState: null,
  primaryHome: null,
  capabilities: {
    hasPassword: null,
    hasGoogle: null,
    hasApple: null,
    emailVerified: null,
  },
  tokens: {
    accessToken: null,
    refreshToken: null, // TODO: maybe remove refreshToken from state shape, because it is stored in secureStore.
  },
  authProvider: null, // TODO: remove maybe? Not sure if needed for main UI conditional rendering
  // isBootstrapping: false, // Added to fix flashing of the LoginPage before the main app UI causes by the navigation race when index.tsx reads the context store before the context store is updated.
};

// Define auth events
// E.g.: { type: 'SOME_EVENT' }
// E.g.: { type: 'LOGIN_SUCCEEDED'; payload: { data: any } }
// Use a discriminated union.
type AuthActionType =
  | { type: "INIT" }
  | { type: "LOGOUT" }
  | {
      type: "LOGIN_SUCCEEDED";
      payload: {
        userId: number;
        email: string;
        googleEmail: string | null;
        hasPassword: boolean;
        emailVerified: boolean;
        hasGoogle: boolean;
        hasApple: boolean;
        accessToken: string;
        authProvider: string;
        primaryHome: string | null;
      };
    } // only with a successful login event does it  makes sense to have a payload
  | {
      type: "RESTORE_SESSION";
      payload: {
        accessToken: string;
        email: string;
        googleEmail: string | null;
        emailVerified: boolean;
        hasPassword: boolean;
        hasGoogle: boolean;
        hasApple: boolean;
        id: number;
        primaryHome: string;
      };
    } // TODO: is authProvider necessary in payload when session is restored?
  | { type: "LOGIN_REQUIRES_VERIFICATION" }
  | { type: "SIGNUP_REQUIRES_VERIFICATION" }
  | { type: "SESSION_EXPIRED" }
  | { type: "GOOGLE_LINKED"; payload: { email: string | null } }
  | { type: "GOOGLE_UNLINKED" }
  | { type: "APPLE_LINKED" }
  | { type: "APPLE_UNLINKED" }
  | { type: "PASSWORD_SET"; payload?: { email?: string } };

// Define reducer function
// React's useReducer expects a reducer signature like: (state: StateType, action: { type: string; payload?: any }) => StateType
function authReducer(state: AuthState, action: AuthActionType): AuthState {
  switch (action.type) {
    case "INIT":
      // console.log("🚀 ~AuthAction INIT...");
      return { ...state, userState: "initializing" as UserStateType };
    case "LOGOUT":
      // console.log("🚀 ~AuthAction LOGOUT...");
      // console.log("🚀 ~ authReducer.ts:67 ~ authReducer ~ initialState:", initialState);
      return nullInitialState;
    case "SIGNUP_REQUIRES_VERIFICATION":
      // console.log("🚀 ~AuthAction SIGNUP_REQUIRES_VERIFICATION...");
      return { ...state, userState: "signup_pending_verification" as UserStateType };
    case "LOGIN_REQUIRES_VERIFICATION":
      // console.log("🚀 ~AuthAction LOGIN_REQUIRES_VERIFICATION...");
      return { ...state, userState: "login_pending_verification" as UserStateType };
    case "LOGIN_SUCCEEDED":
      // console.log("🚀 ~AuthAction LOGIN_SUCCEEDED...");
      // console.log("🚀 ~action.payload?.accessToken:", action.payload?.accessToken);
      // console.log("🚀 ~action.payload?.authProvider:", action.payload?.authProvider);
      // console.log("🚀 ~ authReducer.ts:79 ~ authReducer ~ action.payload?.userId:", action.payload?.userId);
      // console.log("🚀 ~ authReducer.ts:80 ~ authReducer ~ action.payload?.email:", action.payload?.email);
      // console.log("🚀 ~ authReducer.ts:81 ~ authReducer ~ action.payload?.has_password:", action.payload?.hasPassword);
      // console.log(
      // "🚀 ~ authReducer.ts:83 ~ authReducer ~ action.payload?.email_verified:",
      // action.payload?.emailVerified,
      // );
      // console.log(
      // "🚀 ~ authReducer.ts:87 ~ authReducer ~ action.payload?.google_account_linked:",
      // action.payload?.hasGoogle,
      // );

      const capabilities = {
        hasPassword: action.payload?.hasPassword,
        emailVerified: action.payload?.emailVerified,
        hasGoogle: action.payload?.hasGoogle,
        hasApple: action.payload?.hasApple,
      };

      const tokens = {
        accessToken: action.payload?.accessToken,
        refreshToken: null,
      };

      return {
        ...state,
        userId: action.payload?.userId,
        email: action.payload?.email ?? state.email,
        googleEmail: action.payload?.googleEmail ?? null,
        userState: "authenticated" as UserStateType,
        capabilities: capabilities,
        tokens: tokens,
        authProvider: action.payload?.authProvider,
        primaryHome: action.payload?.primaryHome,
      };
    case "RESTORE_SESSION":
      // console.log("🚀 ~ authReducer.ts:112 ~ authReducer ~ RESTORE_SESSION.");

      // const delay = async () => {
      //   await new Promise((resolve) => setTimeout(resolve, 5000)); // simulate delay
      // };

      // const delay = async () => {
      //   for (let i = 1; i <= 5; i++) {
      //     await new Promise((resolve) => setTimeout(resolve, 1000));
      //     console.log(`Second ${i}...`);
      //   }
      // };

      // delay();

      const tokens2 = {
        accessToken: action.payload?.accessToken,
        refreshToken: null,
      };

      const email = action.payload?.email;
      const googleEmail = action.payload?.googleEmail;
      const hasPassword = action.payload?.hasPassword;
      const emailVerified = action.payload?.emailVerified;
      const hasGoogle = action.payload?.hasGoogle;
      const hasApple = action.payload?.hasApple;
      const id = action.payload?.id;
      const primaryHome = action.payload?.primaryHome;

      const newState = { ...state };
      // Capabilities
      newState.capabilities.hasPassword = hasPassword;
      newState.capabilities.emailVerified = emailVerified;
      newState.capabilities.hasGoogle = hasGoogle;
      newState.capabilities.hasApple = hasApple;
      // Other
      newState.userId = id;
      newState.email = email;
      newState.googleEmail = googleEmail ?? null;
      newState.userState = "authenticated" as UserStateType;
      newState.tokens = tokens2;
      newState.primaryHome = primaryHome;

      return newState as AuthState;
    case "GOOGLE_LINKED":
      return {
        ...state,
        googleEmail: action.payload?.email ?? null,
        capabilities: { ...state.capabilities, hasGoogle: true },
      };
    case "GOOGLE_UNLINKED":
      return { ...state, googleEmail: null, capabilities: { ...state.capabilities, hasGoogle: false } };
    case "APPLE_LINKED":
      return { ...state, capabilities: { ...state.capabilities, hasApple: true } };
    case "APPLE_UNLINKED":
      return { ...state, capabilities: { ...state.capabilities, hasApple: false } };
    case "PASSWORD_SET":
      return {
        ...state,
        email: action.payload?.email ?? state.email,
        capabilities: {
          ...state.capabilities,
          hasPassword: true,
          emailVerified: action.payload?.email ? false : state.capabilities.emailVerified,
        },
      };
    default:
      // console.log("🚀 ~AuthAction is something else... State remains unchanged...");
      return state;
  }
}

// Use React's useReducer hook to conect the reducer function to your component's state
export default authReducer;
