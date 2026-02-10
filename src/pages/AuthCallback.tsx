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

/* --------------------------------
   Reconnect Backoff Engine
-------------------------------- */
function _reconnectLoop(fn: () => Promise<void>) {
  let a = 0;
  let t: any = null;

  const run = async () => {
    if (!navigator.onLine) return;
    try {
      await fn();
      a = 0;
    } catch {
      a++;
      const base = Math.min(30000, 1000 * 2 ** a);
      const jitter = Math.random() * 500;
      t = setTimeout(run, base + jitter);
    }
  };

  run();
  window.addEventListener("online", run);

  return () => {
    if (t) clearTimeout(t);
    window.removeEventListener("online", run);
  };
}

/* --------------------------------
   Service Worker Register (PWA Enterprise)
-------------------------------- */
async function _regSW() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch {}
  }
}

/* --------------------------------
   WASM Ready Loader (future image / crypto / transcoding)
-------------------------------- */
async function _initWASM() {
  try {
    // placeholder future pipeline
    // const wasm = await WebAssembly.instantiateStreaming(fetch("/wasm/core.wasm"));
    return true;
  } catch {
    return false;
  }
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    _regSW();
    _initWASM();

    const stopReconnect = _reconnectLoop(async () => {
      await _flushQ();
    });

    return stopReconnect;
  }, []);

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

        /* -----------------------------
           Local Snapshot (FB Query style mirror)
        ----------------------------- */
        try {
          const snap = {
            id: user?.id,
            email: user?.email,
            ts: Date.now()
          };
          localStorage.setItem("auth_session_snapshot", JSON.stringify(snap));
          _sC("b_auth", _hS(user?.id || "0"));
        } catch {}

        if (user?.email) {
          const fullName =
            user.user_metadata?.full_name || user.email.split("@")[0];

          /* -----------------------------
             Subscriber Sync (Offline Safe)
          ----------------------------- */
          try {
            await subscribersApi.insertIfNotExists(user.email, fullName);
          } catch {
            _pushQ({
              type: "subscriber_insert",
              payload: { email: user.email, name: fullName }
            });
          }

          /* -----------------------------
             Profile Sync (Offline Safe)
          ----------------------------- */
          const profilePayload = {
            id: user.id,
            username: fullName,
            avatar_url: user.user_metadata?.avatar_url || null
          };

          try {
            await supabase
              .from("user_profiles")
              .upsert(profilePayload, { onConflict: "id" });
          } catch {
            _pushQ({
              type: "profile_upsert",
              payload: profilePayload
            });
          }

          /* -----------------------------
             Local Profile Snapshot
          ----------------------------- */
          try {
            localStorage.setItem(
              "profile_snapshot",
              JSON.stringify(profilePayload)
            );
          } catch {}
        }

        toast.success("Identity Synced", {
          description: "Welcome to Brawnly Cloud."
        });

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
        <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">
          Verifying_Node
        </h2>
        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.4em] mt-4 animate-pulse">
          Establishing Secure Link...
        </p>
      </div>
    </div>
  );
}
