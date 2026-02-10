import { useState as _s, useEffect as _e } from "react";
import { supabase } from "@/lib/supabase";
import { authApi } from "@/lib/api";
import type { AuthUser } from "@/types";
import { cookieHashQuarter as _chQ } from "@/lib/cookieHash";

export const useAuth = () => {
  const [user, setUser] = _s<AuthUser | null>(null);
  const [loading, setLoading] = _s(true);

  /**
   * Mengamankan session user di LocalStorage dengan hashing 1/4 memory
   */
  const _sUS = async (uId: string) => {
    try {
      const _sK = await _chQ("user_" + uId);
      localStorage.setItem(_sK, "active");
    } catch {}
  };

  _e(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          if (currentUser) await _sUS(currentUser.id);
        }
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
        if (currentUser) await _sUS(currentUser.id);
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

  return { 
    user, 
    loading, 
    isAuthenticated: !!user, 
    signOut 
  };
};