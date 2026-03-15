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

const _SU        = "https://www.brawnly.online";
const _SN        = "Brawnly";
const _AN        = "Budi Putra Jaya";
const _OL        = "https://creativecommons.org/licenses/by/4.0/";
const _OC        = `© 2026 ${_AN}. All rights reserved.`;
const _OAU       = `${_SU}/license`;

const _SP: Record<string, { license: string; copyright: string; acquireUrl: string; creatorName: string; creatorType: "Person" | "Organization"; creatorUrl: string }> = {
  instagram: { license: "https://www.instagram.com/legal/terms/", copyright: "© Instagram / Meta Platforms, Inc. All rights reserved.", acquireUrl: "https://www.instagram.com/legal/terms/", creatorName: "Instagram / Meta Platforms, Inc.", creatorType: "Organization", creatorUrl: "https://www.instagram.com" },
  tiktok:    { license: "https://www.tiktok.com/legal/page/us/terms-of-service/en", copyright: "© TikTok / ByteDance Ltd. All rights reserved.", acquireUrl: "https://www.tiktok.com/legal/page/us/terms-of-service/en", creatorName: "TikTok / ByteDance Ltd.", creatorType: "Organization", creatorUrl: "https://www.tiktok.com" },
  tumblr:    { license: "https://www.tumblr.com/policy/en/terms-of-service", copyright: "© Tumblr / Automattic Inc. / respective content creators. All rights reserved.", acquireUrl: "https://www.tumblr.com/policy/en/terms-of-service", creatorName: "Tumblr / respective content creators", creatorType: "Organization", creatorUrl: "https://www.tumblr.com" },
  twitter:   { license: "https://twitter.com/en/tos", copyright: "© X Corp. / respective tweet authors. All rights reserved.", acquireUrl: "https://twitter.com/en/tos", creatorName: "X Corp. / respective tweet authors", creatorType: "Organization", creatorUrl: "https://twitter.com" },
  pinterest: { license: "https://policy.pinterest.com/en/terms-of-service", copyright: "© Pinterest, Inc. / respective pin owners. All rights reserved.", acquireUrl: "https://policy.pinterest.com/en/terms-of-service", creatorName: "Pinterest / respective content creators", creatorType: "Organization", creatorUrl: "https://www.pinterest.com" },
  google:    { license: "https://policies.google.com/terms", copyright: "© Google LLC. All rights reserved.", acquireUrl: "https://policies.google.com/terms", creatorName: "Google LLC", creatorType: "Organization", creatorUrl: "https://www.google.com" },
  flickr:    { license: "https://www.flickr.com/creativecommons/", copyright: "© Respective photographers on Flickr. License varies per image.", acquireUrl: "https://www.flickr.com/help/terms", creatorName: "Respective photographers on Flickr", creatorType: "Person", creatorUrl: "https://www.flickr.com" },
  youtube:   { license: "https://www.youtube.com/t/terms", copyright: "© YouTube / Google LLC / respective content creators. All rights reserved.", acquireUrl: "https://www.youtube.com/t/terms", creatorName: "YouTube / respective content creators", creatorType: "Organization", creatorUrl: "https://www.youtube.com" },
  cloudinary:{ license: _OL, copyright: _OC, acquireUrl: _OAU, creatorName: _AN, creatorType: "Person", creatorUrl: _SU },
};

type _TPr = typeof _SP[keyof typeof _SP];

function _dIS(url: string): _TPr {
  const u = (url || "").toLowerCase();
  if (u.includes("instagram.com") || u.includes("cdninstagram.com") || u.includes("fbcdn.net")) return _SP.instagram;
  if (u.includes("tiktok.com") || u.includes("tiktokcdn.com") || u.includes("musical.ly")) return _SP.tiktok;
  if (u.includes("tumblr.com") || u.includes("tumblr.co")) return _SP.tumblr;
  if (u.includes("twitter.com") || u.includes("twimg.com") || u.includes("x.com")) return _SP.twitter;
  if (u.includes("pinterest.com") || u.includes("pinimg.com")) return _SP.pinterest;
  if (u.includes("googleusercontent.com") || u.includes("ggpht.com") || u.includes("gstatic.com")) return _SP.google;
  if (u.includes("flickr.com") || u.includes("staticflickr.com") || u.includes("live.staticflickr.com")) return _SP.flickr;
  if (u.includes("youtube.com") || u.includes("ytimg.com") || u.includes("youtu.be")) return _SP.youtube;
  if (u.includes("cloudinary.com") || u.includes("res.cloudinary.com") || u.includes("brawnly.online")) return _SP.cloudinary;
  return { license: _OL, copyright: _OC, acquireUrl: _OAU, creatorName: _AN, creatorType: "Person", creatorUrl: _SU };
}

