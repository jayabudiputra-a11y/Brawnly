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
        _chQ("user_" + user.id).then((key: string) => localStorage.removeItem(key)).catch(()=>{});
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
        
        const isProcessing = window.location.pathname.includes('auth/callback') || 
                             window.location.hash.includes('access_token');

        if (sessionError) throw sessionError;

        if (!session) {
          if (mounted) {
            setUser(null);
            if (!isProcessing) setLoading(false);
          }
          return;
        }

        // OPTIMASI SPEED INDEX & LLM:
        // 1. Langsung injeksi user dasar dari session agar UI BISA LANGSUNG RENDER!
        // Jangan biarkan layar loading menahan konten.
        if (mounted) {
          setUser({ 
            id: session.user.id, 
            email: session.user.email, 
            ...session.user.user_metadata 
          } as AuthUser);
          
          if (!isProcessing) setLoading(false); // MATIKAN LOADING SEKARANG!
        }

        // 2. Fetch profil detail secara "siluman" di background
        const currentUser = await authApi.getCurrentUser();
        
        if (mounted) {
            if (currentUser) {
              // Update diam-diam (Silent Update) ke profil lengkap
              setUser(currentUser);
              await _sUS(currentUser.id);
            } else {
              // Jika ternyata di server user sudah dibanned/dihapus
              await _forceLogout();
            }
        }
      } catch (error: any) {
        if (error.message?.includes("403") || error.status === 401 || error.code === "PGRST301") {
            await _forceLogout();
        }
      } finally {
        const isAuthFlow = window.location.pathname.includes('auth') || 
                           window.location.hash.includes('access_token');
                           
        if (mounted && !isAuthFlow && loading) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        
        // Optimistic UI untuk proses Login baru
        if (mounted) {
          setUser({ id: session.user.id, ...session.user.user_metadata } as AuthUser);
          const isCallback = window.location.pathname.includes('auth');
          if (!isCallback) setLoading(false);
        }

        // Fetch detail di background
        const currentUser = await authApi.getCurrentUser();
        if (mounted && currentUser) {
            setUser(currentUser);
            await _sUS(currentUser.id);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
          _cleanAuthData();
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [_forceLogout, loading]);

  const signOut = async () => {
    try {
      setLoading(true);
      await authApi.signOut();
      _cleanAuthData();
      setUser(null);
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