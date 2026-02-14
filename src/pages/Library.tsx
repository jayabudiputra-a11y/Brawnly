import React, { useState as _s, useEffect as _e, useMemo as _uM } from "react";
import { Link as _L } from "react-router-dom";
import { Bookmark as _Bm, BookOpen as _Bo, ArrowLeft as _Al, Hexagon as _Hx, Music as _Ms, Image as _Im, WifiOff as _Wo, RefreshCw as _Rc, HardDrive as _Hd } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";

import { useArticles as _uA } from "@/hooks/useArticles";
import { songsApi as _sa, type Song as _S } from "@/lib/api"; 
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';

import { detectBestFormat as _dBF } from "@/lib/imageFormat";
import { wasmTranscodeImage as _wTI } from "@/lib/wasmImagePipeline";
import { setCookieHash as _sCH, mirrorQuery as _mQ, warmupEnterpriseStorage as _wES } from "@/lib/enterpriseStorage";
import { getAssetFromShared as _gAS, saveAssetToShared as _sAS } from "@/lib/sharedStorage";
import { openDB as _oDB } from "@/lib/idbQueue";

export default function Library() {
  const { isDark: _iD } = _uTP();
  const { data: _aD, isLoading: _aL, isRefetching: _iR } = _uA(); 
  
  const [_sA, _ssA] = _s<any[]>([]); 
  const [_sL, _ssL] = _s<_S[]>([]);    
  const [_lL, _slL] = _s(true);       
  const [_isOff, _sOff] = _s(!navigator.onLine);
  const [_blobMap, _setBlobMap] = _s<Record<string, string>>({});
  const [_syncState, _setSyncState] = _s<"idle" | "optimizing" | "shared">("idle");

  _e(() => {
    _wES();
    _sCH("library_node_" + Date.now());
    _mQ({ type: "LIBRARY_ACCESS", ts: Date.now() });

    const _c = localStorage.getItem("brawnly_lib_cache");
    const _cM = localStorage.getItem("brawnly_music_cache");
    
    if (_c) {
      _ssA(JSON.parse(_c));
      _slL(false); 
    }
    if (_cM) _ssL(JSON.parse(_cM));

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
    let _active = true;
    
    const _initSonicLib = async () => {
      try {
        await _oDB();
        const _d = await _sa.getAll();
        if (_active) _ssL(_d);
        localStorage.setItem("brawnly_music_cache", JSON.stringify(_d));

        _setSyncState("optimizing");
        const _format = await _dBF();
        
        for (const _song of _d) {
          if (!_active) break;
          
          const _cachedBlob = await _gAS(_song.id.toString());
          if (_cachedBlob) {
            const _url = URL.createObjectURL(_cachedBlob);
            _setBlobMap(p => ({ ...p, [_song.id]: _url }));
          } else if (navigator.onLine) {
            try {
              const res = await fetch(_song.thumbnail_url);
              const b = await res.blob();
              const opt = await _wTI(b, _format, 0.5);
              await _sAS(_song.id.toString(), opt);
              const _url = URL.createObjectURL(opt);
              _setBlobMap(p => ({ ...p, [_song.id]: _url }));
            } catch (e) { }
          }
        }
        _setSyncState("shared");
      } catch (e) {} finally {
        if (_active) _slL(false);
      }
    };

    _initSonicLib();
    return () => { _active = false; };
  }, []);

  const _rI = (s: string) => {
    localStorage.removeItem(`brawnly_saved_${s}`);
    const _nA = _sA.filter((a) => a.slug !== s);
    _ssA(_nA);
    localStorage.setItem("brawnly_lib_cache", JSON.stringify(_nA));
  };

  const _gYI = (u: string) => {
    const r = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const m = u.match(r);
    return (m && m[2].length === 11) ? m[2] : null;
  };

  const _triggerPlay = (url: string) => {
    const id = _gYI(url);
    if (id) {
      window.dispatchEvent(new CustomEvent("BRAWNLY_MUSIC", { 
        detail: { type: "PLAY_SONG", id: id } 
      }));
    }
  };

  const _playRandom = () => {
    if (_sL.length > 0) {
      const idx = Math.floor(Math.random() * _sL.length);
      _triggerPlay(_sL[idx].url);
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
            <_L to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all">
              <_Al size={14} /> BACK_TO_FEED
            </_L>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">LIBRARY</h1>
            
            <div className="flex items-center gap-4 mt-2 h-6">
              {_isOff ? (
                <span className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full">
                  <_Wo size={12} /> OFFLINE MODE
                </span>
              ) : _syncState === "optimizing" ? (
                <span className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                  <_Rc size={12} className="animate-spin" /> WASM_OPTIMIZING...
                </span>
              ) : _syncState === "shared" ? (
                <span className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.3em]">SHARED_STORAGE_SYNCED</span>
              ) : null}
            </div>
          </div>

          <div className={`flex items-center gap-4 ${ _iD ? 'bg-white text-black' : 'bg-black text-white' } px-6 py-4 rounded-xl shadow-xl border border-neutral-800`}>
            <_Bm size={20} fill="currentColor" />
            <span className="text-2xl font-black italic">{_sA.length + _sL.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">NODES_MAPPED</span>
          </div>
        </div>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-8 border-b-2 border-neutral-100 dark:border-neutral-900 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <_Ms className="text-emerald-500" /> SONIC_VAULT
            </h2>
            <button onClick={_playRandom} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-black dark:border-white hover:bg-emerald-500 hover:text-black transition-all">
              SHUFFLE_NODES
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {_sL.map((s) => (
              <_m.div
                whileHover={{ y: -5 }}
                key={s.id}
                onClick={() => _triggerPlay(s.url)}
                className="relative aspect-square rounded-xl overflow-hidden group bg-neutral-100 dark:bg-neutral-800 cursor-pointer border border-transparent hover:border-emerald-500"
              >
                <img 
                  src={_blobMap[s.id] || s.thumbnail_url} 
                  alt={s.title} 
                  className={`w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 ${!_blobMap[s.id] ? 'blur-sm' : 'blur-0'}`} 
                />
                
                {_blobMap[s.id] && (
                  <div className="absolute top-2 right-2 bg-emerald-500 text-black p-1 rounded shadow-lg">
                    <_Hd size={10} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-[9px] font-black uppercase text-white tracking-widest truncate">{s.title}</p>
                </div>
              </_m.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className={_x.st}><_Bo className="text-emerald-500" /> SAVED_ENTRIES</h2>
          {_sA.length === 0 ? (
            <div className={_x.e}>
              <_Hx size={120} className="mb-8 opacity-10" strokeWidth={1} />
              <h2 className="text-xl font-black uppercase tracking-tighter mb-4">VAULT_EMPTY</h2>
              {/* FIX: Link direct ke #feed-section */}
              <_L to="/#feed-section" className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-widest">MAP_NEW_ENTRIES</_L>
            </div>
          ) : (
            <div className={_x.g}>
              <_AP mode="popLayout">
                {_sA.map((a) => (
                  <_m.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={a.id || a.slug} className={_x.cd}>
                    <div className="aspect-[16/9] overflow-hidden relative bg-neutral-200 dark:bg-neutral-800">
                      {a.featured_image ? (
                        <img 
                          src={_gOI(a.featured_image, 600)} 
                          alt={a.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                          loading="lazy" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <_Im size={40} className="text-neutral-300 dark:text-neutral-700" />
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3">{a.category || "SELECTION"}</span>
                      <h3 className="text-xl font-black uppercase leading-tight tracking-tight mb-4 group-hover:text-emerald-500 transition-colors line-clamp-2">{a.title}</h3>
                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
                        <_L to={`/article/${a.slug}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all italic"><_Bo size={14} /> READ_FULL</_L>
                        <button 
                          onClick={() => _rI(a.slug)} 
                          className={`p-2.5 rounded-lg border transition-all ${_iD ? 'bg-white text-black border-white' : 'bg-black text-white border-black'} hover:bg-red-600 hover:border-red-600 hover:text-white`}
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