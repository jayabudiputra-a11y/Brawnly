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

// ==========================================
// BRAWNLY OFFLINE-SAFE LAZY LOADER (V2)
// Menangani Error "Failed to fetch dynamically imported module"
// ==========================================
const _safeLazy = (importFunc: () => Promise<any>) => 
  _lz(() => importFunc().catch(() => {
    // Jika offline, tampilkan UI darurat daripada aplikasi crash layar putih
    if (!navigator.onLine) {
      return { 
        default: () => (
          <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6 z-[9999] relative">
            <h1 className="text-4xl md:text-6xl font-black text-red-600 mb-4 tracking-widest italic">OFFLINE</h1>
            <p className="text-xs md:text-sm uppercase tracking-widest opacity-50 mb-8 max-w-md">
              Halaman ini belum tersimpan di memori lokal (Cache). Silakan sambungkan kembali internet Anda.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-4 border-2 border-white text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all active:scale-95"
            >
              Coba Lagi
            </button>
          </div>
        ) 
      };
    }
    // Jika online tapi gagal (misal file chunk berubah saat deploy baru), paksa reload
    window.location.reload();
    return { default: () => null as any };
  }));

// ROUTE DEFINITIONS MENGGUNAKAN SAFE LOADER
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
const _Vd = _safeLazy(() => import("@/pages/Videos")); // ROUTE VIDEOS DITAMBAHKAN DI SINI
const _Ts = _safeLazy(() => import("@/pages/Terms"));
const _Py = _safeLazy(() => import("@/pages/Privacy"));
const _Es = _safeLazy(() => import("@/pages/Ethics"));
const _SUF = _safeLazy(() => import("@/components/SignUpForm"));
const _SIF = _safeLazy(() => import("@/components/common/SignInForms"));

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
            <_Rt path="videos" element={<_Vd />} /> {/* ROUTE VIDEOS DITAMBAHKAN DI SINI */}
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