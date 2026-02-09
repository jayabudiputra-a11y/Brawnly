import React, { useState as _s, useEffect as _e } from "react";
import { Link as _L } from "react-router-dom";
import { Bookmark as _Bm, BookOpen as _Bo, ArrowLeft as _Al, Hexagon as _Hx, Music as _Ms, Play as _Pl } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import { useArticles as _uA } from "@/hooks/useArticles";
import { songsApi as _sa, type Song as _S } from "@/lib/api";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';

export default function Library() {
  const { isDark: _iD } = _uTP(); // Inisialisasi logika tema
  const { data: _aD, isLoading: _aL } = _uA();
  const [_sA, _ssA] = _s<any[]>([]);
  const [_sL, _ssL] = _s<_S[]>([]);
  const [_lL, _slL] = _s(true);

  _e(() => {
    if (_aD) {
      const _sv = _aD.filter((a: any) => localStorage.getItem(`brawnly_saved_${a.slug}`) === "true");
      _ssA(_sv);
    }
  }, [_aD]);

  _e(() => {
    const _f = async () => {
      try {
        const _d = await _sa.getAll();
        _ssL(_d);
      } catch (_er) {} finally {
        _slL(false);
      }
    };
    _f();
  }, []);

  const _rI = (s: string) => {
    localStorage.removeItem(`brawnly_saved_${s}`);
    _ssA((p) => p.filter((a) => a.slug !== s));
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
    g: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
    cd: "group relative bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300",
    st: "text-2xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3",
    e: "flex flex-col items-center justify-center py-20 text-center"
  };

  if (_aL || _lL) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className={`w-12 h-12 border-4 ${_iD ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin`} />
    </div>
  );

  return (
    <main className={_x.r}>
      <div className={_x.c}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <_L to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all">
              <_Al size={14} /> BACK_TO_FEED
            </_L>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">LIBRARY</h1>
          </div>
          <div className={`flex items-center gap-4 ${ _iD ? 'bg-white text-black' : 'bg-black text-white' } px-6 py-4 rounded-xl shadow-xl border border-neutral-800 transition-colors duration-300`}>
            <_Bm size={20} fill="currentColor" />
            <span className="text-2xl font-black italic">{_sA.length + _sL.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">ASSETS_BOUND</span>
          </div>
        </div>

        {/* --- MUSIC SECTION --- */}
        <section className="mb-20">
          <h2 className={_x.st}><_Ms className="text-emerald-500" /> BRAWNLY_BEATS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {_sL.map((s) => (
              <_m.div
                whileHover={{ y: -5 }}
                key={s.id}
                onClick={() => _triggerGlobalPlay(s.url)}
                className="relative aspect-square rounded-xl overflow-hidden group bg-neutral-100 dark:bg-neutral-800 cursor-pointer border border-transparent hover:border-emerald-500 transition-all"
              >
                <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <_Pl size={32} className="text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-[8px] font-black uppercase truncate text-white">{s.title}</p>
                </div>
              </_m.div>
            ))}
          </div>
        </section>

        {/* --- ARTICLES SECTION --- */}
        <section>
          <h2 className={_x.st}><_Bo className="text-emerald-500" /> SAVED_INTELLIGENCE</h2>
          {_sA.length === 0 ? (
            <div className={_x.e}>
              <_Hx size={120} className="mb-8 opacity-10" strokeWidth={1} />
              <h2 className="text-xl font-black uppercase tracking-tighter mb-4">NO_ENTRIES_FOUND</h2>
              <_L to="/articles" className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-widest transition-all">BROWSE_FEED</_L>
            </div>
          ) : (
            <div className={_x.g}>
              <_AP mode="popLayout">
                {_sA.map((a) => (
                  <_m.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={a.id} className={_x.cd}>
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img src={_gOI(a.thumbnail_url || "", 600)} alt={a.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3 block">{a.category || "INTEL"}</span>
                      <h3 className="text-xl font-black uppercase leading-tight tracking-tight mb-4 group-hover:text-emerald-500 transition-colors line-clamp-2">{a.title}</h3>
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800 relative">
                        <_L to={`/article/${a.slug}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all"><_Bo size={14} /> OPEN_ENTRY</_L>
                        
                        {/* REVISI LOGIKA HOVER & THEME: Ikon Bookmark baru muncul (opacity-100) saat kartu di-hover */}
                        <button 
                          onClick={() => _rI(a.slug)} 
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
                          title="Remove from saved"
                        >
                          <_Bm size={16} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  </_m.div>
                ))}
              </_AP>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}