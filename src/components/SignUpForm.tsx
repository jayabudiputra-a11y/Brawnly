import React, { useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const _0xsys = ['pending_subscribe_email', 'v_identity_v1', 'reverse', 'split', 'join', 'ptr'] as const;
const _r = (idx: number) => _0xsys[idx];

const _enc = (s: string) => {
  const _b = btoa(s);
  const _s = (_b as any)[_r(3)]('');
  const _rev = _s[_r(2)]();
  return _rev[_r(4)]('');
};

const _dec = (s: string) => {
  const _s_enc = (s as any)[_r(3)]('');
  const _rev = _s_enc[_r(2)]();
  const _b = _rev[_r(4)]('');
  return atob(_b);
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    className="w-full bg-emerald-700 text-white px-4 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-800 disabled:bg-gray-400 transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
    {...props}
  >
    {children}
  </button>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
    {...props}
  />
);

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [v, setV] = useState({ n: "", e: "" });
  const [proc, setProc] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const [fin, setFin] = useState(false);

  const _K = _enc(_r(1)); 

  useEffect(() => {
    const _verifyTrace = () => {
      const _cached = localStorage.getItem(_K);
      if (_cached) {
        try {
          const _decrypted = _dec(_cached);
          const _d = JSON.parse(_decrypted);
          if (_d && _d[_r(5)]) {
             navigate("/articles");
          }
        } catch (err) { localStorage.removeItem(_K); }
      }
    };

    const _pending = localStorage.getItem(_r(0));
    if (_pending) setV(prev => ({ ...prev, e: _pending }));
    
    _verifyTrace();
  }, [navigate, _K]);

  const _handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setV(prev => ({ ...prev, [name === 'name' ? 'n' : 'e']: value }));
  };

  const _onCommit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (proc) return;
    setProc(true);
    setFail(null);

    try {
      let _addr = "0.0.0.0";
      try {
        const _res = await fetch('https://api64.ipify.org?format=json').catch(() => null);
        if (_res) {
          const _data = await _res.json();
          _addr = _data.ip;
        }
      } catch (ipErr) {
        console.warn("Trace capture bypassed.");
      }

      const { user } = await authApi.signUp({
        name: v.n.trim(),
        email: v.e.trim(),
      });

      if (user) {
        const _payload = _enc(JSON.stringify({
          addr: _addr,
          [_r(5)]: v.e.toLowerCase().trim(),
          ts: Date.now()
        }));
        
        localStorage.setItem(_K, _payload);
        localStorage.removeItem(_r(0));

        setFin(true); 

        toast.success("Identity Verified", {
          description: `Welcome, ${v.n}. Access protocol initialized.`
        });

        setTimeout(() => {
          navigate("/profile");
          setTimeout(() => window.location.reload(), 200);
        }, 1500);
      }
    } catch (err: any) {
      const _msg = err?.message || "Protocol Error 0x82";
      setFail(_msg);
      toast.error("Auth Failed", { description: _msg });
    } finally {
      setProc(false);
    }
  }, [v, navigate, _K, proc]);

  return (
    <div className="perspective-1000 flex justify-center items-center py-6 min-h-[500px]">
      <AnimatePresence mode="wait">
        {!fin ? (
          <motion.div
            key="v-form-node"
            initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ 
              opacity: 0, 
              scale: 2.2,
              z: 600,
              filter: "blur(20px) contrast(1.2)", 
              rotateX: -15 
            }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-neutral-100 relative overflow-hidden"
          >
            {proc && (
              <motion.div 
                className="absolute inset-0 bg-emerald-500/5 pointer-events-none z-50 backdrop-blur-[1px]"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}

            <form onSubmit={_onCommit} className="space-y-6 relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black leading-none">
                  New Entry
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="h-[1px] w-4 bg-emerald-500"></span>
                  <p className="text-[9px] text-emerald-700 font-black uppercase tracking-[0.3em]">
                    Create Neural Key
                  </p>
                  <span className="h-[1px] w-4 bg-emerald-500"></span>
                </div>
              </div>

              {fail && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[8px] font-black uppercase tracking-widest animate-pulse">
                  {fail}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400 ml-1">
                    Node.Identity_Name
                  </label>
                  <Input
                    name="name"
                    type="text"
                    placeholder="FULL NAME"
                    value={v.n}
                    onChange={_handleInput}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-400 ml-1">
                    Node.Security_Mail
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    value={v.e}
                    onChange={_handleInput}
                    required
                  />
                </div>
              </div>

              <div className="mt-10">
                <button 
                  type="submit" 
                  disabled={proc}
                  className="w-full bg-emerald-700 text-white px-4 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-800 disabled:opacity-50 transition-all active:scale-95"
                >
                  {proc ? "Establishing Link..." : "Bind Identity & Enter"}
                </button>
              </div>

              <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-neutral-50">
                <div className="flex items-center gap-3 text-[9px] text-neutral-400 font-black uppercase tracking-widest">
                  <span>Authorized already?</span>
                  <Link to="/signin" className="text-black hover:text-emerald-700 transition-colors underline underline-offset-4">
                    Decrypt Here
                  </Link>
                </div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-v-node"
            initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="flex flex-col items-center justify-center text-center p-12"
          >
             <div className="relative mb-10">
                <motion.div 
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="w-28 h-28 border-2 border-dashed border-emerald-500/30 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 bg-emerald-600 rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                      <div className="w-4 h-4 bg-white rounded-full animate-ping" />
                   </div>
                </div>
             </div>
            
            <h2 className="text-5xl font-black uppercase tracking-tighter text-emerald-950 italic">
              SYNCED
            </h2>
            <p className="mt-4 text-emerald-600 font-bold uppercase tracking-[0.5em] text-[10px] animate-pulse">
              Injecting Identity Segments...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignUpForm;