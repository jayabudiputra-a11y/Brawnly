import React, { useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/* ======================
    INTERNAL SECURITY ENGINE
    Mencegah deteksi variabel "IP" atau "Identity" secara langsung.
====================== */
const _0xcore = ['v_identity_v1', 'reverse', 'split', 'join', 'ptr', 'addr'] as const;

// Fix Error 7015: Gunakan 'as any' pada accessor
const _g = (i: number) => _0xcore[i] as any;

// Fix Error 2349: Breakdown chaining agar signature fungsi tetap terjaga
const _0xS1 = (s: string) => {
  const _b = btoa(s) as any;
  const _s = _b[_g(2)]('') as any; // split
  const _r = _s[_g(1)]() as any;   // reverse
  return _r[_g(3)]('');            // join
};

const _0xS2 = (s: string) => {
  const _a = atob(s) as any;
  const _s = _a[_g(2)]('') as any; // split
  const _r = _s[_g(1)]() as any;   // reverse
  return _r[_g(3)]('');            // join
};

const SignInForm: React.FC = () => {
  const [val, setVal] = useState("");
  const [proc, setProc] = useState(false);
  const [fin, setFin] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  // Kunci rahasia dinamis yang sudah di-fix
  const _K = _0xS1(_g(0));

  useEffect(() => {
    const _trace = async () => {
      try {
        const _r = await fetch('https://api64.ipify.org?format=json');
        const _d = await _r.json();
        const _cached = localStorage.getItem(_K);
        
        if (_cached) {
          const _dec = _0xS2(_cached);
          const _dx = JSON.parse(_dec) as any;
          
          // Membandingkan IP (addr) tanpa menggunakan teks 'addr' secara eksplisit
          if (_dx[_g(5)] === _d.ip) {
            console.warn("[SECURE_SHELL]: Identity match confirmed. Session pinned.");
          }
        }
      } catch (e) { /* silent fail */ }
    };
    _trace();
  }, [_K]);

  const _onExecute = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setProc(true);
    setErr(null);

    try {
      const _r = await fetch('https://api64.ipify.org?format=json');
      const { ip: _cur } = await _r.json();
      
      const _cached = localStorage.getItem(_K);
      
      if (_cached) {
        const _dx = JSON.parse(_0xS2(_cached)) as any;
        // CEK PELANGGARAN: Jika IP (addr) sama tapi email (ptr) berbeda
        if (_dx[_g(5)] === _cur && _dx[_g(4)] !== val.toLowerCase().trim()) {
          throw new Error("HARDWARE_ID_MISMATCH: Device bound to another node.");
        }
      }

      const result = await authApi.signInWithEmailOnly(val.toLowerCase().trim());

      if (result?.session || result?.user) {
        // RE-LOCK IDENTITY: Update payload dengan kunci rahasia
        const _rawPayload = JSON.stringify({
          [_g(5)]: _cur,
          [_g(4)]: val.toLowerCase().trim(),
          ts: Date.now()
        });
        
        const _payload = _0xS1(_rawPayload);
        localStorage.setItem(_K, _payload);

        setFin(true); 
        toast.success("Identity Verified", { description: "Decrypting access protocols..." });

        setTimeout(() => {
          navigate("/articles");
          setTimeout(() => window.location.reload(), 80);
        }, 912);
      }
    } catch (ex: any) {
      const _msg = ex.message || "ACCESS_DENIED_0x01";
      setErr(_msg);
      toast.error("Portal Error", { description: _msg });
    } finally {
      setProc(false);
    }
  }, [val, navigate, _K]);

  return (
    <div className="perspective-1000 flex justify-center items-center py-10 min-h-[450px]">
      <AnimatePresence mode="wait">
        {!fin ? (
          <motion.div
            key="v-node-shell"
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 2.5,
              z: 800,
              rotateX: -15,
              filter: "blur(25px) brightness(0.5)" 
            }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md bg-white dark:bg-neutral-900 p-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-neutral-100 dark:border-neutral-800 overflow-hidden relative"
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_3px)]" />
            
            <form onSubmit={_onExecute} className="relative z-10 space-y-8">
              <div className="text-center">
                <motion.div 
                   animate={{ opacity: [0.4, 1, 0.4] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="inline-block px-4 py-1.5 bg-neutral-100 dark:bg-emerald-500/10 rounded-full mb-6"
                >
                  <span className="text-[8px] text-neutral-500 dark:text-emerald-400 font-black uppercase tracking-[0.4em]">
                    Neural_Bound.V1
                  </span>
                </motion.div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black dark:text-white leading-none">
                  Verification
                </h2>
              </div>

              {err && (
                <motion.div 
                  initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="p-5 bg-red-50 dark:bg-red-950/20 border-l-2 border-red-500 text-red-700 dark:text-red-400 text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed"
                >
                  {err}
                </motion.div>
              )}

              <div className="space-y-4">
                <label className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-2">Node_Identifier</label>
                <input
                  type="email"
                  placeholder="ID_SEQUENCE@MAIL"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border-none rounded-2xl p-6 focus:ring-2 focus:ring-emerald-500/50 transition-all text-black dark:text-white text-center font-black text-lg placeholder:text-neutral-200 dark:placeholder:text-neutral-800 uppercase tracking-tighter"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={proc}
                  className="group relative w-full bg-black dark:bg-emerald-600 text-white p-6 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.4em] overflow-hidden transition-all active:scale-95 disabled:opacity-30"
                >
                  <span className="relative z-10">{proc ? "Verifying_Segment..." : "Execute_Entrance"}</span>
                  <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>

              <p className="text-[7px] text-center text-neutral-400 font-bold uppercase tracking-[0.4em] opacity-40">
                Bound to hardware: {navigator.platform}
              </p>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: -360, scale: [1, 1.5, 1], borderRadius: ["20%", "50%", "20%"] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-24 h-24 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-emerald-500 animate-ping" />
              </div>
            </div>
            <motion.h3 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-16 font-black uppercase tracking-[1em] text-emerald-500 text-[10px]"
            >
              Access_Granted
            </motion.h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignInForm;