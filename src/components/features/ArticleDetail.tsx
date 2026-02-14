import React, { useState as _s, useEffect as _e, useMemo as _uM } from "react";
import { Link as _L, useParams as _uP, useNavigate as _uN } from "react-router-dom";
import { Helmet as _Hm } from "react-helmet-async";
import { Eye as _Ey, Bookmark as _Bm, Hexagon as _Hx, Check as _Ck, WifiOff as _Wo, Share2 as _Sh, ArrowLeft as _Al, Send as _Sd, MessageSquare as _Ms, Loader2 as _L2, User as _Us, Reply as _Rp, CornerDownRight as _Cr, X as _X, Camera as _Ca } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import FormattedDate from "@/components/features/FormattedDate";
import _mA from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";
import CommentSection from "@/components/articles/CommentSection";

// ASSETS DECORATION
import _muscleLeft from "@/assets/119-1191125_muscle-arms-png-big-arm-muscles-transparent-png.png";
import _muscleRight from "@/assets/634-6343275_muscle-arm-png-background-images-barechested-transparent-png.png";

import { useArticleData as _uAD } from "@/hooks/useArticleData";
import { useArticleViews as _uAV } from "@/hooks/useArticleViews";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useArticles as _uAs } from "@/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { supabase, CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";

import { wasmTranscodeImage as _wTI, wasmCreatePlaceholder as _wCP } from "@/lib/wasmImagePipeline";
import { wasmVideoToThumbnail as _wVT } from "@/lib/wasmVideoPipeline";
import { detectBestFormat as _dBF } from "@/lib/imageFormat";
import { trackPageView as _tPV } from "@/lib/trackViews";

/* ============================================================
    📄 ARTICLE DETAIL MAIN
   ============================================================ */
export default function ArticleDetail() {
  const { slug: _sl } = _uP<{ slug: string }>();
  const _slV = _sl ?? "unknown";
  const [_blobUrl, _setBlobUrl] = _s<string | null>(null);
  const [_blurUrl, _setBlurUrl] = _s<string | null>(null);
  const [_isOff, _sOff] = _s(!navigator.onLine);
  const [_iS, _siS] = _s(() => localStorage.getItem(`brawnly_saved_${_slV}`) === "true");
  const [_hasTracked, _sHasTracked] = _s(false);

  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    return `${_CC.baseUrl}/${_u}`;
  };

  const { processedData: _pD, isLoading: _iL, article: _art } = _uAD();

  const _allImages = _uM(() => {
    if (!_art?.featured_image) return [];
    return _art.featured_image.split(/[\r\n]+/).filter(Boolean);
  }, [_art?.featured_image]);

  const _rawImgSource = _uM(() => _allImages[0] ? _fC(_allImages[0]) : null, [_allImages]);
  const _extraImages = _uM(() => _allImages.slice(1), [_allImages]);

  _e(() => {
    if (!_rawImgSource || !navigator.onLine) return;
    let _active = true;
    (async () => {
      try {
        const res = await fetch(_rawImgSource);
        const b = await res.blob();
        const placeholder = await _wCP(b);
        if (_active) _setBlurUrl(placeholder);
        const _fmt = await _dBF();
        let final;
        if (_rawImgSource.match(/\.(mp4|webm|ogg|mov)$/i)) {
          final = URL.createObjectURL(await _wVT(b, 0.25));
        } else {
          const opt = await _wTI(b, _fmt, 0.75);
          final = URL.createObjectURL(opt);
        }
        if (_active) _setBlobUrl(final);
      } catch (e) {
        if (_active) _setBlobUrl(_rawImgSource);
      }
    })();
    return () => { _active = false; };
  }, [_rawImgSource]);

  _e(() => {
    if (_art?.id && !_hasTracked) {
      _tPV(_art.id);
      _sHasTracked(true);
    }
  }, [_art?.id, _hasTracked]);

  const { data: _allA } = _uAs();
  const _hC = _uM(() => _allA ? [..._allA].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3) : [], [_allA]);

  const _hSv = () => {
    const _nS = !_iS;
    _siS(_nS);
    if (_nS) {
      localStorage.setItem(`brawnly_saved_${_slV}`, "true");
      toast.success("Identity Saved");
    } else {
      localStorage.removeItem(`brawnly_saved_${_slV}`);
      toast.info("Removed");
    }
  };

  const { viewCount: _realtimeViews } = _uAV({ id: _art?.id ?? "", slug: _slV, initialViews: _art?.views ?? 0 });

  if (_iL && !_pD) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="w-20 h-[3px] bg-red-600 animate-pulse" />
    </div>
  );

  if (!_pD || !_art) return null;

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative overflow-x-hidden">
      <_Hm>
        <title>{_pD.title} | Brawnly</title>
        <meta property="og:image" content={_gOI(_rawImgSource || "", 1200)} />
      </_Hm>

      {/* DESKTOP SIDEBAR ACTIONS (Hidden on Mobile) */}
      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
        <button onClick={_hSv} className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${_iS ? 'bg-emerald-500 border-black text-black scale-110' : 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 shadow-xl'}`}>
          {_iS ? <_Ck size={20} /> : <_Bm size={20} />}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Node Link Copied"); }} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 hover:border-red-600 transition-all duration-500">
          <_Sh size={20} />
        </button>
      </aside>

      <div className="max-w-[1320px] mx-auto px-4 md:px-10">
        <header className="pt-12 md:pt-16 pb-8 md:pb-10 border-b-[8px] md:border-b-[12px] border-black dark:border-white mb-8 md:mb-10 relative text-black dark:text-white">
          <div className="flex justify-between items-start mb-6">
            <_L to="/articles" className="text-red-700 font-black uppercase text-[11px] md:text-[13px] tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all italic">
              <_Al size={14} /> Node_Explore
            </_L>
            {_isOff && <span className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full"><_Wo size={12} /> OFFLINE</span>}
          </div>
          <h1 className="text-[36px] sm:text-[45px] md:text-[92px] leading-[0.9] md:leading-[0.82] font-black uppercase tracking-tighter mb-8 md:mb-10 italic break-words">
            {_pD.title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-end justify-between py-6 md:py-8 border-t-2 border-black dark:border-white gap-6">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden border-2 border-black grayscale shadow-lg bg-neutral-100">
                <img src={_gOI(_mA, 120)} className="w-full h-full object-cover" alt="B" />
              </div>
              <div>
                <span className="block text-[13px] md:text-[15px] font-black uppercase italic">By {_art.author || "Brawnly"}</span>
                <span className="text-[10px] md:text-[12px] uppercase opacity-80"><FormattedDate dateString={_art.published_at} /></span>
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black italic flex items-center gap-3">
              {_realtimeViews.toLocaleString()} <_Ey size={20} className="text-red-600" />
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
          <article className="flex-1 relative min-w-0">
            <p className="text-[20px] md:text-[32px] leading-[1.2] md:leading-[1.1] font-extrabold mb-10 md:mb-14 tracking-tight text-neutral-900 dark:text-neutral-100 italic">
              {_pD.excerpt}
            </p>

            <div className="relative mb-12 md:mb-20 px-4 md:px-12 lg:px-20">
                <div className="absolute left-[-15px] sm:left-[-30px] md:left-[-60px] lg:left-[-80px] top-1/2 -translate-y-1/2 w-20 sm:w-32 md:w-48 lg:w-56 z-10 opacity-90 pointer-events-none">
                    <img src={_muscleLeft} alt="Decorative Arm Left" className="w-full drop-shadow-2xl" />
                </div>
                
                <div className="relative overflow-hidden group rounded-2xl md:rounded-3xl border-2 border-black dark:border-white shadow-2xl z-20 bg-black">
                   <ArticleCoverImage imageUrl={_blobUrl || _rawImgSource || ""} title={_pD.title} slug={_slV} className="w-full aspect-video md:aspect-[21/9] object-cover" />
                </div>

                <div className="absolute right-[-15px] sm:right-[-30px] md:right-[-60px] lg:right-[-80px] top-1/2 -translate-y-1/2 w-20 sm:w-32 md:w-48 lg:w-56 z-10 opacity-90 pointer-events-none">
                    <img src={_muscleRight} alt="Decorative Arm Right" className="w-full drop-shadow-2xl" />
                </div>
            </div>

            <div className="max-w-[840px] mx-auto">
              {_pD.paragraphs.map((l: string, i: number) => (
                <p key={i} className="text-[18px] md:text-[22px] leading-[1.8] md:leading-[1.85] mb-8 md:mb-10 font-serif text-neutral-800 dark:text-neutral-300"
                  dangerouslySetInnerHTML={{ __html: l.trim().replace(/\*\*(.*?)\*\*/g, `<strong class="font-black text-black dark:text-white">$1</strong>`).replace(/\*(.*?)\*/g, `<em class="italic text-red-700">$1</em>`) }} />
              ))}
            </div>

            {/* PHOTOS SECTION */}
            {_extraImages.length > 0 && (
                <section className="mt-20 mb-12 border-t-2 border-neutral-100 dark:border-neutral-900 pt-16">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full"><_Ca size={18} /></div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white">Gallery</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {_extraImages.map((img: string, idx: number) => (
                            <div key={idx} className="overflow-hidden border-2 border-black dark:border-white rounded-xl group shadow-lg bg-neutral-100 relative">
                                <img 
                                    src={_fC(img)} 
                                    alt={`Gallery node ${idx}`}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 aspect-square md:aspect-[4/5]"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 📱 MOBILE ACTION BUTTONS (Save & Share) - VISIBLE ONLY ON MOBILE/TABLET */}
            <div className="flex xl:hidden items-center gap-4 mb-16 border-t-2 border-neutral-100 dark:border-neutral-900 pt-8">
              {/* Save Button Mobile */}
              <button
                onClick={_hSv}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 font-black uppercase text-[12px] tracking-widest transition-all shadow-md active:scale-95 ${
                  _iS
                    ? 'bg-emerald-500 border-black text-black'
                    : 'bg-white dark:bg-black border-black dark:border-white text-black dark:text-white'
                }`}
              >
                {_iS ? <_Ck size={16} /> : <_Bm size={16} />}
                {_iS ? 'Saved' : 'Save'}
              </button>

              {/* Permalink Button Mobile */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Node Link Copied");
                }}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[12px] tracking-widest shadow-md hover:invert active:scale-95 transition-all"
              >
                <_Sh size={16} />
                Permalink
              </button>
            </div>

            <CommentSection articleId={_art.id} />
          </article>

          <aside className="hidden lg:block w-[320px] xl:w-[350px] flex-shrink-0">
            <div className="sticky top-32 space-y-12">
              <div className="p-8 bg-neutral-50 dark:bg-[#111] rounded-[2.5rem] border-2 border-black dark:border-white shadow-xl">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-emerald-600 mb-8 italic flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" /> Trending
                </h3>
                <div className="flex flex-col gap-10">
                  {_hC.map((it: any, i: number) => (
                    <_L to={`/article/${it.slug}`} key={it.id} className="group block">
                      <div className="flex gap-4">
                        <span className="text-3xl font-black text-neutral-200 dark:text-neutral-800 group-hover:text-emerald-500 transition-colors">0{i + 1}</span>
                        <div>
                          <p className="text-[14px] font-black leading-tight uppercase group-hover:underline line-clamp-2 text-black dark:text-white">{it.title}</p>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">{(it.views || 0).toLocaleString()} Identity_Reads</span>
                        </div>
                      </div>
                    </_L>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <ScrollToTopButton />
    </main>
  );
}