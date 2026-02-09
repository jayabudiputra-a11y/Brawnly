import React from 'react';
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

  const _iP = _rI 
    ? _rI.split(/[\r\n]+/).map(_p => _p.trim()).filter(_p => _p.length > 0)
    : [];

  if (_iP.length === 0) return null;

  const _jLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": _tStr || `Gallery for ${_sl}`,
    "description": `Editorial imagery collection for ${_sl}`,
    "image": _iP.map(_p => _gFI(_p)).filter(Boolean)
  };

  return (
    <div className={`${_cC} leading-[0] block overflow-hidden`}>
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>
      {_tStr && _tStr.trim() !== "" && (
        <h2 className="text-lg font-black uppercase mb-4 text-gray-900 dark:text-white tracking-tight leading-normal">
          {_tr(_tStr)}
        </h2>
      )}
      
      <div className="grid grid-cols-2 gap-2 md:gap-3 w-full mb-0 pb-0 place-items-start">
        {_iP.map((_rP, _idx) => {
          const _hQU = _gFI(_rP); 
          if (!_hQU) return null;

          const _iLQM = _iE && _sD.quality === 'low';
          const _tW = _iLQM ? 200 : 400;
          const _dU = _gOI(_hQU, _tW);

          return (
            <div 
              key={_idx} 
              className="w-full aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 group relative"
            >
              <a 
                href={_hQU} 
                download={`brawnly_${_sl}_${_dP}_${_sI + _idx}.jpg`} 
                className="block w-full h-full" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  src={_dU} 
                  width="400"
                  height="533"
                  loading="lazy" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt={`${_tr("Gallery image")} ${_sI + _idx}`} 
                  onLoad={(_e) => {
                    _e.currentTarget.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.5s', display: 'block' }}
                  {...({ fetchpriority: _idx < 2 ? "high" : "auto" } as any)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArticleImageGallery;