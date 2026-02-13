import React, { useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const _0xcore = ['v_identity_v1', 'reverse', 'split', 'join', 'ptr', 'addr'] as const;
const _g = (i: number) => _0xcore[i];

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
    if (s.includes('ž')) return "";
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
  const _K = _0xS1(_g(0));

  // Trace Identity tanpa AbortSignal yang kaku
  useEffect(() => {
    const _trace = async () => {
      try {
        const _res = await fetch('https://api64.ipify.org?format=json');
        if (!_res.ok) return;
        
        const _d = await _res.json();
        const _cached = localStorage.getItem(_K);
        if (_cached) {
          const _dec = _0xS2(_cached);
          if (_dec && _dec.startsWith('{')) {
            const _dx = JSON.parse(_dec) as any;
            if (_dx[_g(5)] === _d.ip) {
              console.log("[IDENTITY_SYNC]: Node verified.");
            }
          }
        }
      } catch (e) {
        // Silent catch: Menghindari log error Abort di konsol
      }
    };
    _trace();
  }, [_K]);

  const _onExecute = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim() || proc) return;
    setProc(true);
    setErr(null);

    try {
      let _cur = "0.0.0.0";
      try {
        const _res = await fetch('https://api64.ipify.org?format=json');
        const _d = await _res.json();
        _cur = _d.ip;
      } catch (e) {
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
      toast.success("Identity Verified");
    } catch (ex: any) {
      setErr(ex.message || "ACCESS_DENIED");
    } finally {
      setProc(false);
    }
  }, [val, _K, proc]);

  return (
    <div className="perspective-1000 flex justify-center items-center py-6 px-4 min-h-[450px]">
      <AnimatePresence mode="wait">
        {!fin ? (
          <motion.div
            key="v-node-shell"
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
            className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 sm:p-10 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden"
          >
            <form onSubmit={_onExecute} className="space-y-6 md:space-y-8">
              <div className="text-center">
                <div className="inline-block px-3 py-1 bg-neutral-100 dark:bg-emerald-500/10 rounded-full mb-4">
                  <span className="text-[7px] md:text-[8px] text-neutral-500 dark:text-emerald-400 font-black uppercase tracking-[0.3em]">Neural_Bound.V1</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-black dark:text-white leading-none">
                  Verification
                </h2>
              </div>

              {err && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500 text-red-700 dark:text-red-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest break-words">
                  {err}
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[7px] md:text-[8px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-2">Node_Identifier</label>
                <input
                  type="email"
                  placeholder="ID_SEQUENCE@MAIL"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border-none rounded-xl md:rounded-2xl p-4 md:p-6 focus:ring-2 focus:ring-emerald-500 transition-all text-black dark:text-white text-center font-black text-base md:text-lg uppercase tracking-tighter"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={proc} 
                  className="group relative w-full bg-black dark:bg-emerald-600 text-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[9px] md:text-[10px] tracking-[0.3em] overflow-hidden active:scale-95 disabled:opacity-30"
                >
                  <span className="relative z-10">{proc ? "Verifying..." : "Execute_Entrance"}</span>
                  <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center p-6 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-emerald-500 italic">LINK SENT</h2>
            <p className="mt-4 text-emerald-600 font-bold uppercase tracking-[0.3em] text-[9px] animate-pulse">
              Check your inbox to finalize sync
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignInForm;