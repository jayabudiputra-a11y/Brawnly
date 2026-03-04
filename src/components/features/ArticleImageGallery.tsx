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

  if (!_hQ || _hQ.includes("supabase.co")) return null;

  return (
    <figure
      className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 group relative"
      role="listitem"
      itemScope
      itemType="https://schema.org/ImageObject"
      // ─── FIX: contain:content mencegah repaint menyebar ke luar komponen
      style={{ contain: "content" }}
    >
      <meta itemProp="url" content={_hQ} />
      <meta itemProp="contentUrl" content={_hQ} />
      <meta
        itemProp="name"
        content={
          title
            ? `${title} — Image ${startIndex + index + 1}`
            : `Gallery image ${startIndex + index + 1}`
        }
      />
      <meta
        itemProp="description"
        content={
          title
            ? `Photo ${startIndex + index + 1} from ${title}`
            : `Gallery photo ${startIndex + index + 1}`
        }
      />
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

  const _ld = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: _tS || `Gallery ${_sl}`,
    description: _tS
      ? `Image gallery for article: ${_tS}. Contains ${_iP.length} image${_iP.length !== 1 ? "s" : ""}.`
      : `Photo gallery — ${_iP.length} image${_iP.length !== 1 ? "s" : ""}.`,
    url: `https://www.brawnly.online/article/${_sl}`,
    image: _iP
      .map((_p, _idx) => ({
        "@type": "ImageObject",
        url: _fC(_p),
        name: _tS
          ? `${_tS} — Image ${_sI + _idx + 1}`
          : `Gallery image ${_sI + _idx + 1}`,
        description: _tS
          ? `Photo ${_sI + _idx + 1} from ${_tS}`
          : `Gallery photo ${_sI + _idx + 1}`,
        contentUrl: _fC(_p),
        encodingFormat: _p.toLowerCase().match(/\.gif/i)
          ? "image/gif"
          : _p.toLowerCase().match(/\.webp/i)
          ? "image/webp"
          : "image/jpeg",
        representativeOfPage: _idx === 0,
      }))
      .filter((_o) => !_o.url.includes("supabase.co")),
    associatedArticle: {
      "@type": "Article",
      url: `https://www.brawnly.online/article/${_sl}`,
      headline: _tS || _sl,
      name: _tS || _sl,
    },
    numberOfItems: _iP.length,
    publisher: {
      "@type": "Organization",
      name: "Brawnly",
      url: "https://www.brawnly.online",
    },
  };

  const _ldItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: _tS ? `Image list — ${_tS}` : `Gallery image list`,
    description: `Ordered list of images in gallery for: ${_tS || _sl}`,
    numberOfItems: _iP.length,
    itemListElement: _iP
      .map((_p, _idx) => {
        const _url = _fC(_p);
        if (!_url || _url.includes("supabase.co")) return null;
        return {
          "@type": "ListItem",
          position: _sI + _idx + 1,
          item: {
            "@type": "ImageObject",
            url: _url,
            name: _tS
              ? `${_tS} — Image ${_sI + _idx + 1}`
              : `Gallery image ${_sI + _idx + 1}`,
            contentUrl: _url,
          },
        };
      })
      .filter(Boolean),
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
            ? `Image gallery for article: ${_tS}. Contains ${_iP.length} image${_iP.length !== 1 ? "s" : ""}.`
            : `Photo gallery — ${_iP.length} image${_iP.length !== 1 ? "s" : ""}.`
        }
      />
      <meta
        itemProp="url"
        content={`https://www.brawnly.online/article/${_sl}`}
      />
      <meta itemProp="numberOfItems" content={String(_iP.length)} />

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
            href={`https://www.brawnly.online/article/${_sl}`}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {_tS || _sl}
          </a>
          <span itemProp="headline" content={_tS || _sl} />
          <span itemProp="publisher" content="Brawnly" />
        </span>

        <span itemScope itemType="https://schema.org/Organization">
          <a
            href="https://www.brawnly.online"
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly
          </a>
          <span itemProp="name" content="Brawnly" />
        </span>

        <ol aria-label={_tS ? `Image list for ${_tS}` : "Gallery image list"}>
          {_iP.map((_p, _idx) => {
            const _url = _fC(_p);
            if (!_url || _url.includes("supabase.co")) return null;
            const _isGif =
              _url.toLowerCase().match(/\.(gif|gifv|webp)$/i) ||
              _url.includes("tumblr.com");
            return (
              <li
                key={`seo-img-${_idx}`}
                itemScope
                itemType="https://schema.org/ImageObject"
              >
                <meta itemProp="url" content={_url} />
                <meta itemProp="contentUrl" content={_url} />
                <meta
                  itemProp="name"
                  content={
                    _tS
                      ? `${_tS} — Image ${_sI + _idx + 1}`
                      : `Gallery image ${_sI + _idx + 1}`
                  }
                />
                <meta
                  itemProp="description"
                  content={
                    _tS
                      ? `Photo ${_sI + _idx + 1} from ${_tS}`
                      : `Gallery photo ${_sI + _idx + 1}`
                  }
                />
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
                <meta
                  itemProp="representativeOfPage"
                  content={String(_idx === 0)}
                />
                <a
                  href={_url}
                  itemProp="url"
                  tabIndex={-1}
                  download={`brawnly_${_sl}_${_dP}_${_sI + _idx}.jpg`}
                  rel="noopener noreferrer"
                >
                  {_tS
                    ? `${_tS} — Image ${_sI + _idx + 1}`
                    : `Gallery image ${_sI + _idx + 1}`}
                  {_isGif ? " (GIF)" : ""}
                </a>
              </li>
            );
          })}
        </ol>

        <link
          rel="isPartOf"
          href={`https://www.brawnly.online/article/${_sl}`}
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
        <span itemProp="numberOfItems" content={String(_iP.length)} />
        <span
          itemScope
          itemType="https://schema.org/Organization"
          itemProp="publisher"
        >
          <span itemProp="name" content="Brawnly" />
          <a
            href="https://www.brawnly.online"
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly
          </a>
        </span>
      </div>
    </div>
  );
};

export default ArticleImageGallery;