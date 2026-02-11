import React, { useState as _s, useEffect as _e } from "react";
import { Play as _Pl, Video as _Vd, WifiOff as _Wo, AlertTriangle as _At, Zap as _Zp } from "lucide-react";
import { motion as _m } from "framer-motion";
import { supabase } from "@/lib/supabase"; 
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';

// Import kedua Pipeline WASM
import { wasmTranscodeImage as _wTI } from "@/lib/wasmImagePipeline";
import { wasmVideoToThumbnail as _wVT } from "@/lib/wasmVideoPipeline";

// Tipe data Minified (Slashing JSON keys untuk hemat kuota storage)
type MinifiedVideo = {
  i: string;  // id
  t: string;  // title
  y: string;  // youtube ID
  th: string; // slashed thumbnail (WebP Base64)
};

export default function Videos() {
  const { isDark: _iD } = _uTP();
  const [_vids, _sVids] = _s<MinifiedVideo[]>([]);
  const [_isL, _sIsL] = _s(true);
  const [_isOff, _sOff] = _s(!navigator.onLine);
  const [_activeV, _sActiveV] = _s<string | null>(null);

  // Helper: Ambil ID YouTube pendek
  const _gYI = (u: string) => {
    const _reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const _m = u.match(_reg);
    return (_m && _m[2].length === 11) ? _m[2] : "";
  };

  _e(() => {
    const _hO = () => _sOff(false);
    const _hF = () => _sOff(true);
    window.addEventListener('online', _hO);
    window.addEventListener('offline', _hF);
    return () => {
      window.removeEventListener('online', _hO);
      window.removeEventListener('offline', _hF);
    };
  }, []);

  // LOGIC: Ambil data & Slashed Visual via WASM
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

      if (error) throw error;

      if (data) {
        const _compact = await Promise.all(data.slice(0, 15).map(async (v) => {
          const _yId = _gYI(v.url);
          let _thumbUrl = v.thumbnail_url || `https://img.youtube.com/vi/${_yId}/mqdefault.jpg`;

          // OPTIMASI WASM: Ubah thumbnail ke WebP Slashed (1/4 quality) 
          // untuk disimpan di cache offline agar viewer tidak 'mati lampu' visualnya.
          try {
            const _res = await fetch(_thumbUrl);
            const _blob = await _res.blob();
            const _optimizedBlob = await _wTI(_blob, "webp", 0.25); // Slashed ke 25%
            
            // Konversi ke Base64 agar bisa masuk LocalStorage
            const _reader = new FileReader();
            _thumbUrl = await new Promise((res) => {
              _reader.onloadend = () => res(_reader.result as string);
              _reader.readAsDataURL(_optimizedBlob);
            });
          } catch (e) {
            console.warn("WASM Skip: Using Direct URL");
          }

          return {
            i: v.id,
            t: v.title,
            y: _yId,
            th: _thumbUrl
          };
        }));

        _sVids(_compact);
        localStorage.setItem("brawnly_vids_mini", JSON.stringify(_compact));
      }
    } catch (err) {
      console.error("Transmission Interrupted:", err);
    } finally {
      _sIsL(false);
    }
  };

  _e(() => {
    fetchVideos();
    const channel = supabase.channel('v_sync').on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => fetchVideos()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const _x = {
    r: "min-h-screen bg-white dark:bg-[#050505] pt-24 md:pt-32 pb-20 text-black dark:text-white transition-all duration-500",
    c: "max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10",
  };

  return (
    <main className={_x.r}>
      <div className={_x.c}>
        
        {/* HEADER RESPONSIVE */}
        <div className="mb-12 space-y-4">
          <h1 className="text-[44px] sm:text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85] break-words">
            Transmission
          </h1>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${_isOff ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`} />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
              {_isOff ? "Mode Offline: Local Cache Active" : "Uplink Secure: WASM Pipeline Online"}
            </span>
          </div>
        </div>

        {/* GRID VIDEO (FB STYLE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {_vids.map((v) => (
            <_m.div
              key={v.i}
              whileHover={{ scale: 1.02 }}
              className="group relative flex flex-col bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 rounded-3xl overflow-hidden"
            >
              <div className="aspect-video relative bg-neutral-900">
                {_activeV === v.i && !_isOff ? (
                  <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${v.y}?autoplay=1&modestbranding=1`} allowFullScreen />
                ) : (
                  <div className="absolute inset-0 cursor-pointer" onClick={() => _isOff ? null : _sActiveV(v.i)}>
                    <img 
                      src={v.th} 
                      alt={v.t}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`p-4 rounded-full backdrop-blur-3xl border border-white/10 ${_isOff ? 'bg-white/5' : 'bg-emerald-500/80 shadow-2xl'}`}>
                        {_isOff ? <_Wo size={24} className="opacity-20" /> : <_Pl size={24} className="fill-white" />}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-tight italic line-clamp-2 mb-8">
                  {v.t}
                </h3>
                
                <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6">
                  <div className="flex items-center gap-2">
                    <_Zp size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Slashed Visual</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-40 italic">1/4 MB Plan</span>
                </div>
              </div>
            </_m.div>
          ))}
        </div>

        {/* NOTIF MATI LAMPU */}
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