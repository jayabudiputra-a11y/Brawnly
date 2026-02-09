import React, { useState as _s, useMemo as _m } from 'react';
import Card from '@/components/ui/Card';
import { getOptimizedImage as _gOI } from '@/lib/utils';
import { useSaveData as _uSD } from '@/hooks/useSaveData';

interface ArticleCoverImageProps {
  imageUrl?: string | null;
  title: string;
  slug: string;
}

const ArticleCoverImage: React.FC<ArticleCoverImageProps> = ({ imageUrl: _u, title: _t, slug: _sl }) => {
  const { isEnabled: _iE, saveData: _sD } = _uSD();
  const [_iL, _siL] = _s(false);

  const _sU = _m(() => {
    if (!_u || typeof _u !== 'string') return null;
    return _u.split(/[\r\n]+/)[0].trim();
  }, [_u]);

  if (!_sU) return null;

  const _iLQM = _iE && _sD.quality === 'low';
  const _tW = _iLQM ? 480 : 900;
  const _dU = _gOI(_sU, _tW);

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
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>
      <Card variant="shadow" className="p-0 overflow-hidden border-none shadow-xl dark:shadow-neutral-900/50">
        <a 
          href={_sU} 
          className="block w-full h-full cursor-zoom-in" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <div className={`aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 overflow-hidden ${_iL ? '' : 'animate-pulse'}`}>
            <img 
              src={_dU} 
              alt={_t} 
              className={`w-full h-full object-cover !m-0 transition-opacity duration-700 ease-in-out ${_iL ? 'opacity-100' : 'opacity-0'}`} 
              loading="eager" 
              {...({ fetchpriority: "high" } as any)}
              width="900"
              height="506"
              onLoad={() => _siL(true)}
              onError={(e) => {
                _siL(true); 
                e.currentTarget.style.opacity = '0.5';
                e.currentTarget.parentElement?.classList.add('bg-neutral-200');
              }}
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