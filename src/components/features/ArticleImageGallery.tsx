import React, { useEffect as _e, useState, useRef } from 'react';

// ─── Fix: TypeScript tidak mengenal fetchpriority sebagai prop HTML standar.
// Augment ImgHTMLAttributes agar tidak error saat compile.
declare module 'react' {
  interface ImgHTMLAttributes<T> extends React.HTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}
import { generateFullImageUrl as _gFI } from '@/utils/helpers';
import { useSaveData as _uSD } from '@/hooks/useSaveData';
import { getOptimizedImage as _gOI } from '@/lib/utils';
import { CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";
import { setCookieHash, mirrorQuery } from '@/lib/enterpriseStorage';
import { detectBestFormat } from '@/lib/imageFormat';
import { saveAssetToShared, getAssetFromShared } from '@/lib/sharedStorage';

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
 * Mengembalikan null jika tidak valid.
 * Ini mencegah "Invalid URL in field url" dan "Invalid URL in field contentUrl" di GSC.
 */
function _validateUrl(url: string): string | null {
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
 * Bangun ImageObject schema.org lengkap (JSON-LD).
 * Mencakup semua field yang diwajibkan Google Image Metadata:
 * url, contentUrl, license, creator, copyrightNotice, acquireLicensePage.
 * Mengembalikan null jika url tidak valid.
 */
function _buildImageObject(
  url: string,
  name: string,
  description?: string,
  isRepresentative?: boolean
): object | null {
  const validUrl = _validateUrl(url);
  if (!validUrl) return null;
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
    ...(isRepresentative !== undefined
      ? { "representativeOfPage": isRepresentative }
      : {}),
    "encodingFormat": url.toLowerCase().match(/\.gif/i)
      ? "image/gif"
      : url.toLowerCase().match(/\.webp/i)
      ? "image/webp"
      : "image/jpeg",
  };
}

interface ArticleImageGalleryProps {
  images: string;
  title: string;
  slug: string;
  containerClassName?: string;
  downloadPrefix: string;
  startIndex: number;
}

// ─── FIX: Extract each gallery item into its own component ───────────────────
// Sebelumnya useState + useEffect dipanggil di dalam .map() callback,
// yang melanggar Rules of Hooks dan menyebabkan freeze/jank saat scroll.
// Solusi: pisahkan ke komponen tersendiri agar hooks valid.
interface GalleryItemProps {
  rawPath: string;
  index: number;
  startIndex: number;
  slug: string;
  downloadPrefix: string;
  title: string;
  isLowQuality: boolean;
}

function GalleryItem({
  rawPath,
  index,
  startIndex,
  slug,
  downloadPrefix,
  title,
  isLowQuality,
}: GalleryItemProps) {
  const _fC = (_u: string) => {
    if (!_u) return "";
    const trimmed = _u.trim();
    if (trimmed.startsWith("http")) return trimmed;
    const _f = _gFI(trimmed);
    if (_f.startsWith("http")) return _f;
    return `${_CC.baseUrl}/${trimmed}`;
  };

  const _hQ = _fC(rawPath);

  // FIX: Validasi URL sebelum render — jika tidak valid, skip seluruh item
  const _validHQ = _validateUrl(_hQ);

  const _isGif =
    _hQ.toLowerCase().match(/\.(gif|gifv|webp)$/i) ||
    _hQ.includes("tumblr.com");

  const _w = isLowQuality ? 200 : 400;

  // ─── FIX: useState & useEffect kini di level komponen, bukan dalam .map() ──
  const [optimizedUrl, setOptimizedUrl] = useState<string>(
    _isGif ? _hQ : _gOI(_hQ, _w)
  );

  // ─── FIX: Simpan blob URL untuk di-revoke saat unmount (mencegah memory leak)
  const _blobUrlRef = useRef<string | null>(null);

  _e(() => {
    if (!_hQ || _hQ.includes("supabase.co")) return;
    if (_isGif || isLowQuality) return;

    let _active = true;
    // ─── FIX: AbortController untuk batalkan fetch saat unmount
    const _controller = new AbortController();

    (async () => {
      const assetId = `gal_${slug}_${index}`;

      try {
        const cached = await getAssetFromShared(assetId);
        if (cached && _active) {
          const url = URL.createObjectURL(cached);
          _blobUrlRef.current = url;
          setOptimizedUrl(url);
          return;
        }
      } catch {
        // cache miss — lanjutkan
      }

      if (!navigator.onLine) return;

      try {
        const fmtStr = await detectBestFormat();
        const fmt = (
          fmtStr.toLowerCase() === "avif" ? "avif" : "webp"
        ) as ImageFormat;

        const res = await fetch(_hQ, {
          mode: "cors",
          signal: _controller.signal,
        });
        if (!res.ok) return;
        const blob = await res.blob();

        if (!_active) return;

        if (window.Worker) {
          const worker = new Worker(
            new URL("@/wasm/imageWorker.ts", import.meta.url),
            { type: "module" }
          );

          // ─── FIX: Selalu terminate worker dan revoke blob lama
          const transcoded = await new Promise<Blob>((resolve, reject) => {
            worker.onmessage = (e) => {
              worker.terminate();
              const { error, result } = e.data;
              if (error) reject(new Error(error));
              else resolve(result);
            };
            worker.onerror = (err) => {
              worker.terminate();
              reject(err);
            };
            worker.postMessage({
              id: assetId,
              blob,
              format: fmt,
              quality: 0.7,
            });
          });

          if (!_active) return;

          await saveAssetToShared(assetId, transcoded);

          // ─── FIX: Revoke URL lama sebelum buat yang baru
          if (_blobUrlRef.current) {
            URL.revokeObjectURL(_blobUrlRef.current);
          }
          const newUrl = URL.createObjectURL(transcoded);
          _blobUrlRef.current = newUrl;
          setOptimizedUrl(newUrl);
        }
      } catch (e) {
        // Abaikan AbortError (expected saat unmount)
      }
    })();

    return () => {
      _active = false;
      _controller.abort();
      // ─── FIX: Revoke blob URL saat komponen unmount
      if (_blobUrlRef.current) {
        URL.revokeObjectURL(_blobUrlRef.current);
        _blobUrlRef.current = null;
      }
    };
  }, [_hQ, _isGif, isLowQuality, slug, index]);

  // FIX: Jangan render jika URL tidak valid atau berasal dari supabase
  if (!_hQ || _hQ.includes("supabase.co") || !_validHQ) return null;

  // ─── Per-item copyright metadata ─────────────────────────────────────────
  const _cp = _detectImageSource(_hQ);
  const _imgName = title
    ? `${title} — Image ${startIndex + index + 1}`
    : `Gallery image ${startIndex + index + 1}`;
  const _imgDesc = title
    ? `Photo ${startIndex + index + 1} from ${title}`
    : `Gallery photo ${startIndex + index + 1}`;

  return (
    <figure
      className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 group relative"
      role="listitem"
      itemScope
      itemType="https://schema.org/ImageObject"
      // ─── FIX: contain:content mencegah repaint menyebar ke luar komponen
      style={{ contain: "content" }}
    >
      {/* ── Microdata: semua field ImageObject wajib GSC ── */}
      <meta itemProp="url"                content={_hQ} />
      <meta itemProp="contentUrl"         content={_hQ} />
      <meta itemProp="name"               content={_imgName} />
      <meta itemProp="description"        content={_imgDesc} />
      {/* FIX: copyright fields — wajib untuk Google Image Metadata rich results */}
      <meta itemProp="license"            content={_cp.license} />
      <meta itemProp="copyrightNotice"    content={_cp.copyright} />
      <meta itemProp="acquireLicensePage" content={_cp.acquireUrl} />
      <meta itemProp="creditText"         content={_cp.creatorName} />
      <span
        itemScope
        itemType={`https://schema.org/${_cp.creatorType}`}
        itemProp="creator"
        style={{ display: "none" }}
      >
        <meta itemProp="name" content={_cp.creatorName} />
        <meta itemProp="url"  content={_cp.creatorUrl} />
      </span>
      <meta
        itemProp="encodingFormat"
        content={
          _hQ.toLowerCase().match(/\.gif/i)
            ? "image/gif"
            : _hQ.toLowerCase().match(/\.webp/i)
            ? "image/webp"
            : "image/jpeg"
        }
      />
      <meta
        itemProp="representativeOfPage"
        content={String(index === 0)}
      />

      <a
        href={_hQ}
        download={`brawnly_${slug}_${downloadPrefix}_${startIndex + index}.jpg`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          title
            ? `View full image ${startIndex + index + 1} from ${title}${_isGif ? " (GIF)" : ""}`
            : `View gallery image ${startIndex + index + 1}${_isGif ? " (GIF)" : ""}`
        }
        itemProp="url"
        className="block w-full h-full"
      >
        <img
          src={optimizedUrl}
          loading="lazy"
          crossOrigin="anonymous"
          alt={
            title
              ? `${title} — Image ${startIndex + index + 1}${_isGif ? " (animated)" : ""}`
              : `Gallery image ${startIndex + index + 1}${_isGif ? " (animated)" : ""}`
          }
          // ─── FIX: gunakan CSS opacity via class, hindari inline style mutation
          // ─── FIX: will-change hanya pada elemen yang hover, bukan semua gambar
          style={{ opacity: 0, transition: "opacity .4s" }}
          onLoad={(_ev) => {
            (_ev.currentTarget as HTMLImageElement).style.opacity = "1";
          }}
          onError={(_ev) => {
            (_ev.currentTarget as HTMLImageElement).style.display = "none";
          }}
          fetchpriority={index < 2 ? "high" : "auto"}
          itemProp="contentUrl"
          // ─── FIX: Hapus group-hover:scale — ini memicu layout/composite di SEMUA
          // gambar sekaligus saat hover, menyebabkan jank saat scroll.
          // Diganti dengan transform hanya pada elemen yang di-hover saja.
          className={`w-full h-full ${_isGif ? "object-contain" : "object-cover"} transition-transform duration-500 hover:scale-105`}
        />
        {_isGif && (
          <div
            className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded font-black border border-white/20 pointer-events-none"
            aria-hidden="true"
          >
            GIF
          </div>
        )}
      </a>

      <figcaption className="sr-only">
        {title
          ? `${title} — Image ${startIndex + index + 1}${_isGif ? " (animated GIF)" : ""}`
          : `Gallery image ${startIndex + index + 1}${_isGif ? " (animated GIF)" : ""}`}
      </figcaption>
    </figure>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const ArticleImageGallery: React.FC<ArticleImageGalleryProps> = ({
  images: _rI,
  title: _tS,
  slug: _sl,
  containerClassName: _cC = "px-0 py-0",
  downloadPrefix: _dP,
  startIndex: _sI,
}) => {
  const { isEnabled: _iE, saveData: _sD } = _uSD();

  const _fC = (_u: string) => {
    if (!_u) return "";
    const trimmed = _u.trim();
    if (trimmed.startsWith("http")) return trimmed;
    const _f = _gFI(trimmed);
    if (_f.startsWith("http")) return _f;
    return `${_CC.baseUrl}/${trimmed}`;
  };

  const _mQ = (() => {
    try {
      return navigator.storage?.estimate?.() ?? Promise.resolve(null);
    } catch {
      return Promise.resolve(null);
    }
  })();

  const _iP: string[] = _rI
    ? _rI
        .split(/[\r\n]+/)
        .map((_p) => _p.trim())
        .filter(
          (_p) =>
            _p.length > 0 &&
            !_p.includes("youtube.com") &&
            !_p.includes("youtu.be")
        )
    : [];

  _e(() => {
    if (!_iP.length) return;
    (async () => {
      const _k = `brawnly_gallery_${_sl}_${_dP}`;
      const _pL = JSON.stringify({
        t: _tS,
        s: _sl,
        i: _iP,
        ts: Date.now(),
      });

      const _cch = localStorage.getItem(_k);
      if (_cch && _cch.includes("supabase.co")) {
        localStorage.removeItem(_k);
      }

      try {
        const _est = await _mQ;
        if (
          _est?.quota &&
          _est?.usage &&
          _est.usage > _est.quota * 0.25
        ) {
          Object.keys(localStorage)
            .filter((_x) => _x.startsWith("brawnly_gallery_"))
            .slice(0, 5)
            .forEach((_x) => localStorage.removeItem(_x));
        }
        if (localStorage.getItem(_k) !== _pL) {
          localStorage.setItem(_k, _pL);
        }

        await setCookieHash(`gal_${_sl}_${_dP}`);
        mirrorQuery({
          type: "GALLERY_LOAD",
          slug: _sl,
          prefix: _dP,
          count: _iP.length,
        });
      } catch {}
    })();
  }, [_iP, _sl, _dP, _tS]);

  if (!_iP.length) return null;

  // ─── FIX: Resolve + validasi semua URL sebelum masuk ke JSON-LD.
  // Tumblr, IG, TikTok bisa menghasilkan URL relatif atau proxy —
  // wajib absolute HTTPS valid agar tidak kena "Invalid URL in field url/contentUrl" di GSC.
  const _resolvedImages: Array<{ raw: string; valid: string }> = _iP
    .map((_p) => {
      const resolved = _fC(_p);
      const valid = _validateUrl(resolved);
      return valid ? { raw: _p, valid } : null;
    })
    .filter((x): x is { raw: string; valid: string } =>
      x !== null && !x.valid.includes("supabase.co")
    );

  // ─── JSON-LD: ImageGallery (dengan semua field copyright per sumber) ──────
  const _ld = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": _tS || `Gallery ${_sl}`,
    "description": _tS
      ? `Image gallery for article: ${_tS}. Contains ${_resolvedImages.length} image${_resolvedImages.length !== 1 ? "s" : ""}.`
      : `Photo gallery — ${_resolvedImages.length} image${_resolvedImages.length !== 1 ? "s" : ""}.`,
    "url": `${SITE_URL}/article/${_sl}`,
    "numberOfItems": _resolvedImages.length,
    // FIX: image field pakai ImageObject penuh dengan copyright per sumber
    "image": _resolvedImages
      .map(({ valid }, _idx) =>
        _buildImageObject(
          valid,
          _tS ? `${_tS} — Image ${_sI + _idx + 1}` : `Gallery image ${_sI + _idx + 1}`,
          _tS ? `Photo ${_sI + _idx + 1} from ${_tS}` : `Gallery photo ${_sI + _idx + 1}`,
          _idx === 0
        )
      )
      .filter(Boolean),
    "associatedArticle": {
      "@type": "Article",
      "url":      `${SITE_URL}/article/${_sl}`,
      "headline": _tS || _sl,
      "name":     _tS || _sl,
    },
    "author": {
      "@type": "Person",
      "name":  AUTHOR_NAME,
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
  };

  // ─── JSON-LD: ItemList (dengan copyright per item) ────────────────────────
  const _ldItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": _tS ? `Image list — ${_tS}` : `Gallery image list`,
    "description": `Ordered list of images in gallery for: ${_tS || _sl}`,
    "numberOfItems": _resolvedImages.length,
    "itemListElement": _resolvedImages
      .map(({ valid }, _idx) => ({
        "@type":    "ListItem",
        "position": _sI + _idx + 1,
        "item":     _buildImageObject(
          valid,
          _tS ? `${_tS} — Image ${_sI + _idx + 1}` : `Gallery image ${_sI + _idx + 1}`,
          _tS ? `Photo ${_sI + _idx + 1} from ${_tS}` : `Gallery photo ${_sI + _idx + 1}`,
          _idx === 0
        ),
      }))
      .filter((x) => x.item !== null),
  };

  const _lQ = _iE && _sD.quality === "low";

  return (
    <div
      className={`${_cC} leading-[0] block overflow-hidden`}
      itemScope
      itemType="https://schema.org/ImageGallery"
    >
      <script type="application/ld+json">{JSON.stringify(_ld)}</script>
      <script type="application/ld+json">{JSON.stringify(_ldItemList)}</script>

      <meta itemProp="name" content={_tS || `Gallery ${_sl}`} />
      <meta
        itemProp="description"
        content={
          _tS
            ? `Image gallery for article: ${_tS}. Contains ${_resolvedImages.length} image${_resolvedImages.length !== 1 ? "s" : ""}.`
            : `Photo gallery — ${_resolvedImages.length} image${_resolvedImages.length !== 1 ? "s" : ""}.`
        }
      />
      <meta itemProp="url"           content={`${SITE_URL}/article/${_sl}`} />
      <meta itemProp="numberOfItems" content={String(_resolvedImages.length)} />

      {/* FIX: Publisher dengan logo ImageObject lengkap */}
      <span
        itemScope
        itemType="https://schema.org/Organization"
        itemProp="publisher"
        style={{ display: "none" }}
      >
        <meta itemProp="name" content={SITE_NAME} />
        <meta itemProp="url"  content={SITE_URL} />
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

      <span
        itemScope
        itemType="https://schema.org/Person"
        itemProp="author"
        style={{ display: "none" }}
      >
        <meta itemProp="name" content={AUTHOR_NAME} />
        <meta itemProp="url"  content={SITE_URL} />
      </span>

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
        <span itemScope itemType="https://schema.org/Article">
          <a
            href={`${SITE_URL}/article/${_sl}`}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {_tS || _sl}
          </a>
          <span itemProp="headline" content={_tS || _sl} />
          <span itemProp="publisher" content={SITE_NAME} />
        </span>

        <span itemScope itemType="https://schema.org/Organization">
          <a
            href={SITE_URL}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {SITE_NAME}
          </a>
          <span itemProp="name" content={SITE_NAME} />
        </span>

        {/* ── Hidden ordered image list — full copyright per item ── */}
        <ol aria-label={_tS ? `Image list for ${_tS}` : "Gallery image list"}>
          {_resolvedImages.map(({ valid: _url }, _idx) => {
            const _isGif =
              _url.toLowerCase().match(/\.(gif|gifv|webp)$/i) ||
              _url.includes("tumblr.com");
            const _cp2 = _detectImageSource(_url);
            return (
              <li
                key={`seo-img-${_idx}`}
                itemScope
                itemType="https://schema.org/ImageObject"
              >
                <meta itemProp="url"                content={_url} />
                <meta itemProp="contentUrl"         content={_url} />
                <meta itemProp="name"               content={_tS ? `${_tS} — Image ${_sI + _idx + 1}` : `Gallery image ${_sI + _idx + 1}`} />
                <meta itemProp="description"        content={_tS ? `Photo ${_sI + _idx + 1} from ${_tS}` : `Gallery photo ${_sI + _idx + 1}`} />
                {/* FIX: copyright fields wajib GSC */}
                <meta itemProp="license"            content={_cp2.license} />
                <meta itemProp="copyrightNotice"    content={_cp2.copyright} />
                <meta itemProp="acquireLicensePage" content={_cp2.acquireUrl} />
                <meta itemProp="creditText"         content={_cp2.creatorName} />
                <span
                  itemScope
                  itemType={`https://schema.org/${_cp2.creatorType}`}
                  itemProp="creator"
                >
                  <meta itemProp="name" content={_cp2.creatorName} />
                  <meta itemProp="url"  content={_cp2.creatorUrl} />
                </span>
                <meta
                  itemProp="encodingFormat"
                  content={
                    _url.toLowerCase().match(/\.gif/i)
                      ? "image/gif"
                      : _url.toLowerCase().match(/\.webp/i)
                      ? "image/webp"
                      : "image/jpeg"
                  }
                />
                <meta itemProp="representativeOfPage" content={String(_idx === 0)} />
                <a
                  href={_url}
                  itemProp="url"
                  tabIndex={-1}
                  download={`brawnly_${_sl}_${_dP}_${_sI + _idx}.jpg`}
                  rel="noopener noreferrer"
                >
                  {_tS ? `${_tS} — Image ${_sI + _idx + 1}` : `Gallery image ${_sI + _idx + 1}`}
                  {_isGif ? " (GIF)" : ""}
                </a>
              </li>
            );
          })}
        </ol>

        <link
          rel="isPartOf"
          href={`${SITE_URL}/article/${_sl}`}
        />
      </div>

      {_tS && (
        <h2
          className="text-lg font-black uppercase mb-4 text-gray-900 dark:text-white"
          itemProp="name"
        >
          {_tS}
        </h2>
      )}

      <div
        className="grid grid-cols-2 gap-2 md:gap-3 w-full"
        role="list"
        aria-label={_tS ? `Image gallery for ${_tS}` : "Image gallery"}
      >
        {/* ─── FIX: Render GalleryItem komponen terpisah, bukan panggil
            hooks di dalam .map() — ini perbaikan utama penyebab freeze */}
        {_iP.map((_rP, _ix) => (
          <GalleryItem
            key={`gallery-item-${_ix}`}
            rawPath={_rP}
            index={_ix}
            startIndex={_sI}
            slug={_sl}
            downloadPrefix={_dP}
            title={_tS}
            isLowQuality={_lQ}
          />
        ))}
      </div>

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
        <span itemProp="numberOfItems" content={String(_resolvedImages.length)} />
        <span
          itemScope
          itemType="https://schema.org/Organization"
          itemProp="publisher"
        >
          <span itemProp="name" content={SITE_NAME} />
          <a
            href={SITE_URL}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {SITE_NAME}
          </a>
        </span>
      </div>
    </div>
  );
};

export default ArticleImageGallery;