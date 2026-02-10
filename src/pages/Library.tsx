import React, { useState as _s, useEffect as _e } from "react";
import { Link as _L } from "react-router-dom";
import { Bookmark as _Bm, BookOpen as _Bo, ArrowLeft as _Al, Hexagon as _Hx, Music as _Ms, Play as _Pl, Image as _Im, WifiOff as _Wo, RefreshCw as _Rc } from "lucide-react";
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
    if (_c) { _ssA(JSON.parse(_c)); _slL(false); }
    if (_cM) { _ssL(JSON.parse(_cM)); }
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
      if (_curr !== localStorage.getItem("brawnly_lib_cache")) {
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
        if (!localStorage.getItem("brawnly_lib_cache")) { _slL(false); }
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

  const _x = {
    r: "min-h-screen bg-white dark:bg-[#0a0a0a] pt-10 pb-24 text-black dark:text-white transition-colors duration-500",
    c: "max-w-[1320px] mx-auto px-5 md:px-10",
    g: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3",
    cd: "group relative bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl",
    st: "text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2",
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <_L to="/" aria-label="Back to feed" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all">
              <_Al size={12} aria-hidden="true" /> BACK_TO_FEED
            </_L>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">LIBRARY</h1>
            <div className="flex items-center gap-4 mt-2 h-6">
              {_isOff ? (
                <span className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-widest animate-pulse">
                  <_Wo size={10} aria-hidden="true" /> OFFLINE_STATION
                </span>
              ) : _iR ? (
                <span className="flex items-center gap-2 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
                  <_Rc size={10} className="animate-spin" aria-hidden="true" /> RECALIBRATING...
                </span>
              ) : null}
            </div>
          </div>

          <div className={`flex items-center gap-3 ${ _iD ? 'bg-white text-black' : 'bg-black text-white' } px-5 py-3 rounded-lg shadow-lg transition-all`}>
            <_Bm size={18} fill="currentColor" aria-hidden="true" />
            <span className="text-xl font-black italic">{_sA.length + _sL.length}</span>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">ARCHIVED</span>
          </div>
        </div>

        {/* MUSIC SECTION */}
        <section className="mb-16">
          <h2 className={_x.st}><_Ms size={18} className="text-emerald-500" aria-hidden="true" /> BEATS_STATION</h2>
          <div className={_x.g}>
            {_sL.map((s) => (
              <_m.div
                whileHover={{ scale: 0.98 }}
                key={s.id}
                onClick={() => _triggerGlobalPlay(s.url)}
                role="button"
                aria-label={`Play ${s.title}`}
                className="relative aspect-square rounded-lg overflow-hidden group bg-neutral-100 dark:bg-neutral-800 cursor-pointer border border-neutral-200 dark:border-neutral-800 transition-all"
              >
                <img 
                  src={s.thumbnail_url} 
                  alt={`Thumbnail for ${s.title}`} 
                  crossOrigin="anonymous" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:grayscale" 
                  loading="lazy" 
                />
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <_Pl size={24} className="text-white fill-white" aria-hidden="true" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/80 backdrop-blur-md">
                  <p className="text-[7px] font-black uppercase truncate text-white tracking-widest">{s.title}</p>
                </div>
              </_m.div>
            ))}
          </div>
        </section>

        {/* ARTICLES SECTION */}
        <section>
          <h2 className={_x.st}><_Bo size={18} className="text-emerald-500" aria-hidden="true" /> SAVED_ENTRIES</h2>
          {_sA.length === 0 ? (
            <div className={_x.e}>
              <_Hx size={80} className="mb-6 opacity-5" strokeWidth={1} aria-hidden="true" />
              <h2 className="text-sm font-black uppercase tracking-widest mb-4 opacity-40">VAULT_EMPTY</h2>
              <_L to="/" aria-label="Browse Feed" className="px-6 py-2 bg-emerald-500 text-black font-black uppercase text-[8px] tracking-widest rounded-full">REPLENISH</_L>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <_AP mode="popLayout">
                {_sA.map((a) => {
                  const _imgSrc = a.featured_image;
                  return (
                    <_m.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={a.id} className={_x.cd}>
                      <div className="aspect-[16/9] overflow-hidden relative bg-neutral-200 dark:bg-neutral-800">
                        {_imgSrc ? (
                          <>
                            <img 
                              src={_gOI(_imgSrc, 500)} 
                              alt={`Imagery for ${a.title}`} 
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                              loading="lazy" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }} 
                            />
                            {/* FALLBACK ICON IF IMAGE FAILS */}
                            <div className="hidden absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-[#151515]">
                              <_Im size={32} className="text-neutral-300 dark:text-neutral-700 opacity-50" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-[#151515]">
                            <_Hx size={32} className="opacity-10" aria-hidden="true" />
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-2">{a.category || "CORE"}</span>
                        <h3 className="text-sm font-black uppercase tracking-tight mb-4 line-clamp-2 leading-snug">{a.title}</h3>
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <_L to={`/article/${a.slug}`} aria-label={`Open article: ${a.title}`} className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-500 transition-colors">
                            <_Bo size={12} aria-hidden="true" /> EXPAND
                          </_L>
                          <button 
                            onClick={() => _rI(a.slug)} 
                            aria-label={`Remove ${a.title} from library`}
                            className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <_Bm size={14} fill="none" aria-hidden="true" />
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
    </main>
  );
}