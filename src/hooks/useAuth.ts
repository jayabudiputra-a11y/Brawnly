import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { authApi } from "@/lib/api";
import type { AuthUser } from "@/types";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (mounted) setUser(currentUser);
      } catch (error) {
        if (import.meta.env.DEV) console.error("[AUTH_SYNC_ERROR]:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await authApi.signOut();
      setUser(null);
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error("[SIGNOUT_ERROR]:", error);
    }
  };

  return { user, loading, isAuthenticated: !!user, signOut };
};