import React, { useState as _s, useEffect as _e } from "react";
import { Link as _L, useParams as _uP } from "react-router-dom";
import { Helmet as _Hm } from "react-helmet-async";
import { Eye as _Ey, Bookmark as _Bm, Hexagon as _Hx, Check as _Ck, WifiOff as _Wo, Share2 as _Sh, ArrowLeft as _Al } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import FormattedDate from "@/components/features/FormattedDate";
import _mA from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import CommentSection from "@/components/articles/CommentSection";
import { useArticleData as _uAD } from "@/hooks/useArticleData";
import { useArticleViews as _uAV } from "@/hooks/useArticleViews";
import ArticleImageGallery from "@/components/features/ArticleImageGallery";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useArticles as _uAs } from "@/hooks/useArticles";
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';
import { supabase } from "@/lib/supabase";
import { enqueue as _enQ } from "@/lib/idbQueue";
import { backoffRetry as _boR } from "@/lib/backoff";

// IMPORT WASM PIPELINE BARU
import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";

const _manageCacheMemory = () => {
  try {
    let totalSize = 0;
    const articleKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("brawnly_article_")) {
        const val = localStorage.getItem(key);
        if (val) {
          totalSize += val.length * 2;
          articleKeys.push(key);
        }
      }
    }
    const MAX_SIZE = 1250000;
    if (totalSize > MAX_SIZE) {
      const keysToRemove = articleKeys.slice(0, Math.ceil(articleKeys.length * 0.3));
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch {}
};

/**
 * Fungsi Upload Teroptimasi (WASM Slashed 1/4 MB Plan + Upsert)
 */
