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
   * REVISI: Jangan gunakan localStorage.clear()
   * Kita hanya menghapus key yang spesifik agar identitas verifikasi tidak hilang
   */
  const _cleanAuthData = () => {
    // Cari dan hapus hanya key yang berkaitan dengan session, bukan identitas hardware
    const keysToRemove = ["sb-access-token", "sb-refresh-token", "brawnly_profile_snap_v3"];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    // Opsional: Hapus cookie hash aktif
    if (user?.id) {
        _chQ("user_" + user.id).then(key => localStorage.removeItem(key)).catch(()=>{});
    }
  };

  const _forceLogout = _uC(async () => {
    console.warn("[AUTH] Session expired. Stabilizing identity...");
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
        if (error.message?.includes("403") || error.status === 403 || error.code === "PGRST301") {
            await _forceLogout();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentUser = await authApi.getCurrentUser();
        if (mounted) {
            setUser(currentUser);
            if(currentUser) await _sUS(currentUser.id);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        if (mounted) setUser(null);
        // JANGAN localStorage.clear() di sini
        _cleanAuthData();
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
      window.location.href = '/'; 
    } catch (error) {
      _cleanAuthData();
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