import React, { useState as _s, useEffect as _e } from "react";
import { useNavigate as _uN } from "react-router-dom";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import { Camera as _Cm, Save as _Sv, LogOut as _Lo, Loader2 as _L2, ShieldCheck as _Sc, WifiOff as _Wo, HardDrive as _Hd } from "lucide-react";
import { toast } from "sonner";

// Core Libs
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { getOptimizedImage } from "@/lib/utils";

// Enterprise V3 Modules
import { wasmTranscodeImage as _wTI } from "@/lib/wasmImagePipeline";
import { detectBestFormat as _dBF } from "@/lib/imageFormat";
import { mirrorQuery, setCookieHash } from "@/lib/enterpriseStorage";
import { enqueue as _enQ } from "@/lib/idbQueue";

// Constants
const PROFILE_SNAP_KEY = "brawnly_profile_snap_v3";
const OFFLINE_AVA_KEY = "brawnly_offline_avatar_blob";

export default function Profile() {
  const { user: _u, signOut: _sO, loading: _authL } = useAuth();
  const _nav = _uN();

  // States
  const [_loading, _sLoad] = _s(true);
  const [_uploading, _sUp] = _s(false);
  const [_name, _sName] = _s("");
  const [_avaUrl, _sAvaUrl] = _s<string | null>(null); 
  const [_fileBlob, _sFileBlob] = _s<Blob | null>(null); 
  const [_isOffline, _sOffline] = _s(!navigator.onLine);

  /* ============================================================
      🛠️ HELPER: BLOB TO BASE64
     ============================================================ */
  const _blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /* ============================================================
      🔄 INIT: LOAD SNAPSHOT & FETCH FRESH DATA
     ============================================================ */
  _e(() => {
    // 🔥 RACE CONDITION FIX: Jangan redirect jika status auth masih memuat (loading)
    if (_authL) return;

    // Jika loading selesai dan benar-benar tidak ada user, baru pindah ke signin
    if (!_u) { 
      _nav("/signin"); 
      return; 
    }

    const _init = async () => {
      // 1. Load SNAPSHOT (Instant UI - Offline First)
      try {
        const _snap = localStorage.getItem(PROFILE_SNAP_KEY);
        const _offlineAva = localStorage.getItem(OFFLINE_AVA_KEY);
        
        if (_snap) {
          const _p = JSON.parse(_snap);
          _sName(_p.username || "");
          if (_offlineAva) _sAvaUrl(_offlineAva);
          else if (_p.avatar_url) _sAvaUrl(_p.avatar_url);
        }
      } catch (e) {
        console.warn("Snapshot hydration bypassed.");
      }

      _sLoad(false); 

      // 2. Network Fetch (Sinkronisasi Database Publik)
      if (navigator.onLine) {
        try {
          const { data: _d } = await supabase
            .from("user_profiles")
            .select("username, avatar_url")
            .eq("id", _u.id)
            .maybeSingle();

          if (_d) {
            _sName(_d.username || "");
            // Update Avatar URL hanya jika user tidak sedang memilih file baru
            if (!_fileBlob && _d.avatar_url) {
               _sAvaUrl(_d.avatar_url);
            }
            localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify(_d));
            mirrorQuery({ type: "PROFILE_FETCH", id: _u.id, ts: Date.now() });
          }
        } catch (e) {
          console.error("Cloud sync failed.");
        }
      }
      
      await setCookieHash(_u.id);
    };

    _init();

    const _setOn = () => _sOffline(false);
    const _setOff = () => _sOffline(true);
    window.addEventListener('online', _setOn);
    window.addEventListener('offline', _setOff);
    return () => {
      window.removeEventListener('online', _setOn);
      window.removeEventListener('offline', _setOff);
    };
  }, [_u, _authL, _nav]);

  /* ============================================================
      📸 PIPELINE: WASM TRANSCODE & PREVIEW
     ============================================================ */
  const _handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const _rawFile = e.target.files[0];
    _sUp(true);

    try {
      toast.info("WASM Transcoding initialized...");
      const _fmt = await _dBF(); 
      const _optimizedBlob = await _wTI(_rawFile, _fmt, 0.75);
      const _preview = URL.createObjectURL(_optimizedBlob);
      
      _sAvaUrl(_preview);
      _sFileBlob(_optimizedBlob);

      // Simpan preview base64 untuk offline instant load
      const _b64 = await _blobToBase64(_optimizedBlob);
      localStorage.setItem(OFFLINE_AVA_KEY, _b64);

      toast.success(`Image Optimized: ${(_optimizedBlob.size / 1024).toFixed(1)}KB (${_fmt.toUpperCase()})`);
    } catch (error) {
      toast.error("WASM Pipeline error, using original.");
      _sFileBlob(_rawFile);
    } finally {
      _sUp(false);
    }
  };

  /* ============================================================
      💾 SAVE LOGIC: HYBRID SYNC (IDB QUEUE + SUPABASE)
     ============================================================ */
  const _saveProfile = async () => {
    if (!_u) return;
    _sUp(true);

    const _payload = {
      id: _u.id,
      username: _name,
      updated_at: new Date().toISOString()
    };

    try {
      if (!navigator.onLine) {
        await _enQ({
          type: "PROFILE_UPDATE",
          payload: { ..._payload, avatarBlob: _fileBlob }
        });

        localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify({ 
          username: _name, 
          avatar_url: _avaUrl 
        }));

        toast.warning("Offline: Data disimpan ke antrean lokal.");
        _sUp(false);
        return;
      }

      let _finalAvatarUrl = null;

      // 1. Upload Avatar ke Storage Publik
      if (_fileBlob) {
        const _ext = _fileBlob.type.split("/")[1] || "webp";
        const _path = `avatars/${_u.id}-${Date.now()}.${_ext}`;

        const { error: _upErr } = await supabase.storage
          .from("brawnly-assets")
          .upload(_path, _fileBlob, { upsert: true });

        if (_upErr) throw _upErr;

        const { data: _pub } = supabase.storage
          .from("brawnly-assets")
          .getPublicUrl(_path);

        _finalAvatarUrl = _pub.publicUrl;
      }

      // 2. Update Metadata Tabel Profil
      const _dbPayload = {
        username: _name,
        ...(_finalAvatarUrl && { avatar_url: _finalAvatarUrl })
      };

      const { error: _dbErr } = await supabase
        .from("user_profiles")
        .upsert({ id: _u.id, ..._dbPayload });

      if (_dbErr) throw _dbErr;

      // 3. Update Auth Metadata agar sesi konsisten
      await supabase.auth.updateUser({
        data: { full_name: _name, ...(_finalAvatarUrl && { avatar_url: _finalAvatarUrl }) }
      });

      localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify(_dbPayload));
      toast.success("Identity Synced to Cloud");

    } catch (err: any) {
      toast.error("Sync Failed: " + (err.message || "Unknown error"));
    } finally {
      _sUp(false);
    }
  };

  if (_authL || _loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse text-black dark:text-white">Initializing Node...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-20 px-6 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        
        <header className="mb-16 border-l-[12px] border-black dark:border-white pl-8 relative text-black dark:text-white">
          <h1 className="text-[48px] md:text-[64px] font-black uppercase tracking-tighter leading-none italic">
            Node_Identity
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 flex items-center gap-2">
              <_Sc size={12} className="text-emerald-500" /> Brawnly_Cloud_V3 // ID: {_u?.id.slice(0,8)}
            </p>
            {_isOffline && (
              <span className="flex items-center gap-2 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500 px-2 py-1 rounded-full animate-pulse">
                <_Wo size={10} /> OFFLINE
              </span>
            )}
          </div>
        </header>

        <section className="space-y-12">
          
          {/* AVATAR WASM VIEWPORT */}
          <_m.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-10 bg-neutral-50 dark:bg-[#111] p-10 rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800"
          >
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-black dark:border-white overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative shadow-2xl">
                {_avaUrl ? (
                  <img 
                    src={_avaUrl.startsWith('blob:') || _avaUrl.startsWith('data:') ? _avaUrl : getOptimizedImage(_avaUrl, 300)} 
                    alt="ava" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20 text-black dark:text-white"><_Hd size={48} /></div>
                )}
                {_avaUrl?.startsWith('data:image') && (
                  <div className="absolute bottom-0 inset-x-0 bg-yellow-500/80 h-4 flex justify-center items-center">
                    <span className="text-[6px] font-black uppercase text-black">Offline Cache</span>
                  </div>
                )}
              </div>
              <label className={`absolute bottom-2 right-2 bg-black dark:bg-white text-white dark:text-black p-3 rounded-full cursor-pointer hover:scale-110 transition-all shadow-xl ${_uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {_uploading ? <_L2 size={20} className="animate-spin" /> : <_Cm size={20} />}
                <input type="file" className="hidden" accept="image/*" onChange={_handleFileChange} disabled={_uploading} />
              </label>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 text-black dark:text-white">Display_Name</label>
                <input 
                  type="text" 
                  value={_name} 
                  onChange={(e) => _sName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black dark:border-white py-2 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-colors text-black dark:text-white placeholder-neutral-300"
                  placeholder="IDENTIFIER_NAME"
                />
              </div>
              <div className="p-4 bg-white dark:bg-black rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-mono opacity-60 flex items-center gap-2 text-black dark:text-white">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  {_u?.email} 
                </p>
              </div>
            </div>
          </_m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={_saveProfile}
              disabled={_uploading}
              className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 hover:invert transition-all active:scale-95 disabled:opacity-30 disabled:scale-100 shadow-xl"
            >
              {_uploading ? <_L2 className="animate-spin" /> : (_isOffline ? <_Hd /> : <_Sv />)}
              {_isOffline ? "Queue_Offline_Sync" : "Sync_Identity"}
            </button>
            
            <button 
              onClick={() => _sO()}
              className="border-4 border-black dark:border-white p-8 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all active:scale-95 text-black dark:text-white"
            >
              <_Lo /> Kill_Session
            </button>
          </div>
        </section>

        <footer className="mt-20 pt-10 border-t border-neutral-100 dark:border-neutral-900 text-center">
          <p className="text-[9px] font-black opacity-20 uppercase tracking-[0.5em] text-black dark:text-white">
            Brawnly_V3 // Neural_Link_Confirmed // {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}