import { Routes as _Rs, Route as _Rt, useLocation as _uL, Navigate as _Nv } from "react-router-dom";
import React, { useEffect as _e, lazy as _lz, Suspense as _Sp } from "react";
import _L from "@/components/layout/Layout";
import _IF from "@/components/common/IframeA11yFixer";
import _ST from "@/components/features/ScrollToTopButton";
import _MT from "@/components/seo/MetaTags";
import { useAuth } from "@/hooks/useAuth";

import _mP from "@/assets/myPride.gif";

const _safeLazy = (importFunc: () => Promise<any>) => 
  _lz(() => importFunc().catch(() => {
    if (!navigator.onLine) {
      return { 
        default: () => (
          <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6 z-[9999] relative">
            <h1 className="text-4xl md:text-6xl font-black text-red-600 mb-4 tracking-widest italic">OFFLINE</h1>
            <button onClick={() => window.location.reload()} className="px-8 py-4 border-2 border-white text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all active:scale-95">Coba Lagi</button>
          </div>
        ) 
      };
    }
    window.location.reload();
    return { default: () => null as any };
  }));

const _H = _safeLazy(() => import("@/pages/Home"));
const _As = _safeLazy(() => import("@/pages/Articles"));
const _AP = _safeLazy(() => import("@/pages/ArticlePage"));
const _Cy = _safeLazy(() => import("@/pages/Category"));
const _Ab = _safeLazy(() => import("@/pages/About"));
const _Ct = _safeLazy(() => import("@/pages/Contact"));
const _Ar = _safeLazy(() => import("@/pages/Author"));
const _NF = _safeLazy(() => import("@/pages/NotFound"));
const _Sb = _safeLazy(() => import("@/pages/Subscription"));
const _Pf = _safeLazy(() => import("@/pages/Profile"));
const _AC = _safeLazy(() => import("@/pages/AuthCallback"));
const _Lb = _safeLazy(() => import("@/pages/Library"));
const _Vd = _safeLazy(() => import("@/pages/Videos"));
const _Ts = _safeLazy(() => import("@/pages/Terms"));
const _Py = _safeLazy(() => import("@/pages/Privacy"));
const _Es = _safeLazy(() => import("@/pages/Ethics"));
const _SU = _safeLazy(() => import("@/pages/SignUp"));
const _SI = _safeLazy(() => import("@/pages/SignIn"));

// PROTECTED ROUTE REVISI: Penjaga Identitas Ketat
const _PR: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const _loc = _uL();

  // 1. Jika masih loading, tampilkan spinner (Sangat penting agar rute tidak melompat)
  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // 2. Deteksi Alur Verifikasi (Token di URL)
  const _isAuthFlow = _loc.hash.includes("access_token") || 
                     _loc.search.includes("code") || 
                     _loc.pathname.includes("auth/callback");

  // 3. JIKA SEDANG DI PROFILE: 
  // Biarkan masuk jika ada user ATAU sedang proses verifikasi.
  // Jika tidak ada keduanya, baru tendang ke signin.
  if (_loc.pathname === "/profile") {
    if (user || _isAuthFlow) return <>{children}</>;
    return <_Nv to="/signin" replace />;
  }

  // 4. UNTUK HALAMAN PROTECTED LAINNYA:
  if (!user && !_isAuthFlow) return <_Nv to="/signin" replace />;
  
  return <>{children}</>;
};

function App() {
  const { pathname: _p } = _uL();
  _e(() => { window.scrollTo(0, 0); }, [_p]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <_MT title="Brawnly Smart Tracker" description="Next-gen fitness platform 2026." image={_mP} />
      <_IF /><_ST />
      <_Sp fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <_Rs>
          <_Rt element={<_L />}>
            <_Rt path="/" element={<_H />} />
            <_Rt path="articles" element={<_As />} />
            <_Rt path="subscribe" element={<_Sb />} />
            
            {/* Rute Profile Terproteksi */}
            <_Rt path="profile" element={<_PR><_Pf /></_PR>} />
            
            <_Rt path="library" element={<_Lb />} />
            <_Rt path="videos" element={<_Vd />} />
            <_Rt path="article/:slug" element={<_AP />} />
            <_Rt path="category/:slug" element={<_Cy />} />
            <_Rt path="about" element={<_Ab />} />
            <_Rt path="contact" element={<_Ct />} />
            <_Rt path="author" element={<_Ar />} />
            <_Rt path="auth/callback" element={<_AC />} />
            <_Rt path="terms" element={<_Ts />} />
            <_Rt path="privacy" element={<_Py />} />
            <_Rt path="ethics" element={<_Es />} />
          </_Rt>
          <_Rt path="/signup" element={<_SU />} />
          <_Rt path="/signin" element={<_SI />} />
          <_Rt path="*" element={<_NF />} />
        </_Rs>
      </_Sp>
    </div>
  );
}
export default App;