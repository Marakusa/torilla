import { createContext, useContext, useState } from "react";

interface LoadingContextValue {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingBarProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoadingBar() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoadingBar must be used inside LoadingContext");
  }
  return ctx;
}
