// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ✨ Define context type
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

// ✨ Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✨ Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Get session on load
    const initSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) console.error("Auth session error", error);

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initSession();

    // 2️⃣ Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup listener
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  // 3️⃣ Provide all auth state
  const value: AuthContextType = {
    session,
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ✅ Hook to access auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
