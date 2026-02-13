import { useState as _s, useEffect as _e, useCallback as _uC } from "react";
import { supabase } from "@/lib/supabase";
import { authApi } from "@/lib/api";
import type { AuthUser } from "@/types";
import { cookieHashQuarter as _chQ } from "@/lib/cookieHash";

export const useAuth = () => {
  const [user, setUser] = _s<AuthUser | null>(null);
  const [loading, setLoading] = _s(true);

  /**
   * Mengamankan session user di LocalStorage dengan hashing 1/4 memory
   * (Logic Enterprise V3)
   */
  const _sUS = async (uId: string) => {
    try {
      if (typeof _chQ === 'function') {
        const _sK = await _chQ("user_" + uId);
        localStorage.setItem(_sK, "active");
      }
    } catch {}
  };

  /**
   * Helper untuk membersihkan sesi jika terjadi error 403/401
   */
  const _forceLogout = _uC(async () => {
    console.warn("[AUTH] Session expired or invalid. Cleaning up...");
    await authApi.signOut(); 
    localStorage.clear();    
    setUser(null);
  }, []);

  _e(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // 1. Cek Session di LocalStorage dulu
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        // 2. Jika tidak ada session
        if (!session) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        // 3. Jika session ada, fetch user
        const currentUser = await authApi.getCurrentUser();
        
        if (mounted) {
            if (currentUser) {
              setUser(currentUser);
              await _sUS(currentUser.id);
            } else {
              await _forceLogout();
            }
        }

      } catch (error: any) {
        // Fix 403 & Invalid Token loops
        if (error.message?.includes("403") || error.status === 403 || error.code === "PGRST301") {
            await _forceLogout();
        } else {
            if (import.meta.env.DEV) console.error("[AUTH_SYNC_ERROR]:", error);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // 4. Listener Realtime
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log("[AUTH_EVENT]", event); 

      if (event === 'SIGNED_IN' && session?.user) {
        try {
            const currentUser = await authApi.getCurrentUser();
            if (mounted) {
                setUser(currentUser);
                if(currentUser) await _sUS(currentUser.id);
            }
        } catch { }
      } 
      // 🔥 FIX: Cast event ke string untuk mengatasi error TypeScript
      else if (event === 'SIGNED_OUT' || (event as string) === 'USER_DELETED') {
        if (mounted) setUser(null);
        localStorage.clear(); 
      }
      
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [_forceLogout]);

  const signOut = async () => {
    try {
      setLoading(true);
      await authApi.signOut();
      setUser(null);
      localStorage.clear();
      window.location.href = '/'; 
    } catch (error) {
      console.error("[SIGNOUT_ERROR]:", error);
      localStorage.clear();
      setUser(null);
      window.location.href = '/';
    } finally {
        setLoading(false);
    }
  };

  return { 
    user, 
    loading, 
    isAuthenticated: !!user, 
    signOut 
  };
};