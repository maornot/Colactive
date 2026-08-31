"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AuthMode = "signup" | "login" | null;

interface AuthModalContextValue {
  mode: AuthMode;
  openSignup: () => void;
  openLogin: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode>(null);

  return (
    <AuthModalContext.Provider
      value={{
        mode,
        openSignup: () => setMode("signup"),
        openLogin: () => setMode("login"),
        close: () => setMode(null),
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
