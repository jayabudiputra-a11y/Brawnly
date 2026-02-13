import { useMemo as _uM, useState as _uS, useEffect as _uE } from "react";
import { useArticles as _uAs } from "@/hooks/useArticles";
import ArticleCard from "./ArticleCard";
import ScrollToTopButton from "./ScrollToTopButton";
import { motion as _mo, LayoutGroup as _LG, AnimatePresence as _AP } from "framer-motion";

import {
  getArticlesSnap,
  saveArticlesSnap,
  mirrorQuery,
  setCookieHash
} from "@/lib/enterpriseStorage";

import { syncArticles } from "@/lib/supabaseSync";

interface Props {
  selectedTag: string | null;
  searchTerm: string;
  initialData?: any[]; 
}

export default function ArticleList({ selectedTag: _sT, searchTerm: _sTm, initialData: _iD }: Props) {

  // Logic i18n telah dihapus sepenuhnya. Default bahasa dianggap Inggris/Universal.
  
  const { data: _aA, isLoading: _iL, error: _e } = _uAs(_sT || null, _iD);
  const [_hI, _sHI] = _uS<number | null>(null);

  /* ======================
      ⚡ INSTANT SNAP LOAD
      ====================== */
  const _snap = _uM(() => {
    // Jika ada data dari hook (bisa jadi initialData atau hasil fetch), gunakan.
    if (_aA?.length) return _aA;
    // Fallback ke local snapshot jika hook belum return apa-apa
    return getArticlesSnap();
  }, [_aA]);

  /* ======================
      ☁️ BACKGROUND SYNC (TTL 60 MENIT)
      ====================== */
  _uE(() => {
    if (!_aA?.length) return;
    syncArticles(async () => _aA);
  }, [_aA]);

  /* ======================
      💾 SNAPSHOT + MIRROR + COOKIE HASH
      ====================== */
  _uE(() => {
    if (!_aA?.length) return;

    try {
      saveArticlesSnap(_aA);

      _aA.forEach((a: any) => {
        mirrorQuery({
          id: a.id,
          slug: a.slug,
          ts: Date.now()
        });

        if (a.slug) setCookieHash(a.slug);
      });

    } catch {}

  }, [_aA]);

  /* ======================
      🔎 FILTER PIPELINE
      ====================== */
  const _fA = _uM(() => {
    // Gunakan _snap (yang bisa berisi initialData) sebagai basis
    if (!_snap) return [];

    let _cA = _snap;

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
      // Pencarian standar tanpa logic bahasa dinamis
      const _aTt = (_art.title || "").toLowerCase();
      return _aTt.includes(_lS);
    });

  }, [_snap, _sT, _sTm]);

  /* ======================
      📊 STRUCTURED DATA
      ====================== */
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
      ====================== */
  
  // Loading hanya muncul jika benar-benar tidak ada data (bahkan snapshot pun kosong)
  if (_iL && !_snap?.length) {
    return (
      <div className="text-center py-12 bg-transparent" aria-live="polite">
        <div className="w-12 h-12 mx-auto mb-6 animate-spin rounded-full border-4 border-[#00a354] border-t-transparent shadow-[0_0_20px_rgba(0,163,84,0.2)]" />
        <p className="text-lg font-black uppercase tracking-widest animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
          Loading articles...
        </p>
      </div>
    );
  }

  if (_e && !_snap?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-[10px] font-black uppercase tracking-[.3em]">
          System error: failed to load articles
        </p>
      </div>
    );
  }

  if (_fA.length === 0) {
    return (
      <div className="text-center py-16 bg-transparent">
        <p className="text-neutral-400 dark:text-neutral-600 text-[11px] font-black uppercase tracking-[.4em] mb-4">
          {_sT || _sTm.trim() !== "" ? "No matching data found" : "The feed is empty"}
        </p>
        <div className="h-[1px] w-20 mx-auto bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent" />
      </div>
    );
  }

  /* ======================
      🚀 RENDER
      ====================== */
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
            // Unik Key Logic: ID -> Slug -> Index
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