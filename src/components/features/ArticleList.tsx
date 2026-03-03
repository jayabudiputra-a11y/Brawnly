import { useMemo as _uM, useState as _uS, useEffect as _uE } from "react";
import { useArticles as _uAs } from "@/hooks/useArticles";
import ArticleCard from "./ArticleCard";
import ScrollToTopButton from "./ScrollToTopButton";
import { motion as _mo, LayoutGroup as _LG, AnimatePresence as _AP } from "framer-motion";

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
import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";
import { wasmVideoToThumbnail } from "@/lib/wasmVideoPipeline";

interface Props {
  selectedTag: string | null;
  searchTerm: string;
  initialData?: any[];
}

export default function ArticleList({ selectedTag: _sT, searchTerm: _sTm, initialData: _iD }: Props) {
  const { data: _aA, isLoading: _iL, error: _e } = _uAs(_sT || null, _iD);
  const [_hI, _sHI] = _uS<number | null>(null);

  _uE(() => {
    warmupEnterpriseStorage();
    openDB().catch(() => console.warn("IDB initialization deferred"));
  }, []);

  const _snap = _uM(() => {
    if (_aA?.length) return _aA;
    const _v1Snap = loadSnap();
    if (_v1Snap?.length) return _v1Snap;
    return getArticlesSnap();
  }, [_aA]);

  _uE(() => {
    if (!_aA?.length) return;

    syncArticles(async () => _aA);

    saveArticlesSnap(_aA);
    saveSnap(_aA.slice(0, 15).map((a: any) => ({
      title: a.title,
      slug: a.slug,
      image: a.featured_image || a.featured_image_url
    })));

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
      enqueue({ type: "MIRROR_ERR", msg: "Failed to mirror row", ts: Date.now() });
    }
  }, [_aA]);

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

  _uE(() => {
    if (!_fA.length || !window.Worker) return;

    const _optimizeBatch = async () => {
      const fmt = await detectBestFormat();
      const targets = _fA.slice(0, 5);
      
      for (const item of targets) {
        const imgUrl = item.featured_image || item.featured_image_url;
        if (!imgUrl || imgUrl.includes("blob:")) continue;

        try {
          const worker = new Worker(new URL('@/wasm/imageWorker.ts', import.meta.url), { type: 'module' });
          const res = await fetch(imgUrl);
          const blob = await res.blob();

          worker.postMessage({
            id: item.slug,
            blob,
            format: fmt,
            quality: 0.7
          });

          worker.onmessage = (e) => {
            if (e.data.result) {
              enqueue({ 
                type: "ASSET_OPTIMIZED", 
                slug: e.data.id, 
                size: e.data.result.size, 
                ts: Date.now() 
              });
            }
            worker.terminate();
          };
        } catch (err) {}
      }
    };

    _optimizeBatch();
  }, [_fA]);

  const _jLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": _sT
      ? `Brawnly Articles — Tag: ${_sT}`
      : _sTm?.trim()
      ? `Brawnly Articles — Search: ${_sTm.trim()}`
      : "Brawnly Articles",
    "description": _sT
      ? `Articles tagged with "${_sT}" on Brawnly.`
      : _sTm?.trim()
      ? `Search results for "${_sTm.trim()}" on Brawnly.`
      : "Latest articles and editorial content from Brawnly.",
    "url": "https://www.brawnly.online/articles",
    "numberOfItems": _fA.length,
    "itemListElement": _fA.slice(0, 10).map((_a: any, _i: number) => ({
      "@type": "ListItem",
      "position": _i + 1,
      "url": `https://brawnly.online/article/${_a.slug}`,
      "name": _a.title,
      "item": {
        "@type": "BlogPosting",
        "url": `https://www.brawnly.online/article/${_a.slug}`,
        "headline": _a.title,
        "name": _a.title,
        "description": _a.excerpt || _a.description || `Read ${_a.title} on Brawnly.`,
        "image": _a.featured_image || _a.featured_image_url || undefined,
        "author": {
          "@type": "Person",
          "name": _a.author?.username || "Brawnly Editorial",
          "url": "https://www.brawnly.online",
        },
        "publisher": {
          "@type": "Organization",
          "name": "Brawnly",
          "url": "https://www.brawnly.online",
          "logo": {
            "@type": "ImageObject",
            "url": "https://brawnly.online/favicon.ico",
          },
        },
        "datePublished": _a.published_at || _a.created_at || undefined,
        "dateModified": _a.updated_at || _a.published_at || _a.created_at || undefined,
        "articleSection": _a.category || "Brawnly Selection",
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ReadAction",
          "userInteractionCount": _a.views ?? 0,
        },
      },
    })),
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly",
      "url": "https://www.brawnly.online",
    },
  };

  const _jLdCollection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": _sT ? `Brawnly — ${_sT}` : _sTm?.trim() ? `Brawnly — "${_sTm.trim()}"` : "Brawnly Articles",
    "description": _sT ? `Browse all Brawnly articles tagged with "${_sT}".` : _sTm?.trim() ? `Search results for "${_sTm.trim()}" across all Brawnly articles.` : "Browse all articles on Brawnly.",
    "url": "https://www.brawnly.online/articles",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Brawnly",
      "url": "https://www.brawnly.online",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly",
      "url": "https://www.brawnly.online",
    },
    "numberOfItems": _fA.length,
    "hasPart": _fA.slice(0, 5).map((_a: any) => ({
      "@type": "BlogPosting",
      "url": `https://www.brawnly.online/article/${_a.slug}`,
      "headline": _a.title,
      "image": _a.featured_image || _a.featured_image_url || undefined,
      "datePublished": _a.published_at || _a.created_at || undefined,
    })),
  };

  const _jLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.brawnly.online",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": _sT ? `Articles — ${_sT}` : "Articles",
        "item": "https://www.brawnly.online/articles",
      },
      ...(_sT ? [{
        "@type": "ListItem",
        "position": 3,
        "name": _sT,
        "item": `https://www.brawnly.online/articles?tag=${encodeURIComponent(_sT)}`,
      }] : []),
    ],
  };

  if (_iL && !_snap?.length) {
    return (
      <div className="text-center py-12 bg-transparent" aria-live="polite" role="status" aria-label="Loading articles">
        <div className="w-12 h-12 mx-auto mb-6 animate-spin rounded-full border-4 border-[#00a354] border-t-transparent shadow-[0_0_20px_rgba(0,163,84,0.2)]" aria-hidden="true" />
        <p className="text-lg font-black uppercase tracking-widest animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
          Syncing Brawnly Nodes...
        </p>
      </div>
    );
  }

  if (_e && !_snap?.length) {
    return (
      <div className="text-center py-10" role="alert" aria-live="assertive">
        <p className="text-red-500 text-[10px] font-black uppercase tracking-[.3em]">
          Uplink Failure: Offline Snapshot Missing
        </p>
      </div>
    );
  }

  if (_fA.length === 0) {
    return (
      <div className="text-center py-16 bg-transparent" role="status" aria-live="polite">
        <p className="text-neutral-400 dark:text-neutral-600 text-[11px] font-black uppercase tracking-[.4em] mb-4">
          {_sT || _sTm.trim() !== "" ? "No nodes found in this sector" : "The grid is currently empty"}
        </p>
        <div className="h-[1px] w-20 mx-auto bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>
      <script type="application/ld+json">{JSON.stringify(_jLdCollection)}</script>
      <script type="application/ld+json">{JSON.stringify(_jLdBreadcrumb)}</script>

      <div
        aria-hidden="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <meta itemProp="name" content={_sT ? `Brawnly Articles — Tag: ${_sT}` : _sTm?.trim() ? `Brawnly Articles — Search: ${_sTm.trim()}` : "Brawnly Articles"} />
        <meta itemProp="description" content={_sT ? `Articles tagged with "${_sT}" on Brawnly.` : "Latest articles from Brawnly."} />
        <meta itemProp="url" content="https://www.brawnly.online/articles" />
        <meta itemProp="numberOfItems" content={String(_fA.length)} />

        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <a href="https://www.brawnly.online" itemProp="url" tabIndex={-1} rel="noopener noreferrer">Brawnly</a>
          <span itemProp="name" content="Brawnly" />
        </span>

        {_sT && <span itemProp="keywords" content={_sT}>Tag: {_sT}</span>}

        <ol aria-label="Article list">
          {_fA.map((_a: any, _i: number) => (
            <li key={`seo-li-${_a.id || _a.slug || _i}`} itemScope itemType="https://schema.org/BlogPosting" itemProp="itemListElement">
              <meta itemProp="position" content={String(_i + 1)} />
              <a href={`https://www.brawnly.online/article/${_a.slug}`} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_a.title}</a>
              <meta itemProp="headline" content={_a.title} />
              <meta itemProp="name" content={_a.title} />
              {(_a.excerpt || _a.description) && <meta itemProp="description" content={_a.excerpt || _a.description} />}
              {(_a.featured_image || _a.featured_image_url) && <meta itemProp="image" content={_a.featured_image || _a.featured_image_url} />}
              <span itemScope itemType="https://schema.org/Person" itemProp="author"><span itemProp="name">{_a.author?.username || "Brawnly Editorial"}</span></span>
              <span itemScope itemType="https://schema.org/InteractionCounter" itemProp="interactionStatistic">
                <meta itemProp="interactionType" content="https://schema.org/ReadAction" />
                <meta itemProp="userInteractionCount" content={String(_a.views ?? 0)} />
              </span>
            </li>
          ))}
        </ol>

        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a href="https://www.brawnly.online" itemProp="url" tabIndex={-1} rel="noopener noreferrer">Brawnly</a>
          <span itemProp="name" content="Brawnly" />
        </span>
      </div>

      <_LG id="article-lasso">
        <div
          role="list"
          aria-label={_sT ? `Articles tagged: ${_sT}` : _sTm?.trim() ? `Search results for: ${_sTm.trim()}` : "All Brawnly articles"}
          onMouseLeave={() => _sHI(null)}
          className="flex flex-col max-w-[900px] mx-auto w-full px-0 divide-y divide-gray-100 dark:divide-neutral-900 mt-0 relative"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          <meta itemProp="name" content={_sT ? `Brawnly Articles — ${_sT}` : "Brawnly Articles"} />
          <meta itemProp="numberOfItems" content={String(_fA.length)} />

          {_fA.map((_a: any, _idx: number) => {
            const itemKey = _a.id || _a.slug || `article-idx-${_idx}`;
            return (
              <div
                key={itemKey}
                role="listitem"
                aria-label={`Article ${_idx + 1}: ${_a.title}`}
                className="relative w-full group transition-all duration-300"
                onMouseEnter={() => _sHI(_idx)}
                itemScope
                itemType="https://schema.org/ListItem"
                itemProp="itemListElement"
              >
                <meta itemProp="position" content={String(_idx + 1)} />
                <meta itemProp="url" content={`https://www.brawnly.online/article/${_a.slug}`} />
                <meta itemProp="name" content={_a.title} />

                <_AP>
                  {_hI === _idx && (
                    <_mo.div
                      layoutId="highlight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="absolute inset-0 z-0 bg-yellow-400/5 dark:bg-yellow-400/10 border-y-2 border-yellow-400/50 dark:border-yellow-400"
                      style={{ boxShadow: "0 0 15px rgba(250, 204, 21, 0.2)" }}
                      aria-hidden="true"
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