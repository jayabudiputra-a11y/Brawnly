import React, { useState as _s, useEffect as _e } from "react";
import { Link as _L, useParams as _uP } from "react-router-dom";
import { Helmet as _Hm } from "react-helmet-async";
import { Eye as _Ey, Anchor as _An, Bookmark as _Bm, Hexagon as _Hx, Check as _Ck, WifiOff as _Wo } from "lucide-react";
import { motion as _m } from "framer-motion";
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
import { optimizeUpload } from "@/lib/imageOptimizer";
import { supabase } from "@/lib/supabase";

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

async function upload(file: File) {
  const optimized = await optimizeUpload(file);
  await supabase.storage
    .from("images")
    .upload(
      file.name.replace(/\.\w+$/, ".webp"),
      optimized
    );
}

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

  _e(() => {
    const _scrollKey = `brawnly_scroll_${_slV}`;
    const _lastScroll = sessionStorage.getItem(_scrollKey);
    if (_lastScroll) setTimeout(() => window.scrollTo(0, parseInt(_lastScroll)), 100);
    const _hScroll = () => sessionStorage.setItem(_scrollKey, window.scrollY.toString());
    window.addEventListener('scroll', _hScroll);
    return () => window.removeEventListener('scroll', _hScroll);
  }, [_slV]);

  _e(() => {
    const _ss = localStorage.getItem(`brawnly_saved_${_slV}`);
    if (_ss === "true") _siS(true);
  }, [_slV]);

  const _trN = (m: string, t: 'success' | 'info' = 'info') => {
    _sNt({ show: true, msg: m, type: t });
    setTimeout(() => _sNt(p => ({ ...p, show: false })), 3500);
  };

  const _hSv = () => {
    const _nS = !_iS;
    _siS(_nS);
    if (_nS) {
      localStorage.setItem(`brawnly_saved_${_slV}`, "true");
      _trN("ARTICLE ADDED TO YOUR COLLECTION", 'success');
    } else {
      localStorage.removeItem(`brawnly_saved_${_slV}`);
      _trN("REMOVED FROM COLLECTION", 'info');
    }
  };

  const _hCL = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      _trN("PERMALINK COPIED TO CLIPBOARD", 'success');
    } catch {
      _trN("FAILED TO COPY LINK", 'info');
    }
  };

  const { viewCount: _vC } = _uAV({
    id: _art?.id ?? "",
    slug: _slV,
    initialViews: _art?.views ?? 0,
  });

  _e(() => {
    if (!_pD?.coverImage) return;
    if (!navigator.onLine) return;

    (async () => {
      try {
        const r = await fetch(_pD.coverImage);
        const b = await r.blob();
        const f = new File([b], `cover-${_slV}.jpg`, { type: b.type });
        await upload(f);
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
      <_L to="/" className="px-12 py-5 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[11px] tracking-widest hover:invert transition-all">Back to Feed</_L>
    </div>
  );

  const { title: _tt, excerpt: _ex, paragraphs: _pg, coverImage: _cI, midGallery: _mG, bottomGallery: _bG } = _pD;
  const _ds = _ex || `Brawnly 2026 Exclusive: ${_tt}`;
  const _iO = _gOI(_cI, 1200);
  const _ln = _pg.filter((l: string) => l.trim() !== "" && l.trim() !== "&nbsp;");

  const _jLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": _tt,
    "description": _ds,
    "image": _iO,
    "datePublished": _art.published_at,
    "author": { "@type": "Person", "name": _art.author || "Brawnly Editor" }
  };

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative">
      <_Hm>
        <title>{_tt} | Brawnly</title>
        <meta name="description" content={_ds} />
        <meta property="og:image" content={_iO} />
      </_Hm>
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>

      <div className="max-w-[1320px] mx-auto px-5 md:px-10">
        <header className="pt-16 pb-10 border-b-[12px] border-black dark:border-white mb-10 relative">
          <div className="flex justify-between items-start">
            <span className="text-red-700 font-black uppercase text-[13px] tracking-[0.3em] mb-5 block italic">Brawnly Exclusive Selection</span>
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
                {_vC.toLocaleString()} <_Ey size={20} className="text-red-600" />
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

            <section className="mt-32 border-t-[12px] border-black dark:border-white pt-16">
              <CommentSection articleId={_art.id} />
            </section>
          </article>

          <aside className="hidden lg:block w-[350px]">
            <div className="sticky top-32">
              <h3 className="text-[14px] font-black uppercase tracking-widest text-red-700 mb-8 italic underline">Hot Content</h3>
              <div className="flex flex-col gap-10">
                {_hC.map((it: any, i: number) => (
                  <_L to={`/article/${it.slug}`} key={it.id} className="group cursor-pointer block">
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
