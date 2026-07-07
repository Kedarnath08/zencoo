import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { saveJWT, getJWT, deleteJWT } from "../utils/secureStore";
import { setUnauthorizedHandler } from "../api/axiosInstance";

interface AuthContextValue {
  /** True once the initial token check has finished. */
  ready: boolean;
  isAuthenticated: boolean;
  token: string | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const signIn = useCallback(async (newToken: string) => {
    await saveJWT(newToken);
    setToken(newToken);
  }, []);

  const signOut = useCallback(async () => {
    await deleteJWT();
    setToken(null);
  }, []);

  // Load the persisted token once on boot.
  useEffect(() => {
    (async () => {
      try {
        const stored = await getJWT();
        if (stored) setToken(stored);
      } catch {
        // ignore — treat as logged out
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // If any API call returns 401 (expired/invalid token), log out automatically.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{ ready, isAuthenticated: !!token, token, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
