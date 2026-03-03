import React, { useState as _s, useMemo as _m, useEffect as _e } from 'react';
import { getOptimizedImage as _gOI } from '@/lib/utils';
import { useSaveData as _uSD } from '@/hooks/useSaveData';
import { setCookieHash, mirrorQuery } from '@/lib/enterpriseStorage';
import { detectBestFormat } from '@/lib/imageFormat';
import { saveAssetToShared, getAssetFromShared } from '@/lib/sharedStorage';

type ImageFormat = "webp" | "avif";

interface ArticleCoverImageProps {
  imageUrl?: string | null;
  title: string;
  slug: string;
  className?: string;
}

const ArticleCoverImage: React.FC<ArticleCoverImageProps> = ({ 
  imageUrl: _u, 
  title: _t, 
  slug: _sl,
  className: _cN = "" 
}) => {
  const { isEnabled: _iE, saveData: _sD } = _uSD();
  const [_iL, _siL] = _s(false);
  const [_oW, _sOW] = _s<string | null>(null);

  const _mQ = async () => {
    try { return await navigator.storage?.estimate?.(); } catch { return null; }
  };

  const _sU = _m(() => {
    if (!_u || typeof _u !== 'string') return null;
    return _u.split(/[\r\n]+/)[0].trim();
  }, [_u]);

  const _isGif = _m(() => {
    if (!_sU) return false;
    const _path = _sU.toLowerCase();
    return _path.endsWith('.gif') || _path.endsWith('.gifv') || _path.includes('tumblr.com') || _path.includes('giphy.com');
  }, [_sU]);

  const _tOpt = async (_src: string) => {
    try {
      const _isTrusted = _src.includes('cloudinary.com') || _src.includes('localhost') || _src.includes('supabase.co');
      if (!_isTrusted || _isGif) return _src;

      const cached = await getAssetFromShared(`cover_${_sl}`);
      if (cached) return URL.createObjectURL(cached);

      const r = await fetch(_src, { mode: "cors" });
      const b = await r.blob();
      
      let finalBlob = b;
      if (b.type !== "image/gif" && window.Worker) {
        try {
          const _fmtStr = await detectBestFormat();
          const _fmt = (_fmtStr.toLowerCase() === "avif" ? "avif" : "webp") as ImageFormat;
          const _quality = _iE ? 0.4 : 0.75; 

          finalBlob = await new Promise<Blob>((resolve, reject) => {
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

            worker.postMessage({ id: `cover_${_sl}`, blob: b, format: _fmt, quality: _quality });
          });

          if (finalBlob) {
            await saveAssetToShared(`cover_${_sl}`, finalBlob);
          }
        } catch { }
      }

      return URL.createObjectURL(finalBlob);
    } catch {
      return _src;
    }
  };

  _e(() => {
    if (!_sU) return;
    (async () => {
      const k = `brawnly_cover_${_sl}`;
      const payload = JSON.stringify({ t: _t, s: _sl, u: _sU, ts: Date.now() });
      try {
        const est = await _mQ();
        if (est?.quota && est?.usage && est.usage > est.quota * 0.25) {
          Object.keys(localStorage).filter(key => key.startsWith("brawnly_cover_")).slice(0, 3).forEach(key => localStorage.removeItem(key));
        }
        localStorage.setItem(k, payload);
        await setCookieHash(`cover_${_sl}`);
        mirrorQuery({ type: 'COVER_VIEW', slug: _sl, ts: Date.now() });
      } catch {}
    })();
  }, [_sU, _sl, _t]);

  _e(() => {
    if (!_sU) return;
    let _activeBlob: string | null = null;
    (async () => {
      const _sourceForBlob = _isGif ? _sU : _gOI(_sU, 1200);
      const u = await _tOpt(_sourceForBlob);
      _activeBlob = u;
      _sOW(u);
    })();
    return () => {
      if (_activeBlob && _activeBlob.startsWith("blob:")) URL.revokeObjectURL(_activeBlob);
    };
  }, [_sU, _isGif, _iE]);

  if (!_sU) return null;

  const _iLQM = _iE && _sD.quality === 'low';
  const _tWidth = _iLQM ? 480 : 900;
  
  const _dU = _isGif ? _sU : _gOI(_sU, _tWidth);
  const _fU = _oW || _dU;

  const _ldImageObject = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "url": _sU,
    "contentUrl": _sU,
    "name": _t ? `${_t} — Cover Image` : `Cover image — ${_sl}`,
    "description": _t
      ? `Featured cover image for the article: ${_t}`
      : `Cover image for Brawnly article: ${_sl.replace(/-/g, ' ')}`,
    "caption": _t || _sl.replace(/-/g, ' '),
    "representativeOfPage": true,
    "encodingFormat": _isGif ? "image/gif" : "image/jpeg",
    "width": _tWidth,
    "associatedArticle": {
      "@type": "Article",
      "url": `https://www.brawnly.online/article/${_sl}`,
      "headline": _t || _sl.replace(/-/g, ' '),
      "name": _t || _sl.replace(/-/g, ' '),
    },
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly",
      "url": "https://www.brawnly.online",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.brawnly.online/favicon.ico",
      },
    },
    "creditText": "Brawnly",
    "copyrightNotice": "© Brawnly",
    "acquireLicensePage": `https://www.brawnly.online/article/${_sl}`,
  };

  const _ldWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://www.brawnly.online/article/${_sl}`,
    "url": `https://www.brawnly.online/article/${_sl}`,
    "name": _t || _sl.replace(/-/g, ' '),
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": _sU,
      "contentUrl": _sU,
      "name": _t ? `${_t} — Cover Image` : `Cover image — ${_sl}`,
      "representativeOfPage": true,
    },
    "image": {
      "@type": "ImageObject",
      "url": _sU,
    },
  };

  return (
    <div
      className={`w-full mb-6 ${_cN}`}
      itemScope
      itemType="https://schema.org/ImageObject"
    >
      <script type="application/ld+json">{JSON.stringify(_ldImageObject)}</script>

      <script type="application/ld+json">{JSON.stringify(_ldWebPage)}</script>

      <meta itemProp="url" content={_sU} />
      <meta itemProp="contentUrl" content={_sU} />
      <meta
        itemProp="name"
        content={_t ? `${_t} — Cover Image` : `Cover image — ${_sl}`}
      />
      <meta
        itemProp="description"
        content={
          _t
            ? `Featured cover image for the article: ${_t}`
            : `Cover image for Brawnly article: ${_sl.replace(/-/g, ' ')}`
        }
      />
      <meta itemProp="representativeOfPage" content="true" />
      <meta
        itemProp="encodingFormat"
        content={_isGif ? "image/gif" : "image/jpeg"}
      />
      <meta itemProp="caption" content={_t || _sl.replace(/-/g, ' ')} />
      <meta itemProp="creditText" content="Brawnly" />

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
        <figure itemScope itemType="https://schema.org/ImageObject">
          <img
            src={_sU}
            alt={_t ? `${_t} — Cover Image` : `Cover image — ${_sl}`}
            itemProp="url"
            tabIndex={-1}
          />
          <meta itemProp="contentUrl" content={_sU} />
          <meta
            itemProp="name"
            content={_t ? `${_t} — Cover Image` : `Cover image — ${_sl}`}
          />
          <meta
            itemProp="description"
            content={
              _t
                ? `Featured cover image for the article: ${_t}`
                : `Cover image for Brawnly article: ${_sl.replace(/-/g, ' ')}`
            }
          />
          <meta itemProp="representativeOfPage" content="true" />
          <meta
            itemProp="encodingFormat"
            content={_isGif ? "image/gif" : "image/jpeg"}
          />
          <meta itemProp="caption" content={_t || _sl.replace(/-/g, ' ')} />
          <meta itemProp="creditText" content="Brawnly" />
          <meta
            itemProp="acquireLicensePage"
            content={`https://www.brawnly.online/article/${_sl}`}
          />
          <figcaption itemProp="caption">
            {_t || _sl.replace(/-/g, ' ')}
            {_isGif ? " (animated)" : ""}
          </figcaption>
        </figure>

        <span itemScope itemType="https://schema.org/Article">
          <a
            href={`https://www.brawnly.online/article/${_sl}`}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {_t || _sl.replace(/-/g, ' ')}
          </a>
          <span itemProp="headline" content={_t || _sl.replace(/-/g, ' ')} />
          <meta
            itemProp="image"
            content={_sU}
          />
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

        <link
          rel="isPartOf"
          href={`https://www.brawnly.online/article/${_sl}`}
        />

        <span itemScope itemType="https://schema.org/ImageObject">
          <meta
            itemProp="url"
            content={_gOI(_sU, 1200)}
          />
          <meta itemProp="width" content="1200" />
          <meta
            itemProp="name"
            content={_t ? `${_t} — Cover (1200w)` : `Cover image 1200w — ${_sl}`}
          />
          <meta itemProp="representativeOfPage" content="true" />
        </span>
      </div>

      <div className="p-[4px] bg-gradient-to-r from-[#ff0099] via-[#00ffff] to-[#ccff00] rounded-sm shadow-[6px_6px_0px_0px_#aa00ff] dark:shadow-[6px_6px_0px_0px_#00ffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#aa00ff] transition-all duration-200">
        <div className="bg-white dark:bg-[#1a0b2e] p-[2px]">
          <a
            href={_sU}
            className="block w-full h-full cursor-zoom-in"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              _t
                ? `View full cover image for: ${_t}${_isGif ? " (animated GIF)" : ""}`
                : `View cover image for article: ${_sl.replace(/-/g, ' ')}${_isGif ? " (animated GIF)" : ""}`
            }
            itemProp="url"
          >
            <div
              className={`${_isGif ? 'aspect-auto min-h-[200px]' : 'aspect-[16/9]'} bg-[#f0f0f0] dark:bg-[#2a1b3d] overflow-hidden relative ${_iL ? '' : 'animate-pulse'}`}
            >
              <img
                src={_fU}
                alt={
                  _t
                    ? `${_t}${_isGif ? " — animated cover" : " — cover image"}`
                    : `Cover image — ${_sl.replace(/-/g, ' ')}${_isGif ? " (animated)" : ""}`
                }
                className={`w-full h-full transition-opacity duration-700 ${_isGif ? 'object-contain' : 'object-cover'} ${_iL ? 'opacity-100' : 'opacity-0'}`}
                loading="eager"
                crossOrigin="anonymous"
                onLoad={() => _siL(true)}
                onError={(e) => {
                  _siL(true);
                  if (_fU.startsWith("blob:")) e.currentTarget.src = _dU;
                }}
                itemProp="contentUrl"
                {...({ fetchpriority: "high" } as any)}
              />
            </div>
          </a>
        </div>
      </div>

      <p
        className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#ff0099] dark:text-[#00ffff] font-black text-center drop-shadow-sm italic"
        itemProp="caption"
      >
        Brawnly Visual Asset — {_sl.replace(/-/g, ' ')}
      </p>

      <span className="sr-only" role="img" aria-label={_t || _sl.replace(/-/g, ' ')}>
        {_t
          ? `${_t} — featured cover image${_isGif ? " (animated)" : ""}`
          : `Cover image for article: ${_sl.replace(/-/g, ' ')}${_isGif ? " (animated)" : ""}`}
      </span>
    </div>
  );
};

export default ArticleCoverImage;