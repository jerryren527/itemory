import authReducer from "@/app/reducers/authReducer";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, ReactElement, ReactNode, useEffect, useReducer } from "react";

// Define initialState for React's useReducer hook
export const initialState: AuthState = {
  userId: null,
  email: null,
  userState: "initializing",
  primaryHome: null,
  capabilities: {
    hasPassword: null,
    hasGoogle: null,
    emailVerified: null,
  },
  tokens: {
    accessToken: null,
    refreshToken: null, // TODO: maybe remove refreshToken from state shape, because it is stored in secureStore.
  },
  authProvider: null, // TODO: remove maybe? Not sure if needed for main UI conditional rendering
};

// AuthContext should take the shape of { state: AuthContextType; dispatch: React.Dispatch<any> }
// Pass in the initial state of AuthContext
export const AuthContext = createContext<{ state: AuthState; dispatch: React.Dispatch<any> }>({
  state: initialState,
  dispatch: () => null,
});

const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  useEffect(() => {
    const bootstrapAuth = async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      // console.log("🚀 ~ auth-context.tsx:40 ~ bootstrapAuth ~ refreshToken:", refreshToken);

      if (!refreshToken) {
        dispatch({ type: "LOGOUT" });
        return;
      }

      try {
        const res = await api.post("/api/token/refresh/", {
          refresh: refreshToken,
        });

        // const response = await axios.post(`${process.env.EXPO_PUBLIC_MACHINE_IP_ADDRESS_URL}/api/token/refresh/`, {
        //   refresh: refreshToken,
        // });

        const newAccessToken = res.data?.access;

        // Call api/me
        const res2 = await api.get("/app/me", {
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
          },
        });

        const email = res2["data"]["email"];
        // console.log("🚀 ~ auth-context.tsx:66 ~ bootstrapAuth ~ email:", email);
        const email_verified = res2.data?.email_verified;
        // console.log("🚀 ~ auth-context.tsx:68 ~ bootstrapAuth ~ email_verified:", email_verified);
        const has_password = res2.data?.has_password;
        // console.log("🚀 ~ auth-context.tsx:70 ~ bootstrapAuth ~ has_password:", has_password);
        const google_account_linked = res2.data?.google_account_linked;
        // console.log("🚀 ~ auth-context.tsx:72 ~ bootstrapAuth ~ google_account_linked:", google_account_linked);
        const google_sub = res2.data?.google_sub;
        // console.log("🚀 ~ auth-context.tsx:74 ~ bootstrapAuth ~ google_sub:", google_sub);
        const id = res2.data?.id;
        // console.log("🚀 ~ auth-context.tsx:76 ~ bootstrapAuth ~ id:", id);
        const primaryHome = res2.data?.primary_home;
        // console.log("🚀 ~ auth-context.tsx:78 ~ bootstrapAuth ~ primaryHome:", primaryHome);

        await SecureStore.setItemAsync("refreshToken", res.data?.refresh);
        const newRefreshToken = res.data?.refresh;
        // console.log("🚀 ~ auth-context.tsx:82 ~ bootstrapAuth ~ newRefreshToken:", newRefreshToken)

        dispatch({
          type: "RESTORE_SESSION",
          payload: {
            accessToken: newAccessToken,
            email: email,
            emailVerified: email_verified,
            hasPassword: has_password,
            hasGoogle: google_account_linked,
            id: id,
            primaryHome: primaryHome,
          },
        });
        // router.replace("/");
      } catch (err) {
        // console.log("🚀 ~ auth-context.tsx:98 ~ bootstrapAuth ~ err:", err);
        await SecureStore.deleteItemAsync("refreshToken");
        dispatch({ type: "LOGOUT" });
      }
    };

    bootstrapAuth();
  }, []);

  return (
    <AuthContext.Provider
      // {...props} // remove this.
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
