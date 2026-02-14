import React, { useState as _s, useEffect as _e } from "react";
import { Play as _Pl, Video as _Vd, WifiOff as _Wo, Zap as _Zp } from "lucide-react";
import { motion as _m } from "framer-motion";
import { supabase } from "@/lib/supabase"; 
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';

import { wasmTranscodeImage as _wTI } from "@/lib/wasmImagePipeline";
import { wasmVideoToThumbnail as _wVT } from "@/lib/wasmVideoPipeline";
import { registerSW } from "@/pwa/swRegister";
import { setCookieHash, mirrorQuery, warmupEnterpriseStorage } from "@/lib/enterpriseStorage";
import { detectBestFormat } from "@/lib/imageFormat";
import { saveAssetToShared, getAssetFromShared } from "@/lib/sharedStorage";

type MinifiedVideo = {
  i: string;  
  t: string;  
  u: string;  
  ty: 'yt' | 'other'; 
  th: string; 
  v: boolean; 
  r: string;
};

export default function Videos() {
  const { isDark: _iD } = _uTP();
  const [_vids, _sVids] = _s<MinifiedVideo[]>([]);
  const [_isL, _sIsL] = _s(true);
  const [_isOff, _sOff] = _s(!navigator.onLine);
  const [_activeV, _sActiveV] = _s<string | null>(null);

  const _parseVid = (url: string) => {
    if (!url) return { u: "", ty: 'other' as const, isShort: true, ratio: "aspect-[9/16]" };
    
    let ratio = "aspect-[9/16]";
    let isShort = true;

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const w = parseInt(urlObj.searchParams.get('width') || '0');
      const h = parseInt(urlObj.searchParams.get('height') || '0');
      
      if (w > 0 && h > 0) {
        if (w === h) {
          ratio = "aspect-square";
        } else if (w > h) {
          ratio = "aspect-video";
          isShort = false;
        } else {
          ratio = `aspect-[${w}/${h}]`;
        }
      }
    } catch (e) { }

    const _reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|\/shorts\/)([^#&?]*).*/;
    const _m = url.match(_reg);
    
    if (_m && _m[2].length === 11) {
      const videoId = _m[2];
      const isYtShort = url.toLowerCase().includes('/shorts/');
      return { 
        u: `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`, 
        ty: 'yt' as const, 
        isShort: isYtShort || isShort,
        ratio: isYtShort ? "aspect-[9/16]" : ratio
      };
    }

    return { u: url, ty: 'other' as const, isShort, ratio };
  };

  _e(() => {
    registerSW();
    warmupEnterpriseStorage();
    detectBestFormat();
    const _hO = () => _sOff(false);
    const _hF = () => _sOff(true);
    window.addEventListener('online', _hO);
    window.addEventListener('offline', _hF);
    return () => {
      window.removeEventListener('online', _hO);
      window.removeEventListener('offline', _hF);
    };
  }, []);

  const fetchVideos = async () => {
    try {
      if (!navigator.onLine) {
        const _cache = localStorage.getItem("brawnly_vids_mini");
        if (_cache) _sVids(JSON.parse(_cache));
        _sIsL(false);
        return;
      }

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const _compact = await Promise.all(data.slice(0, 15).map(async (v) => {
          let { u: _parsedU, ty: _vType, isShort, ratio: _vRatio } = _parseVid(v.url);
          let _thumbUrl = v.thumbnail_url;
          
          if (!_thumbUrl && _vType === 'yt') {
            const ytId = _parsedU.split('/').pop()?.split('?')[0];
            _thumbUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
          }

          try {
            const _cachedAsset = await getAssetFromShared(`vid_thumb_${v.id}`);
            if (_cachedAsset) {
              _thumbUrl = URL.createObjectURL(_cachedAsset);
            } else if (navigator.onLine) {
              let _finalBlob: Blob | null = null;

              if (_thumbUrl) {
                const _res = await fetch(_thumbUrl);
                const _blob = await _res.blob();
                _finalBlob = await _wTI(_blob, "webp", 0.25);
              } else if (_vType === 'other' && (v.url.includes('.mp4') || v.url.includes('cloudinary'))) {
                // If no thumbnail but is a raw video link, use wasmVideoPipeline to extract frame
                const _vRes = await fetch(v.url);
                const _vBlob = await _vRes.blob();
                _finalBlob = await _wVT(_vBlob, 0.25);
              }

              if (_finalBlob) {
                await saveAssetToShared(`vid_thumb_${v.id}`, _finalBlob);
                const _reader = new FileReader();
                _thumbUrl = await new Promise((res) => {
                  _reader.onloadend = () => res(_reader.result as string);
                  _reader.readAsDataURL(_finalBlob!);
                });
              }
            }
          } catch (e) { }

          return {
            i: v.id,
            t: v.title,
            u: _parsedU,
            ty: _vType,
            th: _thumbUrl || "",
            v: isShort,
            r: _vRatio
          };
        }));

        _sVids(_compact);
        localStorage.setItem("brawnly_vids_mini", JSON.stringify(_compact));
      }
    } catch (err) { } finally {
      _sIsL(false);
    }
  };

  _e(() => {
    fetchVideos();
    const channel = supabase.channel('v_sync').on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => fetchVideos()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const _handleVideoPlay = (vId: string, vTitle: string) => {
    setCookieHash(vId);
    mirrorQuery({ type: "VIDEO_PLAY", id: vId, title: vTitle, ts: Date.now() });
    _sActiveV(vId);
  };

  const _x = {
    r: "min-h-screen bg-white dark:bg-[#050505] pt-24 md:pt-32 pb-20 text-black dark:text-white transition-all duration-500",
    c: "max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10",
  };

  return (
    <main className={_x.r}>
      <div className={_x.c}>
        <div className="mb-12 space-y-4">
          <h1 className="text-[44px] sm:text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85] break-words">
            Transmission
          </h1>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${_isOff ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`} />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
              {_isOff ? "Mode Offline: Local Cache Active" : "Uplink Secure: Universal Pipeline Online"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-start">
          {_vids.map((v) => (
            <_m.div
              key={v.i}
              whileHover={{ scale: 1.02 }}
              className="group relative flex flex-col bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 rounded-3xl overflow-hidden"
            >
              <div className={`relative bg-neutral-900 w-full transition-all duration-500 ${v.r}`}>
                {_activeV === v.i && !_isOff ? (
                  <iframe 
                    className="absolute inset-0 w-full h-full border-0" 
                    src={v.u} 
                    title={v.t || "Video player"}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    scrolling="no" 
                  />
                ) : (
                  <div className="absolute inset-0 cursor-pointer overflow-hidden" onClick={() => _isOff ? null : _handleVideoPlay(v.i, v.t)}>
                    {v.th ? (
                      <img 
                        src={v.th} 
                        alt={v.t}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-30">
                        <_Vd size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-all">
                      <div className={`p-4 rounded-full backdrop-blur-3xl border border-white/10 transition-transform duration-300 group-hover:scale-110 ${_isOff ? 'bg-white/5' : 'bg-emerald-500/80 shadow-2xl'}`}>
                        {_isOff ? <_Wo size={24} className="opacity-20" /> : <_Pl size={24} className="fill-white" />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-neutral-100 dark:bg-neutral-900/30">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-tight italic line-clamp-2 mb-8">
                  {v.t}
                </h3>
                <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6">
                  <div className="flex items-center gap-2">
                    <_Zp size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      {v.ty === 'yt' ? "YouTube Protocol" : "Universal Feed"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono opacity-40 italic">
                    {v.r.replace('aspect-', '').replace('[', '').replace(']', '')}
                  </span>
                </div>
              </div>
            </_m.div>
          ))}
        </div>
        
        {_isOff && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto bg-neutral-900 text-white px-8 py-4 rounded-2xl border border-white/10 shadow-2xl z-50 flex items-center gap-4 justify-center">
            <_Wo size={18} className="text-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Koneksi Terputus - Buffer Lokal Aktif</span>
          </div>
        )}
      </div>
    </main>
  );
}