import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SignUpForm from "@/components/SignUpForm";

const _0xkey = ['v_identity_v1', 'reverse', 'split', 'join'] as const;

const _f = (i: number) => _0xkey[i] as any;


const _0xS3 = (s: string) => {
  const _b = btoa(s) as any;
  const _s = _b[_f(2)]('') as any;
  const _r = _s[_f(1)]() as any;
  return _r[_f(3)]('');
};

const SignUpPage = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const _checkInteg = () => {
      const _K = _0xS3(_f(0));
      const _auth = localStorage.getItem(_K);
      
      if (_auth) {
        setIsAuthorized(true);
        setTimeout(() => navigate("/signin"), 2000);
      } else {
        setIsAuthorized(false);
      }
    };

    _checkInteg();
  }, [navigate]);

  return (
    <main className="flex items-center justify-center min-h-[90vh] bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative">
      
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[length:100%_4px,3px_100%]" />

      <AnimatePresence mode="wait">
        {isAuthorized === false ? (
          <motion.div
            key="signup-shell"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="perspective-1000 w-full flex justify-center px-4 z-10"
          >
            <div className="w-full max-w-md">
              <SignUpForm />
            </div>
          </motion.div>
        ) : isAuthorized === true ? (
          <motion.div
            key="auth-redirect-mask"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-50 text-center space-y-4"
          >
            <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">
              Identity Locked • Relocating to Portal...
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div 
          animate={{ 
            opacity: isAuthorized ? [0.05, 0.1, 0.05] : [0.03, 0.07, 0.03],
            scale: isAuthorized ? [1.2, 1.4, 1.2] : [1, 1.15, 1],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[120px] transition-colors duration-1000 ${
            isAuthorized ? 'bg-emerald-500/30' : 'bg-emerald-500/10'
          }`} 
        />
      </div>

      <div className="absolute bottom-6 w-full text-center opacity-10 select-none">
        <p className="text-[7px] font-mono tracking-[0.4em] uppercase dark:text-white">
          Protocol: Reverse-Auth-V1 // Node: {isAuthorized ? "SECURE_BIND" : "GUEST_HANDSHAKE"}
        </p>
      </div>
    </main>
  );
};

export default SignUpPage;