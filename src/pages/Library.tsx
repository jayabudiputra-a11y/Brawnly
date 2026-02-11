import React, { useState as _s, useEffect as _e } from "react";
import { Link as _L } from "react-router-dom";
import { Bookmark as _Bm, BookOpen as _Bo, ArrowLeft as _Al, Hexagon as _Hx, Music as _Ms, Image as _Im, WifiOff as _Wo, RefreshCw as _Rc } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import { useArticles as _uA } from "@/hooks/useArticles";
import { songsApi as _sa, type Song as _S } from "@/lib/api"; 
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';

export default function Library() {
  const { isDark: _iD } = _uTP();
  const { data: _aD, isLoading: _aL, isRefetching: _iR } = _uA(); 
  
  const [_sA, _ssA] = _s<any[]>([]); 
  const [_sL, _ssL] = _s<_S[]>([]);  
  const [_lL, _slL] = _s(true);      
  const [_isOff, _sOff] = _s(!navigator.onLine);

  _e(() => {
    const _c = localStorage.getItem("brawnly_lib_cache");
    const _cM = localStorage.getItem("brawnly_music_cache");
    
    if (_c) {
      _ssA(JSON.parse(_c));
      _slL(false); 
    }
    if (_cM) {
      _ssL(JSON.parse(_cM));
    }

    const _hO = () => _sOff(false);
    const _hF = () => _sOff(true);
    window.addEventListener('online', _hO);
    window.addEventListener('offline', _hF);
    return () => {
      window.removeEventListener('online', _hO);
      window.removeEventListener('offline', _hF);
    };
  }, []);

  _e(() => {
    if (_aD) {
      const _sv = _aD.filter((a: any) => localStorage.getItem(`brawnly_saved_${a.slug}`) === "true");
      const _curr = JSON.stringify(_sv);
      const _prev = localStorage.getItem("brawnly_lib_cache");
      
      if (_curr !== _prev) {
        _ssA(_sv);
        localStorage.setItem("brawnly_lib_cache", _curr); 
      }
      
      if (_lL) _slL(false);
    }
  }, [_aD]);

  _e(() => {
    const _f = async () => {
      try {
        const _d = await _sa.getAll();
        const _currM = JSON.stringify(_d);
        if (_currM !== localStorage.getItem("brawnly_music_cache")) {
          _ssL(_d);
          localStorage.setItem("brawnly_music_cache", _currM);
        }
      } catch (_er) {
      } finally {
        if (!localStorage.getItem("brawnly_lib_cache")) {
          _slL(false);
        }
      }
    };
    _f();
  }, []);

  const _rI = (s: string) => {
    localStorage.removeItem(`brawnly_saved_${s}`);
    const _nA = _sA.filter((a) => a.slug !== s);
    _ssA(_nA);
    localStorage.setItem("brawnly_lib_cache", JSON.stringify(_nA));
  };

  const _gYI = (u: string) => {
    const _reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const _m = u.match(_reg);
    return (_m && _m[2].length === 11) ? _m[2] : null;
  };

  const _triggerGlobalPlay = (url: string) => {
    const _id = _gYI(url);
    if (_id) {
      window.dispatchEvent(new CustomEvent("BRAWNLY_MUSIC", { 
        detail: { type: "PLAY_SONG", id: _id } 
      }));
    }
  };

  // Logic Shuffle / Play Random Otomatis
  const _playRandom = () => {
    if (_sL.length > 0) {
      const _randomIndex = Math.floor(Math.random() * _sL.length);
      _triggerGlobalPlay(_sL[_randomIndex].url);
    }
  };

  const _x = {
    r: "min-h-screen bg-white dark:bg-[#0a0a0a] pt-10 pb-24 text-black dark:text-white transition-colors duration-500",
    c: "max-w-[1320px] mx-auto px-5 md:px-10",
    g: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
    cd: "group relative bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl",
    st: "text-2xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3",
    e: "flex flex-col items-center justify-center py-20 text-center"
  };

  if ((_aL || _lL) && _sA.length === 0 && _sL.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className={`w-12 h-12 border-4 ${_iD ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin`} />
    </div>
  );

  return (
    <main className={_x.r}>
      <div className={_x.c}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <_L to="/" aria-label="Back to feed" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all">
              <_Al size={14} aria-hidden="true" /> BACK_TO_FEED
            </_L>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">LIBRARY</h1>
            
            <div className="flex items-center gap-4 mt-2 h-6">
              {_isOff ? (
                <span className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                  <_Wo size={12} aria-hidden="true" /> OFFLINE MODE
                </span>
              ) : _iR ? (
                <span className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                  <_Rc size={12} className="animate-spin" aria-hidden="true" /> SYNCING...
                </span>
              ) : null}
            </div>
          </div>

          <div className={`flex items-center gap-4 ${ _iD ? 'bg-white text-black' : 'bg-black text-white' } px-6 py-4 rounded-xl shadow-xl border border-neutral-800 transition-colors duration-300`}>
            <_Bm size={20} fill="currentColor" aria-hidden="true" />
            <span className="text-2xl font-black italic">{_sA.length + _sL.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">ASSETS_BOUND</span>
          </div>
        </div>

        {/* BRAWNLY BEATS SECTION - CLEAN UI */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <_Ms className="text-emerald-500" aria-hidden="true" /> BRAWNLY_BEATS
            </h2>
            {/* Tombol shuffle tetap ada di header untuk kontrol manual, tapi tanpa tombol pause */}
            <button 
              onClick={_playRandom}
              className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-black dark:border-white hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all active:scale-95"
            >
              AUTO_SHUFFLE_MODE
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {_sL.map((s) => (
              <_m.div
                whileHover={{ y: -5, scale: 1.02 }}
                key={s.id}
                onClick={() => _triggerGlobalPlay(s.url)}
                role="button"
                aria-label={`Listen to ${s.title}`}
                className="relative aspect-square rounded-xl overflow-hidden group bg-neutral-100 dark:bg-neutral-800 cursor-pointer border border-transparent hover:border-emerald-500 transition-all duration-300"
              >
                <img 
                  src={s.thumbnail_url} 
                  alt={s.title} 
                  crossOrigin="anonymous" 
                  className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" 
                  loading="lazy" 
                />
                
                {/* Visual Overlay diganti dengan efek gradasi halus saja, TANPA tombol */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <p className="text-[9px] font-black uppercase truncate text-white tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-300">{s.title}</p>
                </div>
              </_m.div>
            ))}
          </div>
        </section>

        {/* SAVED INTELLIGENCE SECTION */}
        <section>
          <h2 className={_x.st}><_Bo className="text-emerald-500" aria-hidden="true" /> SAVED_INTELLIGENCE</h2>
          {_sA.length === 0 ? (
            <div className={_x.e}>
              <_Hx size={120} className="mb-8 opacity-10" strokeWidth={1} aria-hidden="true" />
              <h2 className="text-xl font-black uppercase tracking-tighter mb-4">NO_ENTRIES_FOUND</h2>
              <_L to="/" aria-label="Browse Feed" className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-widest transition-all">BROWSE_FEED</_L>
            </div>
          ) : (
            <div className={_x.g}>
              <_AP mode="popLayout">
                {_sA.map((a) => {
                  const _imgSrc = a.featured_image;

                  return (
                    <_m.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={a.id} className={_x.cd}>
                      <div className="aspect-[16/9] overflow-hidden relative bg-neutral-200 dark:bg-neutral-800">
                        {_imgSrc ? (
                            <img 
                              src={_gOI(_imgSrc, 600)} 
                              alt={a.title} 
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy" 
                              decoding="async"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.dataset.error === "true") return;  
                                target.dataset.error = "true";
                                target.src = "";  
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }} 
                            />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-[#151515]">
                              <_Hx size={48} className="text-neutral-300 dark:text-neutral-700 animate-pulse" strokeWidth={1} aria-hidden="true" />
                          </div>
                        )}
                        
                        <div className={`hidden absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-[#151515] ${!_imgSrc ? '!flex' : ''}`}>
                            <_Im size={40} className="text-neutral-300 dark:text-neutral-700 opacity-50" aria-hidden="true" />
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3 block">{a.category || "INTEL"}</span>
                        <h3 className="text-xl font-black uppercase leading-tight tracking-tight mb-4 group-hover:text-emerald-500 transition-colors line-clamp-2">{a.title}</h3>
                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800 relative">
                          <_L to={`/article/${a.slug}`} aria-label={`Open entry: ${a.title}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all"><_Bo size={14} aria-hidden="true" /> OPEN_ENTRY</_L>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); _rI(a.slug); }} 
                            aria-label={`Remove ${a.title} from collection`}
                            className={`
                              absolute right-0 top-1/2 -translate-y-1/2 md:relative md:top-0 md:translate-y-0
                              flex items-center justify-center p-2.5 rounded-lg border transition-all duration-300
                              opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100
                              ${_iD 
                                ? 'bg-white text-black border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]' 
                                : 'bg-black text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]'
                              }
                              hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-90
                            `}
                          >
                            <_Bm size={16} fill="currentColor" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </_m.div>
                  );
                })}
              </_AP>
            </div>
          )}
        </section>
      </div>
      {/* Background sync-marker for constant flow */}
      <div className="hidden" aria-hidden="true" data-brawnly-sync="continuous" />
    </main>
  );
}