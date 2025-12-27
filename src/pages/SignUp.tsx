import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignUpForm from "@/components/SignUpForm";

/* ======================
    DECRYPTION FRAGMENT
    Sinkron dengan kunci di Subscription & SignIn
====================== */
const _0xkey = ['v_identity_v1', 'reverse', 'split', 'join'] as const;

// Solusi Error 7015: Gunakan 'any' atau 'keyof string' pada accessor
const _f = (i: number) => _0xkey[i] as any;

const _0xS3 = (s: string) => 
  (btoa(s) as any)[_f(2)]('')[_f(1)]()[_f(3)]('');

const SignUpPage = () => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Jalankan pengecekan integritas sebelum render form
    const _checkInteg = () => {
      // Akses key menggunakan fungsi wrapper yang sudah di-fix
      const _K = _0xS3(_f(0));
      const _auth = localStorage.getItem(_K);
      
      // Jika identity ditemukan, berikan sinyal "Locked"
      if (_auth) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    };

    _checkInteg();
  }, []);

  return (
    <main className="flex items-center justify-center min-h-[90vh] bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative">
      
      {/* SCANLINE OVERLAY - Lapisan tekstur monitor retro */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.01),rgba(0,0,255,0.04))] bg-[length:100%_4px,3px_100%]" />

      <AnimatePresence mode="wait">
        {isAuthorized === false && (
          <motion.div
            key="signup-shell"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="perspective-1000 w-full flex justify-center px-4 z-10"
          >
            <div className="w-full max-w-md">
              <SignUpForm />
            </div>
          </motion.div>
        )}

        {isAuthorized === true && (
          <motion.div
            key="auth-redirect-mask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="z-50 text-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">
              Identity Locked • Redirecting to Node...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AMBIENT DYNAMIC GLOW */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div 
          animate={{ 
            opacity: [0.03, 0.07, 0.03],
            scale: [1, 1.15, 1],
            rotate: [0, 45, 0]
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[140px]" 
        />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* METADATA FOOTER */}
      <div className="absolute bottom-6 w-full text-center opacity-10 select-none">
        <p className="text-[7px] font-mono tracking-[0.4em] uppercase dark:text-white">
          Protocol: Reverse-Auth-V1 // Status: {isAuthorized ? "IDENTITY_PINNED" : "AWAITING_HANDSHAKE"}
        </p>
      </div>
    </main>
  );
};

export default SignUpPage;