import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { authApi } from '@/lib/api';
import type { AuthUser } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil session saat pertama kali hook dijalankan
    const initAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching initial user:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Pasang Listener untuk perubahan status auth (Login/Logout)
    // Ini sangat penting agar UI (seperti CommentSection) langsung berubah
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user as AuthUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // 3. Cleanup listener saat komponen tidak lagi digunakan
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  };
};