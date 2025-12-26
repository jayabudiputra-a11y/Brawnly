import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { subscribersApi } from "@/lib/api"; //
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (processed.current) return;
      processed.current = true;

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (!code) {
          navigate("/");
          return;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.session) {
          toast.error("Sesi tidak valid atau telah kadaluarsa.");
          navigate("/signin");
          return;
        }

        const user = data.user;

        // --- BAGIAN PENYELARASAN PROFIL ---
        if (user?.email) {
          const fullName = user.user_metadata?.full_name || 'Member Fitapp';

          // 1. Pastikan masuk ke Newsletter (Subscribers)
          await subscribersApi.insertIfNotExists(user.email, fullName);

          // 2. REVISI PENTING: Pastikan profil dibuat agar KOMENTAR MUNCUL
          // Ini menyelaraskan AuthCallback dengan logika signUp di api.ts
          await supabase.from("user_profiles").upsert({
            id: user.id,
            username: fullName,
            avatar_url: user.user_metadata?.avatar_url || null
          });
        }
        // ----------------------------------

        toast.success("Berhasil Masuk!", {
          description: "Selamat datang kembali di Fitapp."
        });

        navigate("/");
        
        // Refresh kecil untuk sinkronisasi state Auth di seluruh aplikasi
        setTimeout(() => window.location.reload(), 100);

      } catch (err) {
        console.error("Callback error:", err);
        navigate("/");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
          Memverifikasi Sesi
        </h2>
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.3em] mt-2 animate-pulse">
          Menyiapkan profil Anda...
        </p>
      </div>
    </div>
  );
}