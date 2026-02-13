import React, { useEffect as _e } from 'react';
import { generateFullImageUrl as _gFI } from '@/utils/helpers';
import { useSaveData as _uSD } from '@/hooks/useSaveData';
import { getOptimizedImage as _gOI } from '@/lib/utils';
import { CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";

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
  title: _tS,
  slug: _sl,
  containerClassName: _cC = "px-0 py-0",
  downloadPrefix: _dP,
  startIndex: _sI
}) => {
  const { isEnabled: _iE, saveData: _sD } = _uSD();

  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    const _f = _gFI(_u);
    if (_f.startsWith("http")) return _f;
    return `${_CC.baseUrl}/${_u}`;
  };

  const _mQ = (() => {
    try { return navigator.storage?.estimate?.() ?? Promise.resolve(null); }
    catch { return Promise.resolve(null); }
  })();

  const _hS = async (_v: string) => {
    try {
      const _b = new TextEncoder().encode(_v);
      const _d = await crypto.subtle.digest("SHA-256", _b);
      return Array.from(new Uint8Array(_d)).slice(0, 8).map(_x => _x.toString(16).padStart(2, '0')).join('');
    } catch { return btoa(_v).slice(0, 16); }
  };

  const _iP: string[] = _rI ? _rI.split(/[\r\n]+/).map(_p => _p.trim()).filter(_p => _p.length > 0) : [];

  _e(() => {
    if (!_iP.length) return;
    (async () => {
      const _k = `brawnly_gallery_${_sl}_${_dP}`;
      const _pL = JSON.stringify({ t: _tS, s: _sl, i: _iP, ts: Date.now() });
      
      const _cch = localStorage.getItem(_k);
      if (_cch && _cch.includes("supabase.co")) {
        localStorage.removeItem(_k);
      }

      try {
        const _est = await _mQ;
        if (_est?.quota && _est?.usage && _est.usage > _est.quota * 0.25) {
          Object.keys(localStorage).filter(_x => _x.startsWith("brawnly_gallery_")).slice(0, 5).forEach(_x => localStorage.removeItem(_x));
        }
        if (localStorage.getItem(_k) !== _pL) { localStorage.setItem(_k, _pL); }
        const _hash = await _hS(_pL);
        document.cookie = `b_g_${_sl}=${_hash}; path=/; max-age=604800; SameSite=Lax`;
      } catch {}
    })();
  }, [_iP, _sl, _dP, _tS]);

  if (!_iP.length) return null;

  const _ld = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": _tS || `Gallery ${_sl}`,
    "image": _iP.map(_p => _fC(_p)).filter(_u => !_u.includes("supabase.co"))
  };

  return (
    <div className={`${_cC} leading-[0] block overflow-hidden`}>
      <script type="application/ld+json">{JSON.stringify(_ld)}</script>
      {_tS && <h2 className="text-lg font-black uppercase mb-4 text-gray-900 dark:text-white">{_tS}</h2>}
      <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
        {_iP.map((_rP, _ix) => {
          const _hQ = _fC(_rP);
          if (!_hQ || _hQ.includes("supabase.co")) return null;

          const _lQ = _iE && _sD.quality === 'low';
          const _w = _lQ ? 200 : 400;
          const _u = _gOI(_hQ, _w);
          return (
            <div key={_ix} className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900">
              <a href={_hQ} download={`brawnly_${_sl}_${_dP}_${_sI + _ix}.jpg`} target="_blank" rel="noopener noreferrer">
                <img
                  src={_u}
                  loading="lazy"
                  crossOrigin="anonymous"
                  alt={`Gallery item ${_sI + _ix}`}
                  style={{ opacity: 0, transition: "opacity .4s" }}
                  onLoad={_ev => { (_ev.currentTarget as HTMLImageElement).style.opacity = "1"; }}
                  onError={_ev => { (_ev.currentTarget as HTMLImageElement).style.display = "none"; }}
                  {...({ fetchpriority: _ix < 2 ? "high" : "auto" } as any)}
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