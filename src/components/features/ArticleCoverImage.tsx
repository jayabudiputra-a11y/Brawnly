import React, { useState as _s, useMemo as _m, useEffect as _e } from 'react';
import Card from '@/components/ui/Card';
import { getOptimizedImage as _gOI } from '@/lib/utils';
import { useSaveData as _uSD } from '@/hooks/useSaveData';
import { wasmTranscodeImage as _wTI } from "@/lib/wasmImagePipeline";

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

  const _h = async (_v: string) => {
    try {
      const b = new TextEncoder().encode(_v);
      const d = await crypto.subtle.digest("SHA-256", b);
      return Array.from(new Uint8Array(d)).slice(0, 8).map(x => x.toString(16).padStart(2, '0')).join('');
    } catch { return btoa(_v).slice(0, 16); }
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

      const r = await fetch(_src, { mode: "cors" });
      const b = await r.blob();
      
      let finalBlob = b;
      if (b.type !== "image/gif") {
        try {
          const optimized = await _wTI(b, "webp", 0.75);
          if (optimized) finalBlob = optimized;
        } catch { /* fallback */ }
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
          Object.keys(localStorage).filter(k => k.startsWith("brawnly_cover_")).slice(0, 3).forEach(k => localStorage.removeItem(k));
        }
        const _ex = localStorage.getItem(k);
        if (_ex && _ex.includes("supabase.co")) localStorage.removeItem(k);
        localStorage.setItem(k, payload);
        const hash = await _h(payload);
        document.cookie = `b_cov_${_sl}=${hash}; path=/; max-age=604800; SameSite=Lax`;
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
  }, [_sU, _isGif]);

  if (!_sU) return null;

  const _iLQM = _iE && _sD.quality === 'low';
  const _tWidth = _iLQM ? 480 : 900;
  
  const _dU = _isGif ? _sU : _gOI(_sU, _tWidth);
  const _fU = _oW || _dU;

  return (
    <div className={`w-full mb-6 ${_cN}`}>
      <Card variant="shadow" className="p-0 overflow-hidden border-none shadow-xl dark:shadow-neutral-900/50">
        <a href={_sU} className="block w-full h-full cursor-zoom-in" target="_blank" rel="noopener noreferrer">
          <div className={`${_isGif ? 'aspect-auto' : 'aspect-[16/9]'} bg-neutral-100 dark:bg-neutral-900 overflow-hidden ${_iL ? '' : 'animate-pulse'}`}>
            <img
              src={_fU}
              alt={_t}
              className={`w-full h-full transition-opacity duration-700 ${_isGif ? 'object-contain scale-100' : 'object-cover'} ${_iL ? 'opacity-100' : 'opacity-0'}`}
              loading="eager"
              crossOrigin="anonymous"
              onLoad={() => _siL(true)}
              onError={(e) => {
                _siL(true);
                if (_fU.startsWith("blob:")) e.currentTarget.src = _dU;
              }}
              {...({ fetchpriority: "high" } as any)}
            />
          </div>
        </a>
      </Card>
      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600 font-bold text-center">
        Brawnly Visual Asset — {_sl.replace(/-/g, ' ')}
      </p>
    </div>
  );
};

export default ArticleCoverImage;