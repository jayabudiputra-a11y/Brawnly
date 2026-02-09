import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignInForm from '@/components/common/SignInForms';

/* ======================
    DECRYPTION FRAGMENT
====================== */
const _0xsys = ['v_identity_v1', 'reverse', 'split', 'join'] as const;

const _f = (i: number) => _0xsys[i];

const _0xS4 = (s: string) => {
  const _b = btoa(s);
  // Fix Error 2349 dengan casting (as any) pada objek sebelum memanggil metode dinamis
  const _s = (_b as any)[_f(2)]('');
  const _r = _s[_f(1)]();
  return _r[_f(3)]('');
};

const SignInPage = () => {
  const [isRecognized, setIsRecognized] = useState<boolean | null>(null);

  useEffect(() => {
    const _neuralProbe = () => {
      try {
        const _K = _0xS4(_f(0));
        const _trace = localStorage.getItem(_K);
        setIsRecognized(!!_trace);
      } catch (e) {
        setIsRecognized(false);
      }
    };

    _neuralProbe();
  }, []);

  return (
    <main className="flex items-center justify-center min-h-[90vh] bg-white dark:bg-black transition-colors duration-500 overflow-hidden relative">
      
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
          <SignInForm />
        </div>
      </motion.div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={isRecognized ? "recognized" : "unknown"}
            initial={{ opacity: 0 }}
            animate={{ 
              scale: isRecognized ? [1, 1.2, 1] : [1, 1.05, 1],
              opacity: isRecognized ? [0.05, 0.1, 0.05] : [0.02, 0.04, 0.02]
            }}
            transition={{ repeat: Infinity, duration: isRecognized ? 6 : 12 }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] transition-colors duration-1000 ${
              isRecognized ? 'bg-emerald-500' : 'bg-blue-600/30'
            }`} 
          />
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 w-full text-center select-none pointer-events-none opacity-20">
        <p className="text-[7px] font-mono tracking-[0.5em] uppercase dark:text-white">
          Access_Node: {isRecognized ? "AUTHORIZED_IDENTITY_DETECTED" : "UNBOUND_HARDWARE"} // Protocol_v1.0.2
        </p>
      </div>
    </main>
  );
};

export default SignInPage;