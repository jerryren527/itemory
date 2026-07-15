import { createContext, Dispatch, ReactElement, ReactNode, SetStateAction, useContext, useMemo, useState } from "react";
// Define AuthFlowUIContext type
type AuthFlowUIContextType = {
  isSubmitting: boolean;
  authError: string | null;
  currentStep?: string | undefined;
  showBackButton?: boolean | undefined;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setAuthError: Dispatch<SetStateAction<string | null>>;
  setCurrentStep: Dispatch<SetStateAction<string | undefined>>;
  setShowBackButton: Dispatch<SetStateAction<boolean | undefined>>;
};

// Create AuthFlowUIContext with react's createContext()
export const AuthFlowUIContext = createContext<AuthFlowUIContextType | undefined>(undefined);

// Create custom hook that returns the context
export function useAuthFlowUI(): AuthFlowUIContextType {
  const context = useContext(AuthFlowUIContext);
  if (!context) {
    throw new Error("useAuthFlowUI must be within AuthFlowUIProvider");
  }

  return context;
}

type AuthFlowUIProviderType = {
  children: ReactNode;
};

// Create the Provider
// 'children' is any valid React components that are rendered inside the Provider.
// AuthFlowUIProvider() returns a ReactElement. It basically returns a wrapper component that can provide context to any components wrapped inside of it.
const AuthFlowUIProvider = ({ children }: AuthFlowUIProviderType): ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string | undefined>(undefined);
  const [showBackButton, setShowBackButton] = useState<boolean | undefined>(false);

  // Split value object into two parts: changing part (state) and non-changing part (setters).
  // useMemo returns a memoized value by running a calculation function.
  // setters never change because this object is stable and the dependency array is empty. React will always see the same reference to setters.
  const setters = useMemo(
    () => ({
      setIsSubmitting,
      setAuthError,
      setCurrentStep,
      setShowBackButton,
    }),
    [],
  );

  // Use useMemo on value to avoid unnecessary re-renders. Because without useMemo, a change to any one piece of state will cause all components connected to the Provider to re-render.
  const value = useMemo(
    () => ({
      isSubmitting,
      authError,
      currentStep,
      showBackButton,
      ...setters, // spread setters (the non-changing funcitons) into value. React Context only accepts a single value object. So now the 'value' object contains both the changing state and the stable setters.
    }),
    [isSubmitting, authError, currentStep, showBackButton],
  );

  return <AuthFlowUIContext.Provider value={value}>{children}</AuthFlowUIContext.Provider>;
};

// Export the provider and custom hook.
export default AuthFlowUIProvider;
