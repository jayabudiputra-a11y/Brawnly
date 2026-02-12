import React, { useState as _s, useEffect as _e, useMemo as _uM } from "react";
import { Link as _L, useParams as _uP } from "react-router-dom";
import { Helmet as _Hm } from "react-helmet-async";
import { Eye as _Ey, Bookmark as _Bm, Hexagon as _Hx, Check as _Ck, WifiOff as _Wo, Share2 as _Sh, ArrowLeft as _Al } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";

// Components & Assets
import FormattedDate from "@/components/features/FormattedDate";
import _mA from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import CommentSection from "@/components/articles/CommentSection";
import ArticleImageGallery from "@/components/features/ArticleImageGallery";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";

// Hooks & Libs
import { useArticleData as _uAD } from "@/hooks/useArticleData";
import { useArticleViews as _uAV } from "@/hooks/useArticleViews";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useArticles as _uAs } from "@/hooks/useArticles";
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';
import { enqueue as _enQ } from "@/lib/idbQueue";
import { CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";

// Enterprise Libs (Synced with your V3 system)
import { wasmTranscodeImage as _wTI, wasmCreatePlaceholder as _wCP } from "@/lib/wasmImagePipeline";
import { wasmVideoToThumbnail as _wVT } from "@/lib/wasmVideoPipeline";
import { detectBestFormat as _dBF } from "@/lib/imageFormat";
import { mirrorQuery as _mQ, setCookieHash as _sCH } from "@/lib/enterpriseStorage";
import { backoffRetry as _bOR } from "@/lib/backoff";

/* ============================================================
   🧠 ENTERPRISE MEMORY MANAGEMENT
   ============================================================ */
const _manageCacheMemory = () => {
  try {
    let _tS = 0;
    const _aK: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const _k = localStorage.key(i);
      if (_k && _k.startsWith("brawnly_article_")) {
        const _v = localStorage.getItem(_k);
        if (_v) { _tS += _v.length * 2; _aK.push(_k); }
      }
    }
    if (_tS > 1250000) {
      const _rM = _aK.slice(0, Math.ceil(_aK.length * 0.3));
      _rM.forEach(_k => localStorage.removeItem(_k));
    }
  } catch {}
};

