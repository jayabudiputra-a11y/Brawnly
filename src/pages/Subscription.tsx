import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * @layer INTERNAL_CORE_OBFUSCATION
 */
const _0x4c2a = ['pending_subscribe_email', 'v_identity_v1', 'reverse', 'split', 'join', 'ptr'] as const;

const _hash = (i: number) => _0x4c2a[i] as any;

const _0x1f92 = (s: string) => {
  const _b = btoa(s) as any;
  const _s = _b[_hash(3)]('') as any;
  const _r = _s[_hash(2)]() as any;
  return _r[_hash(4)]('');
};

const _0x92f1 = (s: string) => {
  const _a = atob(s) as any;
  const _s = _a[_hash(3)]('') as any;
  const _r = _s[_hash(2)]() as any;
  return _r[_hash(4)]('');
};

const Subscription = () => {
  const [val, setVal] = useState('');
  const [isDiverging, setIsDiverging] = useState(false);
  const navigate = useNavigate();

  const _K = useMemo(() => _0x1f92(_hash(1)), []);
  const _E = useMemo(() => _hash(0), []);

  useEffect(() => {
    const _initVerify = () => {
      const _cache = localStorage.getItem(_K);
      if (!_cache) return;
      
      try {
        const _decoded = _0x92f1(_cache);
        const _dx = JSON.parse(_decoded) as any;
        
        if (_dx && _dx[_hash(5)]) {
          toast.info('Terminal Active', {
            description: 'Identity sequence recognized. Relocating to access portal...',
          });
          
          setIsDiverging(true);
          setTimeout(() => navigate('/signin'), 800);
        }
      } catch (e) {
        localStorage.removeItem(_K);
      }
    };

    _initVerify();
  }, [navigate, _K]);

  const _onProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val || val.length < 5) return;

    setIsDiverging(true);
    localStorage.setItem(_E, val.toLowerCase().trim());

    toast.success('Sequence Locked', {
      description: 'Synchronizing device fingerprint with neural key...',
    });

    setTimeout(() => {
      navigate('/signup');
    }, 692);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-white dark:bg-black perspective-1000 overflow-hidden relative">
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[length:100%_3px,2px_100%]" />

      <AnimatePresence mode="wait">
        {!isDiverging ? (
          <motion.div
            key="subscription-node"
            initial={{ opacity: 0, scale: 0.92, rotateY: 8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{
              opacity: 0,
              scale: 2.3,
              z: 750,
              rotateX: -25,
              filter: 'blur(20px) brightness(1.8)'
            }}
            transition={{ duration: 0.9, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-900 p-12 rounded-[3.5rem] shadow-[0_45px_90px_-15px_rgba(0,0,0,0.35)] border border-neutral-100 dark:border-neutral-800 relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            <div className="text-center">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-4 py-1.5 rounded-full mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-neutral-400">
                  Secure.Protocol_v1
                </span>
              </motion.div>

              <h2 className="text-4xl font-black text-black dark:text-white uppercase tracking-tighter leading-none italic">
                Get Access
              </h2>

              <p className="mt-5 text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                Hardware Identity Mapping <br />
                <span className="text-emerald-500">Single Device / Encrypted Key</span>
              </p>
            </div>

            <form className="mt-10 space-y-5" onSubmit={_onProceed}>
              <div className="group relative">
                <input
                  type="email"
                  required
                  className="w-full px-6 py-6 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all placeholder:text-neutral-200 dark:placeholder:text-neutral-800 text-center text-lg font-black uppercase tracking-tighter"
                  placeholder="ID_SEQUENCE@MAIL"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="group relative w-full overflow-hidden py-6 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[11px] tracking-[0.4em] rounded-2xl transition-all hover:scale-[1.03] active:scale-95 shadow-2xl"
              >
                <span className="relative z-10">Initialize Gate</span>
                <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>

              <div className="text-center pt-6 border-t border-neutral-50 dark:border-neutral-800">
                <p className="text-[8px] text-neutral-400 font-medium uppercase tracking-[0.3em] leading-loose opacity-60">
                  Neural-link bound to hardware. <br/>
                  Unauthorized bypass triggers node lockout.
                </p>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-emerald-500 font-black uppercase tracking-[0.5em] text-[10px]">
              Diverging Stream...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500 rounded-full blur-[150px] pointer-events-none -z-10" 
      />
    </div>
  )
}

export default Subscription