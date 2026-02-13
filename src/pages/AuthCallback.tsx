import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { subscribersApi } from "@/lib/api";
import { toast } from "sonner";

/* --------------------------------
    Ultra lightweight hash (¼ memory cookie pattern)
-------------------------------- */
function _hS(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

/* --------------------------------
    Cookie setter minimal
-------------------------------- */
function _sC(name: string, val: string, days = 30) {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie = `${name}=${val}; path=/; expires=${d.toUTCString()}; SameSite=Lax`;
}

/* --------------------------------
    Offline Sync Queue (PWA Engine Core)
-------------------------------- */
const _QK = "brawnly_sync_queue";

function _pushQ(job: any) {
  try {
    const q = JSON.parse(localStorage.getItem(_QK) || "[]");
    q.push(job);
    localStorage.setItem(_QK, JSON.stringify(q));
  } catch {}
}

async function _flushQ() {
  try {
    const q = JSON.parse(localStorage.getItem(_QK) || "[]");
    if (!q.length) return;
    const next: any[] = [];
    for (const job of q) {
      try {
        if (job.type === "profile_upsert") {
          await supabase.from("user_profiles").upsert(job.payload, { onConflict: "id" });
        }
        if (job.type === "subscriber_insert") {
          await subscribersApi.insertIfNotExists(job.payload.email, job.payload.name);
        }
      } catch {
        next.push(job);
      }
    }
    localStorage.setItem(_QK, JSON.stringify(next));
  } catch {}
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const processed = useRef(false);

  // Kunci Sinkronisasi Profile V3
  const PROFILE_SNAP_KEY = "brawnly_profile_snap_v3";

  useEffect(() => {
    const handleAuth = async () => {
      if (processed.current) return;
      processed.current = true;

      try {
        // Mendukung hash (email link) dan query (OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code") || hashParams.get("access_token");

        if (!code) {
          navigate("/");
          return;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          // Jika pakai code (PKCE), tukar dulu
          const codeParam = queryParams.get("code");
          if (codeParam) {
            await supabase.auth.exchangeCodeForSession(codeParam);
          } else {
             navigate("/signin");
             return;
          }
        }

        const user = data.session?.user || (await supabase.auth.getUser()).data.user;

        if (user) {
          const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

          // 1. Sync Subscriber
          try {
            await subscribersApi.insertIfNotExists(user.email!, fullName);
          } catch {
            _pushQ({ type: "subscriber_insert", payload: { email: user.email, name: fullName } });
          }

          // 2. Sync Profile Table (PENTING)
          const profilePayload = {
            id: user.id,
            username: fullName,
            avatar_url: user.user_metadata?.avatar_url || null,
            updated_at: new Date().toISOString()
          };

          try {
            await supabase.from("user_profiles").upsert(profilePayload, { onConflict: "id" });
          } catch {
            _pushQ({ type: "profile_upsert", payload: profilePayload });
          }

          // 3. Set Lokal Snapshot Profile V3 agar halaman Profile langsung tampil
          localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify(profilePayload));
          _sC("b_auth", _hS(user.id));
          
          toast.success("Identity Verified", {
            description: "Neural link established. Redirecting to identity node..."
          });

          // REVISI: Langsung arahkan ke Profile, bukan Articles
          navigate("/profile", { replace: true });
        } else {
          navigate("/signin");
        }
      } catch (err) {
        console.error("Callback Fault:", err);
        navigate("/signin");
      }
    };

    handleAuth();
    _flushQ();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-8" />
        <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white italic">
          Verifying_Node
        </h2>
        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] mt-4 animate-pulse">
          Establishing Secure Link...
        </p>
      </div>
    </div>
  );
}