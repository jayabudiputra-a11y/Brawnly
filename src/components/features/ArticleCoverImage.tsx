import React, { useState as _s, useMemo as _m, useEffect as _e } from 'react';
import Card from '@/components/ui/Card';
import { getOptimizedImage as _gOI } from '@/lib/utils';
import { useSaveData as _uSD } from '@/hooks/useSaveData';
import { optimizeUpload } from '@/lib/imageOptimizer';

interface ArticleCoverImageProps {
  imageUrl?: string | null;
  title: string;
  slug: string;
}

const ArticleCoverImage: React.FC<ArticleCoverImageProps> = ({ imageUrl: _u, title: _t, slug: _sl }) => {

  const { isEnabled: _iE, saveData: _sD } = _uSD();
  const [_iL, _siL] = _s(false);
  const [_oW, _sOW] = _s<string | null>(null);

  const _mQ = async () => {
    try {
      return await navigator.storage?.estimate?.();
    } catch { return null; }
  };

  const _h = async (_v: string) => {
    try {
      const b = new TextEncoder().encode(_v);
      const d = await crypto.subtle.digest("SHA-256", b);
      return Array.from(new Uint8Array(d))
        .slice(0, 8)
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return btoa(_v).slice(0, 16);
    }
  };

  const _sU = _m(() => {
    if (!_u || typeof _u !== 'string') return null;
    return _u.split(/[\r\n]+/)[0].trim();
  }, [_u]);

  const _tOpt = async (_src: string) => {
    try {
      const r = await fetch(_src, { mode: "cors" });
      const b = await r.blob();
      const f = new File([b], "cover", { type: b.type });
      const optimized = await optimizeUpload(f);
      const u = URL.createObjectURL(optimized);
      return u;
    } catch {
      return _src;
    }
  };

  _e(() => {
    if (!_sU) return;

    (async () => {

      const k = `brawnly_cover_${_sl}`;
      const payload = JSON.stringify({
        t: _t,
        s: _sl,
        u: _sU,
        ts: Date.now()
      });

      try {

        const est = await _mQ();
        if (est?.quota && est?.usage) {
          if (est.usage > est.quota * 0.25) {
            Object.keys(localStorage)
              .filter(k => k.startsWith("brawnly_cover_"))
              .slice(0, 3)
              .forEach(k => localStorage.removeItem(k));
          }
        }

        localStorage.setItem(k, payload);

        const hash = await _h(payload);
        document.cookie = `b_cov_${_sl}=${hash}; path=/; max-age=604800; SameSite=Lax`;

      } catch {}

    })();

  }, [_sU, _sl, _t]);

  _e(() => {
    if (!_sU) return;

    try {

      const q = JSON.parse(localStorage.getItem("brawnly_cloud_queue") || "[]");

      if (!navigator.onLine) {
        q.push({
          type: "cover_view",
          slug: _sl,
          url: _sU,
          ts: Date.now()
        });
        localStorage.setItem("brawnly_cloud_queue", JSON.stringify(q));
      }

    } catch {}

  }, [_sU, _sl]);

  _e(() => {
    if (!_sU) return;

    (async () => {
      const u = await _tOpt(_sU);
      _sOW(u);
    })();

  }, [_sU]);

  if (!_sU) return null;

  const _iLQM = _iE && _sD.quality === 'low';
  const _tWidth = _iLQM ? 480 : 900;
  const _dU = _gOI(_sU, _tWidth);
  const _fU = _oW || _dU;

  const _jLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": _sU,
    "thumbnail": _dU,
    "name": _t,
    "description": `Visual content for ${_sl}`,
    "representativeOfPage": "true",
    "author": { "@type": "Person", "name": "Budi Putra Jaya" }
  };

  return (
    <div className="w-full mb-6">

      <script type="application/ld+json">
        {JSON.stringify(_jLd)}
      </script>

      <Card variant="shadow" className="p-0 overflow-hidden border-none shadow-xl dark:shadow-neutral-900/50">

        <a
          href={_sU}
          className="block w-full h-full cursor-zoom-in"
          target="_blank"
          rel="noopener noreferrer"
        >

          <div className={`aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 overflow-hidden ${_iL ? '' : 'animate-pulse'}`}>

            <img
              src={_fU}
              alt={_t}
              className={`w-full h-full object-cover transition-opacity duration-700 ${_iL ? 'opacity-100' : 'opacity-0'}`}
              loading="eager"
              width="900"
              height="506"
              onLoad={() => _siL(true)}
              onError={(e) => {
                _siL(true);
                e.currentTarget.style.opacity = '0.5';
              }}
              {...({ fetchpriority: "high" } as any)}
            />

          </div>

        </a>

      </Card>

      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600 font-bold text-center">
        Brawnly Visual Content — {_sl.replace(/-/g, ' ')}
      </p>

    </div>
  );
};

export default ArticleCoverImage;
