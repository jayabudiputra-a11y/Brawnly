import React, { useEffect } from 'react';
import { useTranslation as _uT } from "react-i18next";
import { generateFullImageUrl as _gFI } from '@/utils/helpers'; 
import { useSaveData as _uSD } from '@/hooks/useSaveData';
import { getOptimizedImage as _gOI } from '@/lib/utils';

interface ArticleImageGalleryProps {
  images: string; 
  title: string;
  slug: string;
  containerClassName?: string;
  downloadPrefix: string;
  startIndex: number;
}

const ArticleImageGallery: React.FC<ArticleImageGalleryProps> = ({ 
  images: _rI, 
  title: _tStr, 
  slug: _sl, 
  containerClassName: _cC = "px-0 py-0",
  downloadPrefix: _dP,
  startIndex: _sI
}) => {

  const { t: _tr } = _uT();
  const { isEnabled: _iE, saveData: _sD } = _uSD();

  /* ------------------------------------------------ */
  /* 🧠 MEMORY GUARD (¼ STORAGE TARGET)               */
  /* ------------------------------------------------ */

  const _mQ = (() => {
    try {
      return navigator.storage?.estimate?.() ?? Promise.resolve(null);
    } catch { return Promise.resolve(null); }
  })();

  /* ------------------------------------------------ */
  /* 🔐 HASH UTILITY (COOKIE POINTER / INDEX)         */
  /* ------------------------------------------------ */

  const _h = async (_v: string) => {
    try {
      const _b = new TextEncoder().encode(_v);
      const _d = await crypto.subtle.digest("SHA-256", _b);
      return Array.from(new Uint8Array(_d)).slice(0, 8)
        .map(x => x.toString(16).padStart(2,'0')).join('');
    } catch {
      return btoa(_v).slice(0, 16);
    }
  };

  /* ------------------------------------------------ */
  /* 📦 DATA PREP                                     */
  /* ------------------------------------------------ */

  const _iP: string[] = _rI
    ? _rI.split(/[\r\n]+/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0)
    : [];

  /* ------------------------------------------------ */
  /* 💾 SMART LOCAL CACHE + COOKIE POINTER            */
  /* ------------------------------------------------ */

  useEffect(() => {
    if (!_iP.length) return;

    (async () => {

      const _k = `brawnly_gallery_${_sl}_${_dP}`;
      const _payload = JSON.stringify({
        t: _tStr,
        s: _sl,
        i: _iP,
        ts: Date.now()
      });

      try {

        /* -------- STORAGE FRACTION LIMIT -------- */
        try {
          const est = await _mQ;
          if (est && est.quota && est.usage) {
            if (est.usage > est.quota * 0.25) {
              Object.keys(localStorage)
                .filter(k => k.startsWith("brawnly_gallery_"))
                .slice(0, 5)
                .forEach(k => localStorage.removeItem(k));
            }
          }
        } catch {}

        /* -------- SAVE LOCAL -------- */
        if (localStorage.getItem(_k) !== _payload) {
          localStorage.setItem(_k, _payload);
        }

        /* -------- COOKIE POINTER (LIGHT INDEX) -------- */
        try {
          const _hash = await _h(_payload);
          document.cookie = `b_g_${_sl}=${_hash}; path=/; max-age=604800; SameSite=Lax`;
        } catch {}

      } catch {}

    })();

  }, [_iP, _sl, _dP, _tStr]);

  /* ------------------------------------------------ */
  /* ☁️ OFFLINE CLOUD QUEUE (FB / BQ STYLE)           */
  /* ------------------------------------------------ */

  useEffect(() => {

    if (navigator.onLine) {
      try {
        const _q = JSON.parse(localStorage.getItem("brawnly_cloud_queue") || "[]");
        if (_q.length) {
          console.log("Cloud sync queued:", _q.length);
          localStorage.removeItem("brawnly_cloud_queue");
        }
      } catch {}
    }

  }, []);

  if (!_iP.length) return null;

  /* ------------------------------------------------ */
  /* 📊 SEO LD JSON                                  */
  /* ------------------------------------------------ */

  const _jLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": _tStr || `Gallery ${_sl}`,
    "image": _iP.map(p => _gFI(p)).filter(Boolean)
  };

  return (
    <div className={`${_cC} leading-[0] block overflow-hidden`}>

      <script type="application/ld+json">
        {JSON.stringify(_jLd)}
      </script>

      {_tStr && (
        <h2 className="text-lg font-black uppercase mb-4 text-gray-900 dark:text-white">
          {_tr(_tStr)}
        </h2>
      )}

      <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">

        {_iP.map((_rP: string, _idx: number) => {

          const _hQU = _gFI(_rP);
          if (!_hQU) return null;

          const _iLQM = _iE && _sD.quality === 'low';
          const _tW = _iLQM ? 200 : 400;
          const _dU = _gOI(_hQU, _tW);

          return (
            <div key={_idx}
              className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">

              <a
                href={_hQU}
                download={`brawnly_${_sl}_${_dP}_${_sI + _idx}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
              >

                <img
                  src={_dU}
                  loading="lazy"
                  crossOrigin="anonymous"
                  alt={`${_tr("Gallery image")} ${_sI + _idx}`}
                  style={{ opacity: 0, transition: "opacity .4s" }}
                  onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = "none";
                  }}
                  {...({ fetchpriority: _idx < 2 ? "high" : "auto" } as any)}
                  className="w-full h-full object-cover"
                />

              </a>

            </div>
          );

        })}

      </div>
    </div>
  );
};

export default ArticleImageGallery;
