import { useMemo as _uM, useState as _uS, useEffect as _uE } from "react";
import { useArticles as _uAs } from "@/hooks/useArticles";
import ArticleCard from "./ArticleCard";
import ScrollToTopButton from "./ScrollToTopButton";
import { motion as _mo, LayoutGroup as _LG, AnimatePresence as _AP } from "framer-motion";

// Modul Infrastruktur
import {
  getArticlesSnap,
  saveArticlesSnap,
  mirrorQuery,
  setCookieHash,
  warmupEnterpriseStorage
} from "@/lib/enterpriseStorage";

import { syncArticles } from "@/lib/supabaseSync";
import { loadSnap, saveSnap } from "@/lib/storageSnap";
import { openDB, enqueue } from "@/lib/idbQueue";
import { detectBestFormat } from "@/lib/imageFormat";

interface Props {
  selectedTag: string | null;
  searchTerm: string;
  initialData?: any[]; 
}

export default function ArticleList({ selectedTag: _sT, searchTerm: _sTm, initialData: _iD }: Props) {
  
  const { data: _aA, isLoading: _iL, error: _e } = _uAs(_sT || null, _iD);
  const [_hI, _sHI] = _uS<number | null>(null);

  /* ======================
      ⚡ ENTERPRISE WARMUP
      ====================== */
  _uE(() => {
    warmupEnterpriseStorage();
    // Warmup IndexedDB
    openDB().catch(() => console.warn("IDB initialization deferred"));
  }, []);

  /* ======================
      ⚡ INSTANT SNAP LOAD
      ====================== */
  const _snap = _uM(() => {
    // 1. Prioritas data live dari hook
    if (_aA?.length) return _aA;
    // 2. Fallback ke Storage Snap (V1)
    const _v1Snap = loadSnap();
    if (_v1Snap?.length) return _v1Snap;
    // 3. Fallback ke Enterprise Snap (V3)
    return getArticlesSnap();
  }, [_aA]);

  /* ======================
      ☁️ BACKGROUND SYNC & PERSISTENCE
      ====================== */
  _uE(() => {
    if (!_aA?.length) return;

    // A. Sync ke Supabase (TTL check internal)
    syncArticles(async () => _aA);

    // B. Simpan Snapshot di kedua versi (V1 & V3)
    saveArticlesSnap(_aA);
    // FIX: Tambahkan tipe data ': any' pada parameter 'a'
    saveSnap(_aA.slice(0, 15).map((a: any) => ({
      title: a.title,
      slug: a.slug,
      image: a.featured_image || a.featured_image_url
    })));

    // C. Mirroring & Cookie Hashing
    try {
      _aA.forEach((a: any) => {
        mirrorQuery({
          id: a.id,
          slug: a.slug,
          ts: Date.now()
        });

        if (a.slug) setCookieHash(a.slug);
      });
    } catch (err) {
      // Enqueue error log ke IndexedDB jika sistem mirror gagal
      enqueue({ type: "MIRROR_ERR", msg: "Failed to mirror row", ts: Date.now() });
    }

  }, [_aA]);

  /* ======================
      🔎 FILTER PIPELINE
      ===================== */
  const _fA = _uM(() => {
    if (!_snap) return [];

    let _cA = [..._snap];

    if (_sT) {
      const _lST = _sT.toLowerCase();
      _cA = _cA.filter((_art: any) =>
        _art.tags?.some((_t: string) => _t.toLowerCase() === _lST)
      );
    }

    const _sSTm = _sTm || "";
    if (_sSTm.trim() === "") return _cA;

    const _lS = _sSTm.toLowerCase();

    return _cA.filter((_art: any) => {
      const _aTt = (_art.title || "").toLowerCase();
      return _aTt.includes(_lS);
    });

  }, [_snap, _sT, _sTm]);

  /* ======================
      📊 STRUCTURED DATA
      ===================== */
  const _jLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": _fA.slice(0, 10).map((_a: any, _i: number) => ({
      "@type": "ListItem",
      "position": _i + 1,
      "url": `https://brawnly.online/article/${_a.slug}`,
      "name": _a.title
    }))
  };

  /* ======================
      ⏳ STATES (LOADING / ERROR / EMPTY)
      ===================== */
  
  if (_iL && !_snap?.length) {
    return (
      <div className="text-center py-12 bg-transparent" aria-live="polite">
        <div className="w-12 h-12 mx-auto mb-6 animate-spin rounded-full border-4 border-[#00a354] border-t-transparent shadow-[0_0_20px_rgba(0,163,84,0.2)]" />
        <p className="text-lg font-black uppercase tracking-widest animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
          Syncing Brawnly Nodes...
        </p>
      </div>
    );
  }

  if (_e && !_snap?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-[10px] font-black uppercase tracking-[.3em]">
          Uplink Failure: Offline Snapshot Missing
        </p>
      </div>
    );
  }

  if (_fA.length === 0) {
    return (
      <div className="text-center py-16 bg-transparent">
        <p className="text-neutral-400 dark:text-neutral-600 text-[11px] font-black uppercase tracking-[.4em] mb-4">
          {_sT || _sTm.trim() !== "" ? "No nodes found in this sector" : "The grid is currently empty"}
        </p>
        <div className="h-[1px] w-20 mx-auto bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent" />
      </div>
    );
  }

  /* ======================
      🚀 RENDER
      ===================== */
  return (
    <>
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>

      <_LG id="article-lasso">
        <div
          role="list"
          onMouseLeave={() => _sHI(null)}
          className="flex flex-col max-w-[900px] mx-auto w-full px-0 divide-y divide-gray-100 dark:divide-neutral-900 mt-0 relative"
        >
          {_fA.map((_a: any, _idx: number) => {
            const itemKey = _a.id || _a.slug || `article-idx-${_idx}`;
            
            return (
              <div
                key={itemKey}
                role="listitem"
                className="relative w-full group transition-all duration-300"
                onMouseEnter={() => _sHI(_idx)}
              >
                <_AP>
                  {_hI === _idx && (
                    <_mo.div
                      layoutId="highlight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35
                      }}
                      className="absolute inset-0 z-0 bg-yellow-400/5 dark:bg-yellow-400/10 border-y-2 border-yellow-400/50 dark:border-yellow-400"
                      style={{ boxShadow: "0 0 15px rgba(250, 204, 21, 0.2)" }}
                    />
                  )}
                </_AP>

                <div className="relative z-10 py-1">
                  <ArticleCard
                    article={_a}
                    priority={_idx < 2}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </_LG>

      <ScrollToTopButton />
    </>
  );
}