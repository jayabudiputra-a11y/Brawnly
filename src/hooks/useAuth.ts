import { useState as _s, useEffect as _e, useCallback as _uC } from "react";
import { supabase } from "@/lib/supabase";
import { authApi } from "@/lib/api";
import type { AuthUser } from "@/types";
import { cookieHashQuarter as _chQ } from "@/lib/cookieHash";

export const useAuth = () => {
  const [user, setUser] = _s<AuthUser | null>(null);
  const [loading, setLoading] = _s(true);

  const _sUS = async (uId: string) => {
    try {
      if (typeof _chQ === 'function') {
        const _sK = await _chQ("user_" + uId);
        localStorage.setItem(_sK, "active");
      }
    } catch {}
  };

  /**
   * REVISI: Bersihkan sesi tapi amankan sidik jari hardware (v_identity_v1)
   */
  const _cleanAuthData = () => {
    const keysToRemove = [
      "sb-access-token", 
      "sb-refresh-token", 
      "brawnly_profile_snap_v3",
      "auth_session_snapshot",
      "brawnly_auth_processing" 
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    if (user?.id) {
        _chQ("user_" + user.id).then(key => localStorage.removeItem(key)).catch(()=>{});
    }
  };

  const _forceLogout = _uC(async () => {
    console.warn("[AUTH] Neural stabilization triggered.");
    await authApi.signOut(); 
    _cleanAuthData();
    setUser(null);
  }, [user?.id]);

  _e(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

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
        if (error.message?.includes("403") || error.status === 401 || error.code === "PGRST301") {
            await _forceLogout();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    /**
     * KUNCI: Gunakan Event Filter.
     * Mencegah SIGNED_IN memicu navigasi otomatis ke Articles jika flag processing ada.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentUser = await authApi.getCurrentUser();
        if (mounted) {
            setUser(currentUser);
            if(currentUser) await _sUS(currentUser.id);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          _cleanAuthData();
        }
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
      _cleanAuthData();
      setUser(null);
      // Gunakan REPLACE untuk membunuh semua sisa fetch (Fix AbortError)
      window.location.replace('/'); 
    } catch (error) {
      _cleanAuthData();
      setUser(null);
      window.location.replace('/');
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