const upload = async (file: Blob, path: string) => {
  try {
    // 1. Validasi awal: pastikan file benar-benar ada
    if (!file || file.size === 0) {
      console.error("Upload aborted: File is empty or null");
      return;
    }

    // 2. Jalankan optimasi (Logic Slashed 1/4 MB)
    let finalFile = file;
    try {
      const optimized = await wasmTranscodeImage(file, "webp", 0.75);
      if (optimized && optimized.size > 0) {
        finalFile = optimized;
      }
    } catch (wasmErr) {
      console.warn("WASM failed, using original file instead");
    }

    // 3. Eksekusi Upload dengan UPSERT
    const { data, error } = await supabase.storage
      .from('images') // Pastikan nama bucket benar
      .upload(path, finalFile, {
        contentType: 'image/webp',
        upsert: true // WAJIB: Agar tidak 400 saat menimpa file lama
      });

    if (error) {
      // Jika masih error 400, cek apakah path mengandung karakter ilegal
      console.error("Supabase Storage Error Details:", error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Critical Upload Failure:", err);
    throw err;
  }
};

export default function ArticleDetail() {
  const { isDark: _iD } = _uTP();
  const { slug: _sl } = _uP<{ slug: string }>();
  const _slV = _sl ?? "unknown";

  const [_cachedArt, _setCachedArt] = _s<any>(() => {
    try {
      const specific = localStorage.getItem(`brawnly_article_${_slV}`);
      if (specific) return JSON.parse(specific);
      const libCache = localStorage.getItem("brawnly_lib_cache");
      if (libCache) {
        const libData = JSON.parse(libCache);
        const found = libData.find((a: any) => a.slug === _slV);
        if (found) {
          return {
            article: found,
            processedData: {
              title: found.title,
              excerpt: found.excerpt,
              paragraphs: found.content ? found.content.split('\n') : [],
              coverImage: found.featured_image,
              midGallery: [],
              bottomGallery: []
            }
          };
        }
      }
    } catch { return null; }
    return null;
  });

  const [_isOff, _sOff] = _s(!navigator.onLine);

  _e(() => {
    const _hO = () => _sOff(false);
    const _hF = () => _sOff(true);
    window.addEventListener('online', _hO);
    window.addEventListener('offline', _hF);
    return () => {
      window.removeEventListener('online', _hO);
      window.removeEventListener('offline', _hF);
    };
  }, []);

  const { processedData: _pD_raw, isLoading: _iL, article: _art_raw } = _uAD();
  const _pD = _pD_raw || _cachedArt?.processedData;
  const _art = _art_raw || _cachedArt?.article;

  _e(() => {
    if (_pD_raw && _art_raw) {
      _manageCacheMemory();
      const _payload = JSON.stringify({ processedData: _pD_raw, article: _art_raw });
      const _key = `brawnly_article_${_slV}`;
      if (localStorage.getItem(_key) !== _payload) {
        try {
          localStorage.setItem(_key, _payload);
        } catch {}
      }
    }
  }, [_pD_raw, _art_raw, _slV]);

  const { data: _allA } = _uAs();
  const _hC = _allA
    ? [..._allA].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3)
    : [];

  const [_iS, _siS] = _s(false);
  const [_nt, _sNt] = _s<{ show: boolean; msg: string; type: 'success' | 'info' }>({
    show: false,
    msg: "",
    type: 'info'
  });

  const _trN = (m: string, t: 'success' | 'info' = 'info') => {
    _sNt({ show: true, msg: m, type: t });
    setTimeout(() => _sNt(p => ({ ...p, show: false })), 3500);
  };

  const _hSv = () => {
    const _nS = !_iS;
    _siS(_nS);
    if (_nS) {
      localStorage.setItem(`brawnly_saved_${_slV}`, "true");
      _trN("ARTICLE ADDED TO COLLECTION", 'success');
    } else {
      localStorage.removeItem(`brawnly_saved_${_slV}`);
      _trN("REMOVED FROM COLLECTION", 'info');
    }
  };

  const _hCL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      _trN("PERMALINK COPIED", 'success');
    } catch {
      _trN("FAILED TO COPY LINK", 'info');
    }
  };

  const _hOS = async (_cD: any) => {
    await _enQ({ type: 'ADD_COMMENT', payload: _cD });
    _trN("OFFLINE: COMMENT QUEUED FOR SYNC", "info");
  };

  const { viewCount: _vC } = _uAV({
    id: _art?.id ?? "",
    slug: _slV,
    initialViews: _art?.views ?? 0,
  });

  _e(() => {
    if (!_pD?.coverImage || !navigator.onLine) return;
    const _syncKey = `brawnly_sync_${_slV}`;
    if (sessionStorage.getItem(_syncKey)) return;

    (async () => {
      try {
        const r = await fetch(_pD.coverImage);
        const b = await r.blob();
        const f = new File([b], `cover-${_slV}.jpg`, { type: b.type });
        
        // Panggil fungsi upload baru dengan penamaan path .webp yang konsisten
        await _boR(() => upload(f, `cover-${_slV}.webp`));
        
        sessionStorage.setItem(_syncKey, "done");
      } catch {}
    })();
  }, [_pD?.coverImage, _slV]);

  if (_iL && !_pD && !_art) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="flex flex-col items-center">
        <div className="w-20 h-[3px] bg-red-600 animate-pulse mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[1em] text-neutral-400">Fetching Editorial</p>
      </div>
    </div>
  );

  if (!_pD || !_art) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white dark:bg-[#0a0a0a] px-6">
      <h1 className="text-[180px] font-black leading-none tracking-tighter italic opacity-10">404</h1>
      <p className="text-sm font-bold uppercase tracking-widest mb-8 text-neutral-500">
        {_isOff ? "OFFLINE & NOT CACHED" : "ENTRY NOT FOUND"}
      </p>
      <_L to="/" aria-label="Back to feed" className="px-12 py-5 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[11px] tracking-widest hover:invert transition-all">Back to Feed</_L>
    </div>
  );

  const { title: _tt, excerpt: _ex, paragraphs: _pg, coverImage: _cI, midGallery: _mG, bottomGallery: _bG } = _pD;
  const _ds = _ex || `Brawnly 2026 Exclusive: ${_tt}`;
  const _iO = _gOI(_cI, 1200);
  const _ln = _pg.filter((l: string) => l.trim() !== "" && l.trim() !== "&nbsp;");

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative">
      <_Hm>
        <title>{_tt} | Brawnly</title>
        <meta name="description" content={_ds} />
        <meta property="og:image" content={_iO} />
      </_Hm>

      <_AP>
        {_nt.show && (
          <_m.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className={`fixed top-10 right-10 z-[100] px-6 py-4 font-black uppercase text-[10px] tracking-widest shadow-2xl border-l-8 ${
              _nt.type === 'success' ? 'bg-emerald-500 text-black border-black' : 'bg-black text-white border-red-600'
            }`}
          >
            {_nt.msg}
          </_m.div>
        )}
      </_AP>

      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
        <button 
          onClick={_hSv} aria-label={_iS ? "Saved" : "Save Article"}
          className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${
            _iS ? 'bg-emerald-500 border-black text-black scale-110' : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'
          }`}
        >
          {_iS ? <_Ck size={20} /> : <_Bm size={20} />}
        </button>
        <button 
          onClick={_hCL} aria-label="Share Link"
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 hover:border-red-600 transition-all duration-500"
        >
          <_Sh size={20} />
        </button>
      </aside>

      <div className="max-w-[1320px] mx-auto px-5 md:px-10">
        <header className="pt-16 pb-10 border-b-[12px] border-black dark:border-white mb-10 relative">
          <div className="flex justify-between items-start">
            <_L to="/" aria-label="Back to feed" className="text-red-700 font-black uppercase text-[13px] tracking-[0.3em] mb-5 flex items-center gap-2 hover:gap-4 transition-all italic">
              <_Al size={14} /> Brawnly Exclusive Selection
            </_L>
            {_isOff && (
              <span className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full">
                <_Wo size={12} /> OFFLINE MODE
              </span>
            )}
          </div>
          <h1 className="text-[45px] md:text-[92px] leading-[0.82] font-black uppercase tracking-tighter mb-10 italic break-words">{_tt}</h1>
          <div className="flex flex-col md:flex-row md:items-end justify-between py-8 border-t-2 border-black dark:border-white gap-6">
            <div className="flex items-center gap-5">
              <_m.div whileHover={{ scale: 1.05 }} className="relative group cursor-pointer">
                <img src={_gOI(_mA, 120)} className="w-14 h-14 object-cover border-2 border-black dark:border-white grayscale group-hover:grayscale-0 transition-all duration-500" alt="Author" crossOrigin="anonymous" />
              </_m.div>
              <div>
                <span className="block text-[15px] font-black uppercase italic">By {_art.author || "Brawnly Editor"}</span>
                <span className="text-[12px] font-black uppercase tracking-widest flex items-center gap-5 opacity-80">
                  <FormattedDate dateString={_art.published_at} formatString="MMMM d, yyyy" />
                </span>
              </div>
            </div>
            <div className="flex items-center gap-8 border-l-0 md:border-l-2 border-black dark:border-white pl-0 md:pl-8">
              <span className="text-2xl font-black italic flex items-center gap-3">
                {_vC.toLocaleString()} <_Ey size={20} className="text-red-600" aria-hidden="true" />
              </span>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          <article className="flex-1 relative">
            <p className="text-[24px] md:text-[32px] leading-[1.1] font-extrabold text-neutral-900 dark:text-neutral-100 mb-14 font-sans tracking-tight">{_ex}</p>

            <div className="mb-16">
              <ArticleCoverImage imageUrl={_cI} title={_tt} slug={_slV} />
              <div className="mt-5 flex justify-between items-center border-b border-black dark:border-white pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Brawnly Digital Asset / Vol. 2026</p>
                <_Hx size={14} className="animate-spin-slow" />
              </div>
            </div>

            <div className="max-w-[840px] mx-auto relative">
              {_ln.map((l: string, i: number) => (
                <p key={i} className="text-[20px] md:text-[22px] leading-[1.85] mb-10 font-serif text-neutral-800 dark:text-neutral-300"
                  dangerouslySetInnerHTML={{
                    __html: l.trim()
                      .replace(/\*\*(.*?)\*\*/g, `<strong class="font-black text-black dark:text-white">$1</strong>`)
                      .replace(/\*(.*?)\*/g, `<em class="italic text-red-700">$1</em>`)
                  }}
                />
              ))}

              {_mG && _mG.length > 0 && (
                <div className="my-20 bg-neutral-50 dark:bg-[#111] border-l-[16px] border-black dark:border-white p-8">
                  <ArticleImageGallery images={_mG} title="" slug={_slV} downloadPrefix="brawnly_mid" startIndex={1} containerClassName="px-0 py-0" />
                </div>
              )}

              {_bG && _bG.length > 0 && (
                <div className="mt-12 mb-24">
                  <h3 className="text-5xl font-black uppercase italic mb-10 tracking-[0.05em] border-b-4 border-black dark:border-white inline-block">The Archive</h3>
                  <ArticleImageGallery images={_bG} title="" slug={_slV} downloadPrefix="brawnly_archive" startIndex={7} containerClassName="px-0 py-0" />
                </div>
              )}
            </div>

            <div className="xl:hidden flex gap-4 mb-16 border-y border-neutral-200 dark:border-neutral-800 py-6">
               <button onClick={_hSv} className={`flex-1 flex items-center justify-center gap-3 py-4 font-black uppercase text-[10px] tracking-widest border-2 transition-all ${
                 _iS ? 'bg-emerald-500 border-black text-black' : 'border-black dark:border-white'
               }`}>
                 {_iS ? <_Ck size={16} /> : <_Bm size={16} />} {_iS ? "SAVED" : "SAVE TO LIBRARY"}
               </button>
               <button onClick={_hCL} className="flex-1 flex items-center justify-center gap-3 py-4 font-black uppercase text-[10px] tracking-widest border-2 border-black dark:border-white">
                 <_Sh size={16} /> SHARE
               </button>
            </div>

            <section className="mt-32 border-t-[12px] border-black dark:border-white pt-16">
              <CommentSection 
                articleId={_art.id} 
                onOfflineSubmit={_hOS} 
              />
            </section>
          </article>

          <aside className="hidden lg:block w-[350px]">
            <div className="sticky top-32">
              <h3 className="text-[14px] font-black uppercase tracking-widest text-red-700 mb-8 italic underline">Hot Content</h3>
              <div className="flex flex-col gap-10">
                {_hC.map((it: any, i: number) => (
                  <_L to={`/article/${it.slug}`} aria-label={`Trending: ${it.title}`} key={it.id} className="group cursor-pointer block">
                    <div className="flex gap-5">
                      <span className="text-4xl font-black text-neutral-100 dark:text-neutral-900 group-hover:text-red-600 transition-colors">0{i + 1}</span>
                      <div>
                        <p className="text-[15px] font-black leading-tight uppercase group-hover:underline line-clamp-2">{it.title}</p>
                        <span className="text-[10px] font-bold text-neutral-400">{it.views} READS</span>
                      </div>
                    </div>
                  </_L>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ScrollToTopButton />
    </main>
  );
}