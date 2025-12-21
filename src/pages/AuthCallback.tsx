import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const { data, error } =
        await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

      if (error) {
        console.error(error);
        navigate("/signin");
        return;
      }

      // 🔥 insert subscriber (AMAN walau sudah ada)
      if (data?.user?.email) {
        await supabase
          .from("subscribers")
          .insert({
            email: data.user.email,
            name: data.user.user_metadata?.full_name ?? "Anonymous",
            is_active: true,
          })
          .select()
          .maybeSingle();
      }

      navigate("/");
      window.location.reload();
    };

    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-semibold text-lg">Confirming your email…</p>
    </div>
  );
}
