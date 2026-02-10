import { Routes as _Rs, Route as _Rt, useLocation as _uL } from "react-router-dom";
import React, { useEffect as _e, lazy as _lz, Suspense as _Sp } from "react";
import _L from "@/components/layout/Layout";
import _IF from "@/components/common/IframeA11yFixer";
import _ST from "@/components/features/ScrollToTopButton";
import _MT from "@/components/seo/MetaTags";
import type { AuthPageLayoutProps as _APLP } from "@/types";
import { openDB } from '@/lib/idbQueue';
import { commentsApi as _api } from "@/lib/api";
import { backoffRetry as _boR } from "@/lib/backoff";

import _mP from "@/assets/myPride.gif";
import _mL from "@/assets/masculineLogo.svg";
import _bG from "@/assets/Brawnly.gif";
import _fS from "@/assets/Brawnly-favicon.svg";

const _H = _lz(() => import("@/pages/Home"));
const _As = _lz(() => import("@/pages/Articles"));
const _AP = _lz(() => import("@/pages/ArticlePage").catch(() => { window.location.reload(); return { default: () => null as any }; }));
const _Cy = _lz(() => import("@/pages/Category"));
const _Ab = _lz(() => import("@/pages/About"));
const _Ct = _lz(() => import("@/pages/Contact"));
const _Ar = _lz(() => import("@/pages/Author"));
const _NF = _lz(() => import("@/pages/NotFound"));
const _Sb = _lz(() => import("@/pages/Subscription"));
const _Pf = _lz(() => import("@/pages/Profile"));
const _AC = _lz(() => import("@/pages/AuthCallback"));
const _Lb = _lz(() => import("@/pages/Library"));
const _Ts = _lz(() => import("@/pages/Terms"));
const _Py = _lz(() => import("@/pages/Privacy"));
const _Es = _lz(() => import("@/pages/Ethics"));
const _SUF = _lz(() => import("@/components/SignUpForm"));
const _SIF = _lz(() => import("@/components/common/SignInForms"));

const _AL: React.FC<_APLP> = ({ children: _c, title: _t }) => (
  <div className="min-h-screen flex items-center justify-center bg-black p-4">
    <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl">
      <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
        {_t}
      </h1>
      {_c}
    </div>
  </div>
);

function App() {
  const { pathname: _p } = _uL();

  _e(() => {
    window.scrollTo(0, 0);
  }, [_p]);

  // OFFLINE QUEUE SYNC LOGIC WITH EXPONENTIAL BACKOFF
  _e(() => {
    const handleOnline = async () => {
      console.log("⚡ [BRAWNLY] Connection Restored. Syncing Queue...");
      try {
        const _db = await openDB();
        const _tx = _db.transaction("sync", "readwrite");
        const _os = _tx.objectStore("sync");
        const _req = _os.getAll();

        _req.onsuccess = async () => {
          const _items = _req.result;
          if (_items.length === 0) return;

          for (const _item of _items) {
            if (_item.type === 'ADD_COMMENT') {
              try {
                // Menggunakan backoffRetry untuk membungkus pengiriman komentar
                await _boR(() => 
                  _api.addComment(
                    _item.payload.article_id, 
                    _item.payload.content, 
                    _item.payload.parent_id
                  )
                );
                console.log("✅ Comment Synced Successfully");
              } catch (e) {
                console.error("❌ Sync failed after multiple attempts for item:", _item);
              }
            }
          }
          // Bersihkan antrean hanya setelah proses percobaan selesai
          const _clearTx = _db.transaction("sync", "readwrite");
          _clearTx.objectStore("sync").clear();
        };
      } catch (_err) {
        console.error("Critical Sync Error:", _err);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const _jLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Brawnly",
    "url": "https://brawnly.online",
    "logo": `https://brawnly.online${_mL}`,
    "image": `https://brawnly.online${_bG}`,
    "description": "Smart Fitness and Wellness Tracker Application 2026",
    "author": {
      "@type": "Person",
      "name": "Budi Putra Jaya"
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-green-500 selection:text-black transition-colors duration-300">
      <_MT 
        title="Brawnly Smart Tracker" 
        description="Next-gen fitness and wellness intelligence platform 2026."
        image={_mP}
      />
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>
      <_IF />
      <_ST />

      <_Sp fallback={
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <_Rs>
          <_Rt element={<_L />}>
            <_Rt path="/" element={<_H />} />
            <_Rt path="articles" element={<_As />} />
            <_Rt path="subscribe" element={<_Sb />} />
            <_Rt path="profile" element={<_Pf />} />
            <_Rt path="library" element={<_Lb />} />
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

          <_Rt path="/signup" element={<_AL title="Join Brawnly"><_SUF /></_AL>} />
          <_Rt path="/signin" element={<_AL title="Welcome Back"><_SIF /></_AL>} />
          <_Rt path="*" element={<_NF />} />
        </_Rs>
      </_Sp>
    </div>
  );
}

export default App;