function _vU(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname || u.hostname.length < 4) return null;
    return url;
  } catch {
    return null;
  }
}

function _rAI(a: any): string | null {
  const raw = a.featured_image || a.featured_image_url || a.image || null;
  if (!raw) return null;
  const first = String(raw).split(/[\r\n]+/)[0].trim();
  return _vU(first);
}

function _bIO(url: string | null | undefined, name: string, description?: string): object | undefined {
  const vU = _vU(url);
  if (!vU) return undefined;
  const p = _dIS(vU);
  return {
    "@type":              "ImageObject",
    "url":                vU,
    "contentUrl":         vU,
    "name":               name,
    ...(description ? { "description": description } : {}),
    "license":            p.license,
    "creator":            { "@type": p.creatorType, "name": p.creatorName, "url": p.creatorUrl },
    "copyrightNotice":    p.copyright,
    "acquireLicensePage": p.acquireUrl,
    "creditText":         p.creatorName,
    "encodingFormat": vU.toLowerCase().match(/\.gif/i)
      ? "image/gif"
      : vU.toLowerCase().match(/\.webp/i)
      ? "image/webp"
      : "image/jpeg",
  };
}

const _LGO = {
  "@type":              "ImageObject",
  "url":                `${_SU}/masculineLogo.svg`,
  "contentUrl":         `${_SU}/masculineLogo.svg`,
  "name":               `${_SN} logo`,
  "license":            _OL,
  "creator":            { "@type": "Person", "name": _AN, "url": _SU },
  "copyrightNotice":    _OC,
  "acquireLicensePage": _OAU,
};

const _PUB = { "@type": "Organization", "name": _SN, "url": _SU, "logo": _LGO };

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
    openDB().catch(() => {});
  }, []);

  const _snap = _uM(() => {
    if (_aA?.length) return _aA;
    const _v1 = loadSnap();
    if (_v1?.length) return _v1;
    return getArticlesSnap();
  }, [_aA]);

  _uE(() => {
    if (!_aA?.length) return;

    syncArticles(async () => _aA);
    saveArticlesSnap(_aA);
    saveSnap(_aA.slice(0, 15).map((a: any) => ({
      title: a.title,
      slug:  a.slug,
      image: a.featured_image || a.featured_image_url || a.image || null,
    })));

    try {
      _aA.forEach((a: any) => {
        mirrorQuery({ id: a.id, slug: a.slug, ts: Date.now() });
        if (a.slug) setCookieHash(a.slug);
      });
    } catch {
      enqueue({ type: "MIRROR_ERR", msg: "Failed to mirror row", ts: Date.now() });
    }
  }, [_aA]);

  const _fA = _uM(() => {
    if (!_snap) return [];
    let _cA = [..._snap];
    if (_sT) {
      const _lST = _sT.toLowerCase();
      _cA = _cA.filter((_art: any) => _art.tags?.some((_t: string) => _t.toLowerCase() === _lST));
    }
    const _sSTm = _sTm || "";
    if (_sSTm.trim() === "") return _cA;
    const _lS = _sSTm.toLowerCase();
    return _cA.filter((_art: any) => (_art.title || "").toLowerCase().includes(_lS));
  }, [_snap, _sT, _sTm]);

  _uE(() => {
    if (!_fA.length || !window.Worker) return;
    const _ob = async () => {
      const fmt = await detectBestFormat();
      for (const item of _fA.slice(0, 5)) {
        const imgUrl = _rAI(item);
        if (!imgUrl || imgUrl.includes("blob:")) continue;
        try {
          const worker = new Worker(new URL('@/wasm/imageWorker.ts', import.meta.url), { type: 'module' });
          const res    = await fetch(imgUrl);
          const blob   = await res.blob();
          worker.postMessage({ id: item.slug, blob, format: fmt, quality: 0.7 });
          worker.onmessage = (e) => {
            if (e.data.result) enqueue({ type: "ASSET_OPTIMIZED", slug: e.data.id, size: e.data.result.size, ts: Date.now() });
            worker.terminate();
          };
        } catch {}
      }
    };
    _ob();
  }, [_fA]);

  const _jLd = {
    "@context":      "https://schema.org",
    "@type":         "ItemList",
    "name":          _sT ? `Brawnly Articles — Tag: ${_sT}` : _sTm?.trim() ? `Brawnly Articles — Search: ${_sTm.trim()}` : "Brawnly Articles",
    "description":   _sT ? `Articles tagged with "${_sT}" on Brawnly.` : _sTm?.trim() ? `Search results for "${_sTm.trim()}" on Brawnly.` : "Latest articles and editorial content from Brawnly.",
    "url":           `${_SU}/articles`,
    "numberOfItems": _fA.length,
    "itemListElement": _fA.slice(0, 10).map((_a: any, _i: number) => ({
      "@type":    "ListItem",
      "position": _i + 1,
      "url":      `${_SU}/article/${_a.slug}`,
      "name":     _a.title,
      "item": {
        "@type":       "BlogPosting",
        "url":         `${_SU}/article/${_a.slug}`,
        "headline":    _a.title,
        "name":        _a.title,
        "description": _a.excerpt || _a.description || `Read ${_a.title} on Brawnly.`,
        "image":       _bIO(_rAI(_a), `${_a.title} — thumbnail`, `Thumbnail image for article: ${_a.title}`),
        "author":      { "@type": "Person", "name": _a.author?.username || _AN, "url": _SU },
        "publisher":   _PUB,
        "datePublished":  _a.published_at || _a.created_at || undefined,
        "dateModified":   _a.updated_at || _a.published_at || _a.created_at || undefined,
        "articleSection": _a.category || "Brawnly Selection",
        "interactionStatistic": { "@type": "InteractionCounter", "interactionType": "https://schema.org/ReadAction", "userInteractionCount": _a.views ?? 0 },
      },
    })),
    "publisher": _PUB,
  };

  const _jLdC = {
    "@context":      "https://schema.org",
    "@type":         "CollectionPage",
    "name":          _sT ? `Brawnly — ${_sT}` : _sTm?.trim() ? `Brawnly — "${_sTm.trim()}"` : "Brawnly Articles",
    "description":   _sT ? `Browse all Brawnly articles tagged with "${_sT}".` : _sTm?.trim() ? `Search results for "${_sTm.trim()}" across all Brawnly articles.` : "Browse all articles on Brawnly.",
    "url":           `${_SU}/articles`,
    "isPartOf":      { "@type": "WebSite", "name": _SN, "url": _SU },
    "publisher":     _PUB,
    "numberOfItems": _fA.length,
    "hasPart": _fA.slice(0, 5).map((_a: any) => ({
      "@type":         "BlogPosting",
      "url":           `${_SU}/article/${_a.slug}`,
      "headline":      _a.title,
      "image":         _bIO(_rAI(_a), `${_a.title} — thumbnail`, `Thumbnail image for article: ${_a.title}`),
      "datePublished": _a.published_at || _a.created_at || undefined,
    })),
  };

  const _jLdB = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",    "item": _SU },
      { "@type": "ListItem", "position": 2, "name": _sT ? `Articles — ${_sT}` : "Articles", "item": `${_SU}/articles` },
      ...(_sT ? [{ "@type": "ListItem", "position": 3, "name": _sT, "item": `${_SU}/articles?tag=${encodeURIComponent(_sT)}` }] : []),
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
      <script type="application/ld+json">{JSON.stringify(_jLdC)}</script>
      <script type="application/ld+json">{JSON.stringify(_jLdB)}</script>

      <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }} itemScope itemType="https://schema.org/CreativeWork">
        <meta itemProp="license" content="https://creativecommons.org/licenses/by/4.0/" />
        <a href="https://creativecommons.org/licenses/by/4.0/" itemProp="license" tabIndex={-1} rel="license noopener noreferrer">This work is licensed under Creative Commons Attribution 4.0 International</a>
        <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style={{ maxWidth: "1em", maxHeight: "1em", marginLeft: ".2em" }} />
        <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style={{ maxWidth: "1em", maxHeight: "1em", marginLeft: ".2em" }} />
        <span itemProp="copyrightHolder" itemScope itemType="https://schema.org/Person">
          <meta itemProp="name" content={_AN} />
          <a href={_SU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_AN}</a>
        </span>
        <meta itemProp="copyrightYear" content="2026" />
      </div>

      <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }} itemScope itemType="https://schema.org/ItemList">
        <meta itemProp="name"          content={_sT ? `Brawnly Articles — Tag: ${_sT}` : _sTm?.trim() ? `Brawnly Articles — Search: ${_sTm.trim()}` : "Brawnly Articles"} />
        <meta itemProp="description"   content={_sT ? `Articles tagged with "${_sT}" on Brawnly.` : "Latest articles from Brawnly."} />
        <meta itemProp="url"           content={`${_SU}/articles`} />
        <meta itemProp="numberOfItems" content={String(_fA.length)} />

        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <a href={_SU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_SN}</a>
          <span itemProp="name" content={_SN} />
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
            <meta itemProp="url"                content={`${_SU}/masculineLogo.svg`} />
            <meta itemProp="contentUrl"         content={`${_SU}/masculineLogo.svg`} />
            <meta itemProp="name"               content={`${_SN} logo`} />
            <meta itemProp="license"            content={_OL} />
            <meta itemProp="copyrightNotice"    content={_OC} />
            <meta itemProp="acquireLicensePage" content={_OAU} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_AN} />
              <meta itemProp="url"  content={_SU} />
            </span>
          </span>
        </span>

        {_sT && <span itemProp="keywords" content={_sT}>Tag: {_sT}</span>}

        <ol aria-label="Article list">
          {_fA.map((_a: any, _i: number) => {
            const _imgUrl = _rAI(_a);
            const _cp     = _imgUrl ? _dIS(_imgUrl) : null;
            return (
              <li key={`seo-li-${_a.id || _a.slug || _i}`} itemScope itemType="https://schema.org/BlogPosting" itemProp="itemListElement">
                <meta itemProp="position" content={String(_i + 1)} />
                <a href={`${_SU}/article/${_a.slug}`} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_a.title}</a>
                <meta itemProp="headline" content={_a.title} />
                <meta itemProp="name"     content={_a.title} />
                {(_a.excerpt || _a.description) && <meta itemProp="description" content={_a.excerpt || _a.description} />}
                {_imgUrl && _cp && (
                  <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
                    <meta itemProp="url"                content={_imgUrl} />
                    <meta itemProp="contentUrl"         content={_imgUrl} />
                    <meta itemProp="name"               content={`${_a.title} — thumbnail`} />
                    <meta itemProp="license"            content={_cp.license} />
                    <meta itemProp="copyrightNotice"    content={_cp.copyright} />
                    <meta itemProp="acquireLicensePage" content={_cp.acquireUrl} />
                    <meta itemProp="creditText"         content={_cp.creatorName} />
                    <span itemScope itemType={`https://schema.org/${_cp.creatorType}`} itemProp="creator">
                      <meta itemProp="name" content={_cp.creatorName} />
                      <meta itemProp="url"  content={_cp.creatorUrl} />
                    </span>
                  </span>
                )}
                <span itemScope itemType="https://schema.org/Person" itemProp="author">
                  <span itemProp="name">{_a.author?.username || _AN}</span>
                </span>
                <span itemScope itemType="https://schema.org/InteractionCounter" itemProp="interactionStatistic">
                  <meta itemProp="interactionType"       content="https://schema.org/ReadAction" />
                  <meta itemProp="userInteractionCount"  content={String(_a.views ?? 0)} />
                </span>
              </li>
            );
          })}
        </ol>

        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a href={_SU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_SN}</a>
          <span itemProp="name" content={_SN} />
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
          <meta itemProp="name"          content={_sT ? `Brawnly Articles — ${_sT}` : "Brawnly Articles"} />
          <meta itemProp="numberOfItems" content={String(_fA.length)} />

          {_fA.map((_a: any, _idx: number) => {
            const _ik = _a.id || _a.slug || `article-idx-${_idx}`;
            return (
              <div
                key={_ik}
                role="listitem"
                aria-label={`Article ${_idx + 1}: ${_a.title}`}
                className="relative w-full group transition-all duration-300"
                onMouseEnter={() => _sHI(_idx)}
                itemScope
                itemType="https://schema.org/ListItem"
                itemProp="itemListElement"
              >
                <meta itemProp="position" content={String(_idx + 1)} />
                <meta itemProp="url"      content={`${_SU}/article/${_a.slug}`} />
                <meta itemProp="name"     content={_a.title} />

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
                  <ArticleCard article={_a} priority={_idx < 2} />
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