export default function ArticleDetail() {
  const { isDark: _iD } = _uTP();
  const { slug: _sl } = _uP<{ slug: string }>();
  const _slV = _sl ?? "unknown";
  
  // 🧪 DOUBLE-STEP STATE (Blur -> HighRes)
  const [_blobUrl, _setBlobUrl] = _s<string | null>(null);
  const [_blurUrl, _setBlurUrl] = _s<string | null>(null);
  const [_isOff, _sOff] = _s(!navigator.onLine);
  const [_iS, _siS] = _s(() => localStorage.getItem(`brawnly_saved_${_slV}`) === "true");
  const [_nt, _sNt] = _s<{ show: boolean; msg: string; type: 'success' | 'info' }>({ show: false, msg: "", type: 'info' });

  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    return `${_CC.baseUrl}/${_u}`;
  };

  /* ============================================================
     💾 HYBRID CACHE LOADER (Penyelamat dari 404)
     ============================================================ */
  const _cachedArt = _uM(() => {
    try {
      const _sP = localStorage.getItem(`brawnly_article_${_slV}`);
      if (!_sP) return null;
      const _parsed = JSON.parse(_sP);
      if (!_parsed.article || !_parsed.processedData) return null;
      return _parsed;
    } catch (e) {
      console.error("Cache Read Error:", e);
      return null;
    }
  }, [_slV]);

  const { processedData: _pD_raw, isLoading: _iL, article: _art_raw } = _uAD();
  const _pD = _pD_raw || _cachedArt?.processedData;
  const _art = _art_raw || _cachedArt?.article;

  /* ============================================================
     🛡️ STABLE MULTI-PIPELINE (IMAGE/GIF/VIDEO)
     ============================================================ */
  const _rawImgSource = _uM(() => {
    const _img = _art?.featured_image?.split(/[\r\n]+/)[0];
    return _img ? _fC(_img) : null;
  }, [_art?.featured_image]);

  _e(() => {
    if (!_rawImgSource || !navigator.onLine) return;
    let _active = true;

    (async () => {
      try {
        const res = await fetch(_rawImgSource);
        const b = await res.blob();
        
        // STEP 1: Buat Placeholder 1/4 Memori (Instan Blur)
        const placeholder = await _wCP(b);
        if (_active) _setBlurUrl(placeholder);

        // STEP 2: Jalankan Pipeline Berat (WASM High-Res)
        const _fmt = await _dBF();
        const _isVid = _rawImgSource.match(/\.(mp4|webm|ogg|mov)$/i);
        
        let final;
        if (_isVid) {
          final = URL.createObjectURL(await _wVT(b, 0.25)); 
        } else if (b.type === "image/gif" || _rawImgSource.toLowerCase().endsWith('.gif')) {
          final = _rawImgSource; 
        } else {
          const opt = await _wTI(b, _fmt, 0.75);
          final = URL.createObjectURL(opt);
        }

        if (_active) {
          if (_blobUrl && _blobUrl.startsWith('blob:')) URL.revokeObjectURL(_blobUrl);
          _setBlobUrl(final);
        }
      } catch (e) {
        if (_active) _setBlobUrl(_rawImgSource);
      }
    })();

    return () => { _active = false; };
  }, [_rawImgSource]); 

  /* ============================================================
     🔄 ENTERPRISE SYNC & LIFECYCLE
     ============================================================ */
  _e(() => {
    _sCH(_slV); 
    const _on = () => _sOff(false);
    const _off = () => _sOff(true);
    window.addEventListener('online', _on);
    window.addEventListener('offline', _off);
    return () => {
      window.removeEventListener('online', _on);
      window.removeEventListener('offline', _off);
    };
  }, [_slV]);

  _e(() => {
    if (_pD_raw && _art_raw) {
      _manageCacheMemory();
      const _payload = JSON.stringify({ processedData: _pD_raw, article: _art_raw });
      localStorage.setItem(`brawnly_article_${_slV}`, _payload);
      
      import("@/lib/enterpriseStorage").then(m => {
        m.saveArticlesSnap([{ title: _pD_raw.title, slug: _slV, image: _pD_raw.coverImage }]);
      });
    }
  }, [_pD_raw, _art_raw, _slV]);

  _e(() => {
    if (_art?.id && _isOff) {
      _enQ({ type: "UPDATE_VIEW", articleId: _art.id, timestamp: Date.now() });
      _mQ({ type: "OFFLINE_VIEW", id: _art.id, slug: _slV });
    }
  }, [_art?.id, _isOff]);

  const { data: _allA } = _uAs();
  const _hC = _allA ? [..._allA].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3) : [];

  const _trN = (m: string, t: 'success' | 'info' = 'info') => {
    _sNt({ show: true, msg: m, type: t });
    setTimeout(() => _sNt(p => ({ ...p, show: false })), 3500);
  };

  const _hSv = () => {
    const _nS = !_iS;
    _siS(_nS);
    _mQ({ action: _nS ? "SAVE" : "UNSAVE", slug: _slV, ts: Date.now() });
    if (_nS) {
      localStorage.setItem(`brawnly_saved_${_slV}`, "true");
      _trN("SAVED TO COLLECTION", 'success');
    } else {
      localStorage.removeItem(`brawnly_saved_${_slV}`);
      _trN("REMOVED FROM COLLECTION", 'info');
    }
  };

  const _hCL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      _mQ({ action: "SHARE_LINK", slug: _slV });
      _trN("PERMALINK COPIED", 'success');
    } catch { _trN("FAILED", 'info'); }
  };

  const { viewCount: _vC } = _uAV({ id: _art?.id ?? "", slug: _slV, initialViews: _art?.views ?? 0 });

  if (_iL && !_pD) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="w-20 h-[3px] bg-red-600 animate-pulse" />
    </div>
  );

  if (!_pD || !_art) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] px-6 text-center">
      <h1 className="text-[180px] font-black opacity-10 italic leading-none">404</h1>
      <_L to="/" className="px-12 py-5 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[11px] tracking-widest hover:invert transition-all">Back</_L>
    </div>
  );

  const _imgL = (_art.featured_image || "").split(/[\r\n]+/).map((s: string) => s.trim()).filter(Boolean);
  const _finalCov = _blobUrl || _blurUrl || _rawImgSource; 
  const _isGif = _rawImgSource?.toLowerCase().endsWith('.gif');
  const _isVid = _rawImgSource?.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative">
      <_Hm>
        <title>{_pD.title} | Brawnly</title>
        <meta property="og:image" content={_gOI(_rawImgSource || "", 1200)} />
      </_Hm>

      <_AP>
        {_nt.show && (
          <_m.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className={`fixed top-10 right-10 z-[100] px-6 py-4 font-black uppercase text-[10px] tracking-widest shadow-2xl border-l-8 ${_nt.type === 'success' ? 'bg-emerald-500 text-black border-black' : 'bg-black text-white border-red-600'}`}
          >
            {_nt.msg}
          </_m.div>
        )}
      </_AP>

      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
        <button onClick={_hSv} className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${_iS ? 'bg-emerald-500 border-black text-black scale-110' : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-emerald-500'}`}>
          {_iS ? <_Ck size={20} /> : <_Bm size={20} />}
        </button>
        <button onClick={_hCL} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 hover:border-red-600 transition-all duration-500">
          <_Sh size={20} />
        </button>
      </aside>

      <div className="max-w-[1320px] mx-auto px-5 md:px-10">
        <header className="pt-16 pb-10 border-b-[12px] border-black dark:border-white mb-10 relative">
          <div className="flex justify-between items-start">
            <_L to="/" className="text-red-700 font-black uppercase text-[13px] tracking-[0.3em] mb-5 flex items-center gap-2 hover:gap-4 transition-all italic">
              <_Al size={14} /> Brawnly Exclusive
            </_L>
            {_isOff && <span className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full"><_Wo size={12} /> OFFLINE MODE</span>}
          </div>
          <h1 className="text-[45px] md:text-[92px] leading-[0.82] font-black uppercase tracking-tighter mb-10 italic break-words">{_pD.title}</h1>
          <div className="flex flex-col md:flex-row md:items-end justify-between py-8 border-t-2 border-black dark:border-white gap-6">
            <div className="flex items-center gap-5">
              <img src={_gOI(_mA, 120)} className="w-14 h-14 object-cover border-2 border-black grayscale" alt="B" />
              <div>
                <span className="block text-[15px] font-black uppercase italic">By {_art.author || "Brawnly"}</span>
                <span className="text-[12px] uppercase opacity-80"><FormattedDate dateString={_art.published_at} formatString="MMMM d, yyyy" /></span>
              </div>
            </div>
            <div className="text-2xl font-black italic flex items-center gap-3">
              {_vC.toLocaleString()} <_Ey size={20} className="text-red-600" />
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          <article className="flex-1 relative min-w-0">
            <p className="text-[24px] md:text-[32px] leading-[1.1] font-extrabold mb-14 tracking-tight">{_pD.excerpt}</p>

            <div className="mb-16 relative overflow-hidden group">
              {_isVid ? (
                <div className="w-full aspect-video md:aspect-[16/9] lg:aspect-[21/9] bg-black border-4 border-black">
                  <video src={_rawImgSource || ""} poster={_blurUrl || ""} controls className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`relative transition-all duration-700 ${_blobUrl ? 'blur-0 scale-100' : 'blur-xl scale-105'}`}>
                  <ArticleCoverImage 
                    imageUrl={_finalCov || ""} 
                    title={_pD.title} 
                    slug={_slV} 
                    className={_isGif ? "w-full h-auto object-contain" : "w-full aspect-[16/9] object-cover"}
                  />
                </div>
              )}
              
              {!_blobUrl && _blurUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                   <p className="text-[10px] font-black bg-black text-white px-4 py-2 uppercase tracking-widest animate-pulse">
                     Slashing Quality 25%...
                   </p>
                </div>
              )}
              
              <div className="mt-5 flex justify-between items-center border-b border-black dark:border-white pb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {_isVid ? 'Brawnly Motion' : 'Brawnly Asset'} / Vol. 2026
                </p>
                <_Hx size={14} className="animate-spin-slow" />
              </div>
            </div>

            <div className="max-w-[840px] mx-auto relative">
              {_pD.paragraphs.map((l: string, i: number) => (
                <p key={i} className="text-[20px] md:text-[22px] leading-[1.85] mb-10 font-serif text-neutral-800 dark:text-neutral-300"
                  dangerouslySetInnerHTML={{
                    __html: l.trim()
                      .replace(/\*\*(.*?)\*\*/g, `<strong class="font-black text-black dark:text-white">$1</strong>`)
                      .replace(/\*(.*?)\*/g, `<em class="italic text-red-700">$1</em>`)
                  }}
                />
              ))}

              {_imgL.slice(1).length > 0 && (
                <div className="my-20 bg-neutral-50 dark:bg-[#111] border-l-[16px] border-black p-8">
                  <ArticleImageGallery images={_imgL.slice(1).join("\n")} title="" slug={_slV} downloadPrefix="brawnly_gallery" startIndex={2} />
                </div>
              )}
            </div>

            <section className="mt-32 border-t-[12px] border-black dark:border-white pt-16">
              <CommentSection articleId={_art.id} />
            </section>
          </article>

          <aside className="hidden lg:block w-[350px] flex-shrink-0">
            <div className="sticky top-32">
              <h3 className="text-[14px] font-black uppercase tracking-widest text-red-700 mb-8 italic underline">Hot Reads</h3>
              <div className="flex flex-col gap-10">
                {_hC.map((it: any, i: number) => (
                  <_L to={`/article/${it.slug}`} key={it.id} className="group block">
                    <div className="flex gap-5">
                      <span className="text-4xl font-black text-neutral-100 dark:text-neutral-900 group-hover:text-red-600 transition-colors">0{i + 1}</span>
                      <div>
                        <p className="text-[15px] font-black leading-tight uppercase group-hover:underline line-clamp-2">{it.title}</p>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">{it.views.toLocaleString()} Reads</span>
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