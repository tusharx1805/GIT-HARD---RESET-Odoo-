// hooks/useUser.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return user;
}
