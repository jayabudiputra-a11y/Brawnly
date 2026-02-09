import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { subscribersApi } from "@/lib/api";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (processed.current) return;
      processed.current = true;

      try {
        const code = new URLSearchParams(window.location.search).get("code");

        if (!code) {
          navigate("/");
          return;
        }

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.session) {
          toast.error("Session expired or invalid.");
          navigate("/signin");
          return;
        }

        const user = data.user;
        if (user?.email) {
          const fullName = user.user_metadata?.full_name || user.email.split('@')[0];

          await subscribersApi.insertIfNotExists(user.email, fullName);

          await supabase.from("user_profiles").upsert({
            id: user.id,
            username: fullName,
            avatar_url: user.user_metadata?.avatar_url || null,
          }, { onConflict: 'id' });
        }

        toast.success("Identity Synced", { description: "Welcome to Brawnly Cloud." });
        
        navigate("/articles");
      } catch (err) {
        console.error("Auth callback system fault:", err);
        navigate("/signin");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-8" />
        <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">Verifying_Node</h2>
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.4em] mt-4 animate-pulse">Establishing Secure Link...</p>
      </div>
    </div>
  );
}