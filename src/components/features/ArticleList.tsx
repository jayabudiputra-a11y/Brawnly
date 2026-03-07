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

/* ============================================================
   COPYRIGHT PROFILES
   Setiap gambar dari platform pihak ketiga tunduk pada ToS platform tersebut.
   Profile ini memenuhi field GSC: license, creator, copyrightNotice,
   acquireLicensePage (wajib untuk Google Image Metadata rich results).
   ============================================================ */
const SITE_URL        = "https://www.brawnly.online";
const SITE_NAME       = "Brawnly";
const AUTHOR_NAME     = "Budi Putra Jaya";
const OWN_LICENSE     = "https://creativecommons.org/licenses/by/4.0/";
const OWN_COPYRIGHT   = `© 2026 ${AUTHOR_NAME}. All rights reserved.`;
const OWN_ACQUIRE_URL = `${SITE_URL}/license`;

const _SOURCE_PROFILES: Record<
  string,
  {
    license: string;
    copyright: string;
    acquireUrl: string;
    creatorName: string;
    creatorType: "Person" | "Organization";
    creatorUrl: string;
  }
> = {
  instagram: {
    license:     "https://www.instagram.com/legal/terms/",
    copyright:   "© Instagram / Meta Platforms, Inc. All rights reserved.",
    acquireUrl:  "https://www.instagram.com/legal/terms/",
    creatorName: "Instagram / Meta Platforms, Inc.",
    creatorType: "Organization",
    creatorUrl:  "https://www.instagram.com",
  },
  tiktok: {
    license:     "https://www.tiktok.com/legal/page/us/terms-of-service/en",
    copyright:   "© TikTok / ByteDance Ltd. All rights reserved.",
    acquireUrl:  "https://www.tiktok.com/legal/page/us/terms-of-service/en",
    creatorName: "TikTok / ByteDance Ltd.",
    creatorType: "Organization",
    creatorUrl:  "https://www.tiktok.com",
  },
  tumblr: {
    license:     "https://www.tumblr.com/policy/en/terms-of-service",
    copyright:   "© Tumblr / Automattic Inc. / respective content creators. All rights reserved.",
    acquireUrl:  "https://www.tumblr.com/policy/en/terms-of-service",
    creatorName: "Tumblr / respective content creators",
    creatorType: "Organization",
    creatorUrl:  "https://www.tumblr.com",
  },
  twitter: {
    license:     "https://twitter.com/en/tos",
    copyright:   "© X Corp. / respective tweet authors. All rights reserved.",
    acquireUrl:  "https://twitter.com/en/tos",
    creatorName: "X Corp. / respective tweet authors",
    creatorType: "Organization",
    creatorUrl:  "https://twitter.com",
  },
  pinterest: {
    license:     "https://policy.pinterest.com/en/terms-of-service",
    copyright:   "© Pinterest, Inc. / respective pin owners. All rights reserved.",
    acquireUrl:  "https://policy.pinterest.com/en/terms-of-service",
    creatorName: "Pinterest / respective content creators",
    creatorType: "Organization",
    creatorUrl:  "https://www.pinterest.com",
  },
  google: {
    license:     "https://policies.google.com/terms",
    copyright:   "© Google LLC. All rights reserved.",
    acquireUrl:  "https://policies.google.com/terms",
    creatorName: "Google LLC",
    creatorType: "Organization",
    creatorUrl:  "https://www.google.com",
  },
  flickr: {
    license:     "https://www.flickr.com/creativecommons/",
    copyright:   "© Respective photographers on Flickr. License varies per image.",
    acquireUrl:  "https://www.flickr.com/help/terms",
    creatorName: "Respective photographers on Flickr",
    creatorType: "Person",
    creatorUrl:  "https://www.flickr.com",
  },
  youtube: {
    license:     "https://www.youtube.com/t/terms",
    copyright:   "© YouTube / Google LLC / respective content creators. All rights reserved.",
    acquireUrl:  "https://www.youtube.com/t/terms",
    creatorName: "YouTube / respective content creators",
    creatorType: "Organization",
    creatorUrl:  "https://www.youtube.com",
  },
  cloudinary: {
    license:     OWN_LICENSE,
    copyright:   OWN_COPYRIGHT,
    acquireUrl:  OWN_ACQUIRE_URL,
    creatorName: AUTHOR_NAME,
    creatorType: "Person",
    creatorUrl:  SITE_URL,
  },
};

type SourceProfile = typeof _SOURCE_PROFILES[keyof typeof _SOURCE_PROFILES];

/** Deteksi sumber gambar dari URL, return profil copyright yang sesuai */
function _detectImageSource(url: string): SourceProfile {
  const u = (url || "").toLowerCase();
  if (u.includes("instagram.com") || u.includes("cdninstagram.com") || u.includes("fbcdn.net"))
    return _SOURCE_PROFILES.instagram;
  if (u.includes("tiktok.com") || u.includes("tiktokcdn.com") || u.includes("musical.ly"))
    return _SOURCE_PROFILES.tiktok;
  if (u.includes("tumblr.com") || u.includes("tumblr.co"))
    return _SOURCE_PROFILES.tumblr;
  if (u.includes("twitter.com") || u.includes("twimg.com") || u.includes("x.com"))
    return _SOURCE_PROFILES.twitter;
  if (u.includes("pinterest.com") || u.includes("pinimg.com"))
    return _SOURCE_PROFILES.pinterest;
  if (u.includes("googleusercontent.com") || u.includes("ggpht.com") || u.includes("gstatic.com"))
    return _SOURCE_PROFILES.google;
  if (u.includes("flickr.com") || u.includes("staticflickr.com") || u.includes("live.staticflickr.com"))
    return _SOURCE_PROFILES.flickr;
  if (u.includes("youtube.com") || u.includes("ytimg.com") || u.includes("youtu.be"))
    return _SOURCE_PROFILES.youtube;
  if (u.includes("cloudinary.com") || u.includes("res.cloudinary.com") || u.includes("brawnly.online"))
    return _SOURCE_PROFILES.cloudinary;
  // fallback — own content
  return {
    license:     OWN_LICENSE,
    copyright:   OWN_COPYRIGHT,
    acquireUrl:  OWN_ACQUIRE_URL,
    creatorName: AUTHOR_NAME,
    creatorType: "Person",
    creatorUrl:  SITE_URL,
  };
}

/**
 * FIX: Validasi URL — pastikan URL adalah absolute HTTPS/HTTP yang valid.
 * Mencegah "Invalid URL in field url/contentUrl" di GSC.
 */
function _validateUrl(url: string | null | undefined): string | null {
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

/**
 * Resolve URL gambar dari artikel — ambil baris pertama,
 * lalu validasi agar absolute HTTPS yang valid.
 * Mengembalikan null jika tidak valid.
 */
function _resolveArticleImage(a: any): string | null {
  const raw = a.featured_image || a.featured_image_url;
  if (!raw) return null;
  const first = String(raw).split(/[\r\n]+/)[0].trim();
  return _validateUrl(first);
}

/**
 * Bangun ImageObject schema.org lengkap (JSON-LD) dengan semua field GSC terpenuhi.
 * Mengembalikan undefined jika url tidak valid.
 */
function _buildImageObject(
  url: string | null | undefined,
  name: string,
  description?: string
): object | undefined {
  const validUrl = _validateUrl(url);
  if (!validUrl) return undefined;
  const p = _detectImageSource(validUrl);
  return {
    "@type":               "ImageObject",
    "url":                 validUrl,
    "contentUrl":          validUrl,
    "name":                name,
    ...(description ? { "description": description } : {}),
    "license":             p.license,
    "creator": {
      "@type": p.creatorType,
      "name":  p.creatorName,
      "url":   p.creatorUrl,
    },
    "copyrightNotice":     p.copyright,
    "acquireLicensePage":  p.acquireUrl,
    "creditText":          p.creatorName,
    "encodingFormat": validUrl.toLowerCase().match(/\.gif/i)
      ? "image/gif"
      : validUrl.toLowerCase().match(/\.webp/i)
      ? "image/webp"
      : "image/jpeg",
  };
}

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

  // ─── JSON-LD: ItemList — image field tiap artikel pakai ImageObject penuh ──
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
    "url": `${SITE_URL}/articles`,
    "numberOfItems": _fA.length,
    "itemListElement": _fA.slice(0, 10).map((_a: any, _i: number) => {
      const _imgUrl = _resolveArticleImage(_a);
      return {
        "@type":    "ListItem",
        "position": _i + 1,
        "url":      `${SITE_URL}/article/${_a.slug}`,
        "name":     _a.title,
        "item": {
          "@type":          "BlogPosting",
          "url":            `${SITE_URL}/article/${_a.slug}`,
          "headline":       _a.title,
          "name":           _a.title,
          "description":    _a.excerpt || _a.description || `Read ${_a.title} on Brawnly.`,
          // FIX: image sebagai ImageObject penuh dengan copyright per sumber + URL validation
          "image": _buildImageObject(
            _imgUrl,
            `${_a.title} — thumbnail`,
            `Thumbnail image for article: ${_a.title}`
          ),
          "author": {
            "@type": "Person",
            "name":  _a.author?.username || AUTHOR_NAME,
            "url":   SITE_URL,
          },
          "publisher": {
            "@type": "Organization",
            "name":  SITE_NAME,
            "url":   SITE_URL,
            "logo": {
              "@type":               "ImageObject",
              "url":                 `${SITE_URL}/masculineLogo.svg`,
              "contentUrl":          `${SITE_URL}/masculineLogo.svg`,
              "name":                `${SITE_NAME} logo`,
              "license":             OWN_LICENSE,
              "creator":             { "@type": "Person", "name": AUTHOR_NAME, "url": SITE_URL },
              "copyrightNotice":     OWN_COPYRIGHT,
              "acquireLicensePage":  OWN_ACQUIRE_URL,
            },
          },
          "datePublished":  _a.published_at || _a.created_at || undefined,
          "dateModified":   _a.updated_at || _a.published_at || _a.created_at || undefined,
          "articleSection": _a.category || "Brawnly Selection",
          "interactionStatistic": {
            "@type":               "InteractionCounter",
            "interactionType":     "https://schema.org/ReadAction",
            "userInteractionCount": _a.views ?? 0,
          },
        },
      };
    }),
    "publisher": {
      "@type": "Organization",
      "name":  SITE_NAME,
      "url":   SITE_URL,
      "logo": {
        "@type":               "ImageObject",
        "url":                 `${SITE_URL}/masculineLogo.svg`,
        "contentUrl":          `${SITE_URL}/masculineLogo.svg`,
        "name":                `${SITE_NAME} logo`,
        "license":             OWN_LICENSE,
        "creator":             { "@type": "Person", "name": AUTHOR_NAME, "url": SITE_URL },
        "copyrightNotice":     OWN_COPYRIGHT,
        "acquireLicensePage":  OWN_ACQUIRE_URL,
      },
    },
  };

  // ─── JSON-LD: CollectionPage — hasPart image field juga penuh ────────────
  const _jLdCollection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": _sT ? `Brawnly — ${_sT}` : _sTm?.trim() ? `Brawnly — "${_sTm.trim()}"` : "Brawnly Articles",
    "description": _sT
      ? `Browse all Brawnly articles tagged with "${_sT}".`
      : _sTm?.trim()
      ? `Search results for "${_sTm.trim()}" across all Brawnly articles.`
      : "Browse all articles on Brawnly.",
    "url": `${SITE_URL}/articles`,
    "isPartOf": {
      "@type": "WebSite",
      "name":  SITE_NAME,
      "url":   SITE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name":  SITE_NAME,
      "url":   SITE_URL,
      "logo": {
        "@type":               "ImageObject",
        "url":                 `${SITE_URL}/masculineLogo.svg`,
        "contentUrl":          `${SITE_URL}/masculineLogo.svg`,
        "name":                `${SITE_NAME} logo`,
        "license":             OWN_LICENSE,
        "creator":             { "@type": "Person", "name": AUTHOR_NAME, "url": SITE_URL },
        "copyrightNotice":     OWN_COPYRIGHT,
        "acquireLicensePage":  OWN_ACQUIRE_URL,
      },
    },
    "numberOfItems": _fA.length,
    // FIX: hasPart image field pakai ImageObject penuh + URL validation
    "hasPart": _fA.slice(0, 5).map((_a: any) => {
      const _imgUrl = _resolveArticleImage(_a);
      return {
        "@type":         "BlogPosting",
        "url":           `${SITE_URL}/article/${_a.slug}`,
        "headline":      _a.title,
        "image":         _buildImageObject(
          _imgUrl,
          `${_a.title} — thumbnail`,
          `Thumbnail image for article: ${_a.title}`
        ),
        "datePublished": _a.published_at || _a.created_at || undefined,
      };
    }),
  };

  const _jLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type":    "ListItem",
        "position": 1,
        "name":     "Home",
        "item":     SITE_URL,
      },
      {
        "@type":    "ListItem",
        "position": 2,
        "name":     _sT ? `Articles — ${_sT}` : "Articles",
        "item":     `${SITE_URL}/articles`,
      },
      ...(_sT ? [{
        "@type":    "ListItem",
        "position": 3,
        "name":     _sT,
        "item":     `${SITE_URL}/articles?tag=${encodeURIComponent(_sT)}`,
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

      {/* ── CC BY 4.0 License — hidden from UI, visible to crawlers ── */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
        itemScope
        itemType="https://schema.org/CreativeWork"
      >
        <meta itemProp="license" content="https://creativecommons.org/licenses/by/4.0/" />
        <a href="https://creativecommons.org/licenses/by/4.0/" itemProp="license" tabIndex={-1} rel="license noopener noreferrer">
          This work is licensed under Creative Commons Attribution 4.0 International
        </a>
        <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" style={{ maxWidth: "1em", maxHeight: "1em", marginLeft: ".2em" }} />
        <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" style={{ maxWidth: "1em", maxHeight: "1em", marginLeft: ".2em" }} />
        <span itemProp="copyrightHolder" itemScope itemType="https://schema.org/Person">
          <meta itemProp="name" content="Budi Putra Jaya" />
          <a href="https://www.brawnly.online" itemProp="url" tabIndex={-1} rel="noopener noreferrer">Budi Putra Jaya</a>
        </span>
        <meta itemProp="copyrightYear" content="2026" />
      </div>

      <div
        aria-hidden="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <meta itemProp="name" content={_sT ? `Brawnly Articles — Tag: ${_sT}` : _sTm?.trim() ? `Brawnly Articles — Search: ${_sTm.trim()}` : "Brawnly Articles"} />
        <meta itemProp="description" content={_sT ? `Articles tagged with "${_sT}" on Brawnly.` : "Latest articles from Brawnly."} />
        <meta itemProp="url" content={`${SITE_URL}/articles`} />
        <meta itemProp="numberOfItems" content={String(_fA.length)} />

        {/* FIX: Publisher dengan logo ImageObject lengkap + own copyright */}
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{SITE_NAME}</a>
          <span itemProp="name" content={SITE_NAME} />
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
            <meta itemProp="url"                content={`${SITE_URL}/masculineLogo.svg`} />
            <meta itemProp="contentUrl"         content={`${SITE_URL}/masculineLogo.svg`} />
            <meta itemProp="name"               content={`${SITE_NAME} logo`} />
            <meta itemProp="license"            content={OWN_LICENSE} />
            <meta itemProp="copyrightNotice"    content={OWN_COPYRIGHT} />
            <meta itemProp="acquireLicensePage" content={OWN_ACQUIRE_URL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={AUTHOR_NAME} />
              <meta itemProp="url"  content={SITE_URL} />
            </span>
          </span>
        </span>

        {_sT && <span itemProp="keywords" content={_sT}>Tag: {_sT}</span>}

        <ol aria-label="Article list">
          {_fA.map((_a: any, _i: number) => {
            // FIX: Validasi URL gambar — hanya emit jika URL valid
            const _imgUrl = _resolveArticleImage(_a);
            const _cp = _imgUrl ? _detectImageSource(_imgUrl) : null;
            return (
              <li
                key={`seo-li-${_a.id || _a.slug || _i}`}
                itemScope
                itemType="https://schema.org/BlogPosting"
                itemProp="itemListElement"
              >
                <meta itemProp="position" content={String(_i + 1)} />
                <a href={`${SITE_URL}/article/${_a.slug}`} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_a.title}</a>
                <meta itemProp="headline" content={_a.title} />
                <meta itemProp="name"     content={_a.title} />
                {(_a.excerpt || _a.description) && (
                  <meta itemProp="description" content={_a.excerpt || _a.description} />
                )}
                {/* FIX: ImageObject microdata dengan copyright per sumber — hanya jika URL valid */}
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
                  <span itemProp="name">{_a.author?.username || AUTHOR_NAME}</span>
                </span>
                <span itemScope itemType="https://schema.org/InteractionCounter" itemProp="interactionStatistic">
                  <meta itemProp="interactionType"      content="https://schema.org/ReadAction" />
                  <meta itemProp="userInteractionCount" content={String(_a.views ?? 0)} />
                </span>
              </li>
            );
          })}
        </ol>

        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{SITE_NAME}</a>
          <span itemProp="name" content={SITE_NAME} />
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
                <meta itemProp="url"      content={`${SITE_URL}/article/${_a.slug}`} />
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