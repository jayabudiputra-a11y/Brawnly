import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (processed.current) return;
      processed.current = true;

      try {
        // Biarkan Supabase memproses sesi secara internal
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session) {
          toast.success("Identity Synced", {
            description: "Redirecting to your identity node..."
          });
          
          // PAKSA ke profile, pastikan tidak ada kode lain yang mengarahkan ke articles
          setTimeout(() => {
            navigate("/profile", { replace: true });
          }, 500);
        } else {
          // Jika gagal sekejap, tunggu sebentar lalu cek ulang atau balik ke signin
          navigate("/signin", { replace: true });
        }
      } catch (err) {
        console.error("Auth System Fault:", err);
        navigate("/signin");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-8" />
        <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white italic">Verifying_Node</h2>
        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] mt-4 animate-pulse">Establishing Secure Link...</p>
      </div>
    </div>
  );
}