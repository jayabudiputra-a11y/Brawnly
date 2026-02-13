import React, { useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const _0xcore = ['v_identity_v1', 'reverse', 'split', 'join', 'ptr', 'addr'] as const;
const _g = (i: number) => _0xcore[i];

/* ------------------------------------------------------------
   🔐 SECURE SHELL ENCODING (V3)
   ------------------------------------------------------------ */
const _0xS1 = (s: string) => {
  try {
    const _b = btoa(s);
    const _s = (_b as any)[_g(2)]('');
    const _r = _s[_g(1)]();
    return (_r as any)[_g(3)]('');
  } catch { return ""; }
};

const _0xS2 = (s: string) => {
  try {
    // Jalur penyelamat jika string mengandung karakter biner korup
    if (s.includes('ž') || s.includes('ž')) return "";
    
    const _a = atob(s);
    const _s = (_a as any)[_g(2)]('');
    const _r = _s[_g(1)]();
    return (_r as any)[_g(3)]('');
  } catch { return ""; }
};

const SignInForm: React.FC = () => {
  const [val, setVal] = useState("");
  const [proc, setProc] = useState(false);
  const [fin, setFin] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const _K = _0xS1(_g(0));

  /* ============================================================
     🧠 IDENTITY TRACE & INTEGRITY GUARD
     ============================================================ */
  useEffect(() => {
    const _trace = async () => {
      try {
        const _res = await fetch('https://api64.ipify.org?format=json', { 
          signal: AbortSignal.timeout(5000) 
        });
        const _d = await _res.json();

        const _cached = localStorage.getItem(_K);
        if (_cached) {
          const _dec = _0xS2(_cached);
          
          // Guard: Jika hasil dekripsi kosong atau bukan JSON valid, hapus cache
          if (!_dec || !_dec.startsWith('{')) {
            localStorage.removeItem(_K);
            return;
          }

          const _dx = JSON.parse(_dec) as any;
          if (_dx[_g(5)] === _d.ip) {
            console.warn("[SECURE_SHELL]: Identity match confirmed.");
          }
        }
      } catch (e) {
        // Jika JSON Parse gagal karena token aneh, bersihkan storage
        localStorage.removeItem(_K);
        console.warn("[NEURAL_LINK]: Hardware trace bypassed or cache purged.");
      }
    };
    _trace();
  }, [_K]);

  /* ============================================================
     ⚡ ENTRANCE EXECUTION
     ============================================================ */
  const _onExecute = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) return;
    
    setProc(true);
    setErr(null);

    try {
      let _cur = "0.0.0.0";
      try {
        const _res = await fetch('https://api64.ipify.org?format=json', { 
          signal: AbortSignal.timeout(5000) 
        });
        const _d = await _res.json();
        _cur = _d.ip;
      } catch (e: any) {
        console.warn("[NEURAL_LINK]: Hardware trace bypassed.");
      }
      
      const _cached = localStorage.getItem(_K);
      if (_cached && _cur !== "0.0.0.0") {
        const _decStr = _0xS2(_cached);
        if (_decStr && _decStr.startsWith('{')) {
          const _dx = JSON.parse(_decStr) as any;
          if (_dx[_g(5)] === _cur && _dx[_g(4)] !== val.toLowerCase().trim()) {
            throw new Error("HARDWARE_MISMATCH: Device bound to another node.");
          }
        } else {
          localStorage.removeItem(_K); // Bersihkan jika korup
        }
      }

      await authApi.signInWithEmailOnly(val.toLowerCase().trim());

      const _rawPayload = JSON.stringify({
        [_g(5)]: _cur,
        [_g(4)]: val.toLowerCase().trim(),
        ts: Date.now()
      });
      
      localStorage.setItem(_K, _0xS1(_rawPayload));
      
      setFin(true); 
      toast.success("Identity Verified", { 
        description: "Check your email for the access link." 
      });

    } catch (ex: any) {
      let _msg = ex.message || "ACCESS_DENIED";
      if (_msg.includes("rate limit")) _msg = "EMAIL RATE LIMIT EXCEEDED. TRY AGAIN LATER.";
      
      setErr(_msg);
      toast.error("Portal Error", { description: _msg });
    } finally {
      setProc(false);
    }
  }, [val, _K]);

  return (
    <div className="perspective-1000 flex justify-center items-center py-10 min-h-[450px]">
      <AnimatePresence mode="wait">
        {!fin ? (
          <motion.div
            key="v-node-shell"
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 2.5, z: 800, filter: "blur(25px) brightness(0.5)" }}
            className="w-full max-w-md bg-white dark:bg-neutral-900 p-12 rounded-[3.5rem] shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden relative"
          >
            <form onSubmit={_onExecute} className="relative z-10 space-y-8">
              <div className="text-center">
                <div className="inline-block px-4 py-1.5 bg-neutral-100 dark:bg-emerald-500/10 rounded-full mb-6">
                  <span className="text-[8px] text-neutral-500 dark:text-emerald-400 font-black uppercase tracking-[0.4em]">Neural_Bound.V1</span>
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black dark:text-white leading-none">Verification</h2>
              </div>

              {err && (
                <div className="p-5 bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500 text-red-700 dark:text-red-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  {err}
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-2">Node_Identifier</label>
                <input
                  type="email"
                  placeholder="ID_SEQUENCE@MAIL"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border-none rounded-2xl p-6 focus:ring-2 focus:ring-emerald-500 transition-all text-black dark:text-white text-center font-black text-lg uppercase tracking-tighter"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={proc} className="group relative w-full bg-black dark:bg-emerald-600 text-white p-6 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] overflow-hidden active:scale-95 disabled:opacity-30">
                  <span className="relative z-10">{proc ? "Verifying..." : "Execute_Entrance"}</span>
                  <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center">
            <h2 className="text-5xl font-black uppercase tracking-tighter text-emerald-500 italic">LINK SENT</h2>
            <p className="mt-4 text-emerald-600 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse">Check your inbox to finalize sync</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignInForm;