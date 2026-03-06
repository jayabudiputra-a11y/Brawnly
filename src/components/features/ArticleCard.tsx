import { Link as _L } from "react-router-dom";
import { Eye as _E, WifiOff as _Wo, Zap as _Zp } from "lucide-react";
import { useEffect as _uE, useState as _uS } from "react";
import _mA from "@/assets/myAvatar.jpg";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useSaveData as _uSD } from "@/hooks/useSaveData";
import { CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";
import { setCookieHash, mirrorQuery } from "@/lib/enterpriseStorage";
import { saveAssetToShared, getAssetFromShared } from "@/lib/sharedStorage";
import { detectBestFormat } from "@/lib/imageFormat";

const VIBRANT_COLORS = ["#facc15", "#f87171", "#60a5fa", "#4ade80", "#c084fc", "#f472b6", "#fb923c", "#2dd4bf"];

type ImageFormat = "webp" | "avif";

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
 * Bangun ImageObject schema.org lengkap (JSON-LD) dengan semua field GSC terpenuhi:
 * url, contentUrl, license, creator, copyrightNotice, acquireLicensePage.
 * Mengembalikan undefined jika url tidak valid.
 */
function _buildImageObject(
  url: string | null | undefined,
  name: string,
  description?: string,
  representative?: boolean
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
    ...(representative !== undefined
      ? { "representativeOfPage": representative }
      : {}),
    "encodingFormat": validUrl.toLowerCase().match(/\.gif/i)
      ? "image/gif"
      : validUrl.toLowerCase().match(/\.webp/i)
      ? "image/webp"
      : "image/jpeg",
  };
}

interface ArticleCardProps {
  article: any;
  priority?: boolean;
}

export function resolveAuthorName(article: any, defaultName = "Brawnly Editorial"): string {
  const { author, author_name } = article ?? {};

  if (typeof author === "string" && author.trim()) {
    return author.trim();
  }

  if (author && typeof author === "object") {
    const username = typeof author.username === "string" ? author.username.trim() : "";
    const name    = typeof author.name     === "string" ? author.name.trim()     : "";
    if (username) return username;
    if (name)     return name;
  }

  if (typeof author_name === "string" && author_name.trim()) {
    return author_name.trim();
  }

  return defaultName;
}

export default function ArticleCard({ article: _a, priority: _p = false }: ArticleCardProps) {
  const _t = _a.title || "Untitled Article";
  const { isEnabled: _iE, saveData: _sD } = _uSD();
  const [_oF, _sOF] = _uS(!navigator.onLine);
  const [_iL, _siL] = _uS(false);
  const [_blobUrl, _sBU] = _uS<string | null>(null);

  const [_rC, _sRC] = _uS(() => VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)]);

  const _authorName = resolveAuthorName(_a);

  _uE(() => {
    const oN = () => _sOF(false);
    const oF = () => _sOF(true);
    window.addEventListener("online", oN);
    window.addEventListener("offline", oF);
    return () => {
      window.removeEventListener("online", oN);
      window.removeEventListener("offline", oF);
    };
  }, []);

  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    return `${_CC.baseUrl}/${_u}`;
  };

  const _rP = _a.featured_image ? String(_a.featured_image).split(/[\r\n]+/)[0]?.trim() : null;
  const _hQRaw = _rP ? _fC(_rP) : null;
  // FIX: Validasi URL — mencegah "Invalid URL in field url/contentUrl" di GSC
  const _hQ = _validateUrl(_hQRaw);
  const _isLow = _iE && _sD.quality === "low";
  const _tW = _isLow ? 200 : 400;
  const _dU = _hQ ? _gOI(_hQ, _tW) : null;

  // ─── Copyright profile untuk gambar featured image ini ───────────────────
  const _cp = _hQ ? _detectImageSource(_hQ) : null;

  _uE(() => {
    if (!_a.slug || !_hQ) return;
    (async () => {
      try {
        mirrorQuery({ id: _a.id, slug: _a.slug, ts: Date.now(), type: "CARD_RENDER" });
        await setCookieHash(_a.slug);
        const cachedBlob = await getAssetFromShared(_a.slug);
        if (cachedBlob) {
          _sBU(URL.createObjectURL(cachedBlob));
          return;
        }
        if (navigator.onLine && !_isLow && !_p) {
          const fmtStr = await detectBestFormat();
          const fmt = (fmtStr.toLowerCase() === "avif" ? "avif" : "webp") as ImageFormat;
          const res = await fetch(_dU || _hQ, { mode: 'cors' });
          const blob = await res.blob();

          if (window.Worker) {
            const optimized = await new Promise<Blob>((resolve, reject) => {
              const worker = new Worker(new URL('@/wasm/imageWorker.ts', import.meta.url), { type: 'module' });

              worker.onmessage = (e) => {
                const { error, result } = e.data;
                worker.terminate();
                if (error) reject(new Error(error));
                else resolve(result);
              };

              worker.onerror = (err) => {
                worker.terminate();
                reject(err);
              };

              worker.postMessage({ id: `card_${_a.slug}`, blob: blob, format: fmt, quality: 0.6 });
            });
            await saveAssetToShared(_a.slug, optimized);
          }
        }
      } catch (e) {}
    })();
    return () => { if (_blobUrl) URL.revokeObjectURL(_blobUrl); };
  }, [_a.slug, _hQ, _isLow]);

  // ─── JSON-LD: BlogPosting (image field penuh dengan copyright per sumber) ─
  const _jL = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": _t,
    "name": _t,
    "description": _a.excerpt || _a.description || `Read ${_t} on Brawnly.`,
    // FIX: image sebagai ImageObject penuh dengan semua field copyright GSC
    "image": _buildImageObject(
      _hQ,
      `${_t} — cover image`,
      `Cover image for article: ${_t}`,
      true
    ),
    "author": {
      "@type": "Person",
      "name": _authorName,
      "url": SITE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
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
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/article/${_a.slug}`,
      "url": `${SITE_URL}/article/${_a.slug}`,
    },
    "url": `${SITE_URL}/article/${_a.slug}`,
    "datePublished": _a.published_at || _a.created_at || undefined,
    "dateModified": _a.updated_at || _a.published_at || _a.created_at || undefined,
    "articleSection": _a.category || "Brawnly Selection",
    "keywords": _a.tags ? (Array.isArray(_a.tags) ? _a.tags.join(", ") : _a.tags) : "Brawnly, article",
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ReadAction",
      "userInteractionCount": _a.views ?? 0,
    },
    "isPartOf": {
      "@type": "Blog",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
  };

  const _jLListItem = {
    "@context": "https://schema.org",
    "@type": "ListItem",
    "item": {
      "@type": "BlogPosting",
      "url": `${SITE_URL}/article/${_a.slug}`,
      "headline": _t,
      "name": _t,
      // FIX: image sebagai ImageObject penuh (bukan raw URL string)
      "image": _buildImageObject(
        _hQ,
        `${_t} — cover image`,
        `Cover image for article: ${_t}`,
        true
      ),
      "author": {
        "@type": "Person",
        "name": _authorName,
      },
      "datePublished": _a.published_at || _a.created_at || undefined,
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReadAction",
        "userInteractionCount": _a.views ?? 0,
      },
    },
  };

  const _displayImg = _blobUrl || _dU;

  return (
    <article
      className="group relative bg-transparent border-b border-gray-100 dark:border-neutral-900 last:border-0 py-6 outline-none overflow-hidden"
      tabIndex={0}
      itemScope
      itemType="https://schema.org/BlogPosting"
      onMouseEnter={() => _sRC(VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)])}
      style={{ "--hover-color": _rC } as React.CSSProperties}
    >
      <script type="application/ld+json">{JSON.stringify(_jL)}</script>
      <script type="application/ld+json">{JSON.stringify(_jLListItem)}</script>

      <meta itemProp="headline" content={_t} />
      <meta itemProp="name" content={_t} />
      <meta
        itemProp="description"
        content={_a.excerpt || _a.description || `Read ${_t} on Brawnly.`}
      />
      <meta
        itemProp="url"
        content={`${SITE_URL}/article/${_a.slug}`}
      />
      {_a.published_at && (
        <meta itemProp="datePublished" content={_a.published_at} />
      )}
      {(_a.updated_at || _a.published_at) && (
        <meta
          itemProp="dateModified"
          content={_a.updated_at || _a.published_at}
        />
      )}
      {_a.category && (
        <meta itemProp="articleSection" content={_a.category} />
      )}
      {/* FIX: Hanya emit meta image jika URL valid */}
      {_hQ && <meta itemProp="image" content={_hQ} />}
      <meta
        itemProp="interactionStatistic"
        content={`ReadAction:${_a.views ?? 0}`}
      />

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      >
        <a
          href={`${SITE_URL}/article/${_a.slug}`}
          itemProp="url"
          tabIndex={-1}
          rel="noopener noreferrer"
        >
          {_t}
        </a>

        <span
          itemScope
          itemType="https://schema.org/Person"
          itemProp="author"
        >
          <span itemProp="name">
            {_authorName}
          </span>
          <a
            href={SITE_URL}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly Editorial
          </a>
        </span>

        <span
          itemScope
          itemType="https://schema.org/Organization"
          itemProp="publisher"
        >
          <span itemProp="name">{SITE_NAME}</span>
          <a
            href={SITE_URL}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {SITE_NAME}
          </a>
          {/* FIX: logo publisher ImageObject lengkap dengan copyright own content */}
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

        {/* FIX: ImageObject microdata dengan semua field copyright per sumber */}
        {_hQ && _cp && (
          <figure
            itemScope
            itemType="https://schema.org/ImageObject"
            itemProp="image"
          >
            <img
              src={_hQ}
              alt={`${_t} — cover image`}
              itemProp="url"
              tabIndex={-1}
              width={400}
              height={260}
            />
            <meta itemProp="contentUrl"         content={_hQ} />
            <meta itemProp="name"               content={`${_t} — cover image`} />
            <meta itemProp="description"        content={`Cover image for article: ${_t}`} />
            <meta itemProp="representativeOfPage" content="true" />
            {/* FIX: copyright fields wajib GSC */}
            <meta itemProp="license"            content={_cp.license} />
            <meta itemProp="copyrightNotice"    content={_cp.copyright} />
            <meta itemProp="acquireLicensePage" content={_cp.acquireUrl} />
            <meta itemProp="creditText"         content={_cp.creatorName} />
            <span
              itemScope
              itemType={`https://schema.org/${_cp.creatorType}`}
              itemProp="creator"
            >
              <meta itemProp="name" content={_cp.creatorName} />
              <meta itemProp="url"  content={_cp.creatorUrl} />
            </span>
            <figcaption itemProp="caption">{_t}</figcaption>
          </figure>
        )}

        <span
          itemScope
          itemType="https://schema.org/InteractionCounter"
          itemProp="interactionStatistic"
        >
          <meta
            itemProp="interactionType"
            content="https://schema.org/ReadAction"
          />
          <meta
            itemProp="userInteractionCount"
            content={String(_a.views ?? 0)}
          />
        </span>

        {_a.category && (
          <span itemProp="articleSection">{_a.category}</span>
        )}

        {_a.tags && (
          <span itemProp="keywords">
            {Array.isArray(_a.tags) ? _a.tags.join(", ") : _a.tags}
          </span>
        )}

        {(_a.excerpt || _a.description) && (
          <p itemProp="description">{_a.excerpt || _a.description}</p>
        )}

        <span
          itemScope
          itemType="https://schema.org/Blog"
          itemProp="isPartOf"
        >
          <a
            href={SITE_URL}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly Blog
          </a>
          <span itemProp="name">{SITE_NAME}</span>
        </span>
      </div>

      <_L
        to={`/article/${_a.slug}`}
        className="flex flex-row items-center gap-4 md:gap-8 outline-none relative z-10"
        aria-label={`Read article: ${_t}${_a.category ? ` — ${_a.category}` : ""}`}
      >
        <div className="relative flex-shrink-0 w-[110px] h-[110px] md:w-[200px] md:h-[130px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-xl border-2 border-transparent group-hover:border-[var(--hover-color)] transition-all duration-500 shadow-sm">
          <div className="absolute top-2 left-2 z-20 flex gap-1">
            {_oF && (
              <div
                className="bg-red-600 p-1 rounded-md shadow-lg animate-pulse"
                title="Offline"
              >
                <_Wo size={10} className="text-white" aria-hidden="true" />
              </div>
            )}
            {_blobUrl && (
              <div
                className="bg-yellow-500 p-1 rounded-md shadow-lg"
                title="Optimized"
              >
                <_Zp size={10} className="text-black" aria-hidden="true" />
              </div>
            )}
          </div>

          {!_iL && (
            <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" aria-hidden="true" />
          )}

          {_displayImg ? (
            <img
              src={_displayImg}
              alt={`${_t} — thumbnail`}
              loading={_p ? "eager" : "lazy"}
              fetchPriority={_p ? "high" : "auto"}
              decoding={_p ? "sync" : "async"}
              onLoad={() => _siL(true)}
              itemProp="thumbnailUrl"
              className={`w-full h-full object-cover grayscale transition-all duration-700 ease-in-out group-hover:grayscale-0 group-hover:scale-105 ${_iL ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] font-black uppercase tracking-tighter">
              No Media
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#00a354] group-hover:text-[var(--hover-color)] transition-colors duration-300 flex items-center gap-2"
            itemProp="articleSection"
          >
            {_a.category || "BRAWNLY SELECTION"}
            {_isLow && (
              <span className="text-[8px] bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-neutral-500">
                SAVER_ON
              </span>
            )}
          </span>

          <h2
            className="text-[17px] md:text-[22px] leading-[1.2] font-black uppercase tracking-tighter text-black dark:text-white line-clamp-2 mb-2 transition-all duration-300 group-hover:translate-x-1"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = _rC; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ""; }}
            itemProp="headline"
          >
            {_t}
          </h2>

          <div className="flex items-center gap-2">
            <img
              src={_mA}
              alt={`Author avatar — ${_authorName}`}
              className="w-4 h-4 rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 border border-neutral-200 dark:border-neutral-800"
            />
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <span
                className="text-black dark:text-white group-hover:text-[var(--hover-color)] transition-colors"
                itemProp="author"
              >
                By {_authorName}
              </span>
              <span
                className="flex items-center gap-1"
                aria-label={`${_a.views ?? 0} views`}
              >
                <_E
                  className="w-3 h-3 text-[#00a354] group-hover:text-[var(--hover-color)] transition-colors"
                  aria-hidden="true"
                />
                {_a.views ?? 0}
              </span>
            </div>
          </div>
        </div>
      </_L>

      <div
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-[var(--hover-color)] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-all duration-500"
        aria-hidden="true"
      />
    </article>
  );
}