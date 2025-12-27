import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignInForm from '@/components/common/SignInForms';

/* ======================
    DECRYPTION FRAGMENT
    Sinkron dengan fragmen rahasia di SignUp & Subscription
====================== */
const _0xsys = ['v_identity_v1', 'reverse', 'split', 'join'] as const;

// Fix Error 7015: Explicitly cast to any untuk mengizinkan dynamic property access
const _f = (i: number) => _0xsys[i] as any;

// Fix Error 2349: Breakdown chaining agar call signature tidak hilang
const _0xS4 = (s: string) => {
  const _b = btoa(s) as any;
  const _s = _b[_f(2)]('') as any; // split
  const _r = _s[_f(1)]() as any;   // reverse
  return _r[_f(3)]('');            // join
};

const SignInPage = () => {
  const [isRecognized, setIsRecognized] = useState<boolean | null>(null);

  useEffect(() => {
    const _neuralProbe = () => {
      // Mencari jejak identitas terenkripsi menggunakan signature yang sudah di-fix
      const _K = _0xS4(_f(0));
      const _trace = localStorage.getItem(_K);
      
      // Memberikan status recognisi untuk menentukan intensitas ambient glow
      setIsRecognized(!!_trace);
    };

    _neuralProbe();
  }, []);

  return (
    <main className="flex items-center justify-center min-h-[90vh] bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative">
      
      {/* BACKGROUND SECRET SCANNER (Efek Garis Scan Monitor Jadul) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0">
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, rotateX: 5 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="perspective-1000 w-full flex justify-center px-4 z-10"
      >
        <div className="w-full max-w-md">
          {/* Komponen Utama dengan Logika IP/Email Secret */}
          <SignInForm />
        </div>
      </motion.div>

      {/* AMBIENT GLOW SINKRON DENGAN EMERALD PORTAL */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <AnimatePresence>
          <motion.div 
            key={isRecognized ? "recognized" : "unknown"}
            initial={{ opacity: 0 }}
            animate={{ 
              scale: isRecognized ? [1, 1.3, 1] : [1, 1.1, 1],
              opacity: isRecognized ? [0.05, 0.12, 0.05] : [0.03, 0.06, 0.03]
            }}
            transition={{ repeat: Infinity, duration: isRecognized ? 5 : 10 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] ${
              isRecognized ? 'bg-emerald-500' : 'bg-blue-500/50'
            }`} 
          />
        </AnimatePresence>
      </div>

      {/* SECURE METADATA */}
      <div className="absolute bottom-6 w-full text-center select-none pointer-events-none opacity-20">
        <p className="text-[7px] font-mono tracking-[0.5em] uppercase dark:text-white">
          Access_Node: {isRecognized ? "AUTHORIZED_DEVICE" : "UNKNOWN_ORIGIN"} // Protocol_v1.0.2
        </p>
      </div>
    </main>
  );
};

export default SignInPage;