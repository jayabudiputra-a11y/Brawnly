import React, { useState as _s, useEffect as _e } from "react";
import { motion as _m } from "framer-motion";
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
  const { user: _u, signOut: _sO } = useAuth();

  // States
  const [_loading, _sLoad] = _s(true);
  const [_uploading, _sUp] = _s(false);
  const [_name, _sName] = _s("");
  const [_avaUrl, _sAvaUrl] = _s<string | null>(null); 
  const [_fileBlob, _sFileBlob] = _s<Blob | null>(null); 
  const [_isOffline, _sOffline] = _s(!navigator.onLine);

  const _blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /* ============================================================
      🔄 INIT: OPTIMIZED FOR MOBILE
     ============================================================ */
  _e(() => {
    // BARRIER: Jika tidak ada user, biarkan App.tsx menghandle redirect
    if (!_u) return;

    const _init = async () => {
      try {
        // 1. PRIORITAS UTAMA: Load dari Local Storage (Instan di HP)
        const _snap = localStorage.getItem(PROFILE_SNAP_KEY);
        const _offlineAva = localStorage.getItem(OFFLINE_AVA_KEY);
        
        if (_snap) {
          const _p = JSON.parse(_snap);
          _sName(_p.username || "");
          if (_offlineAva) _sAvaUrl(_offlineAva);
          else if (_p.avatar_url) _sAvaUrl(_p.avatar_url);
        }

        // Matikan loading segera setelah snapshot lokal terbaca
        // Ini mencegah "Loading Terus" meskipun internet lambat
        _sLoad(false); 

        // 2. BACKGROUND SYNC: Ambil data dari Cloud jika Online
        if (navigator.onLine) {
          const { data: _d } = await supabase
            .from("user_profiles")
            .select("username, avatar_url")
            .eq("id", _u.id)
            .maybeSingle();

          if (_d) {
            _sName(_d.username || "");
            if (!_fileBlob && _d.avatar_url) {
               _sAvaUrl(_d.avatar_url);
            }
            localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify(_d));
            mirrorQuery({ type: "PROFILE_FETCH", id: _u.id, ts: Date.now() });
          }
        }
        
        // Handshake dilakukan di background
        setCookieHash(_u.id).catch(() => null);
      } catch (e) {
        console.warn("Hydration error:", e);
        _sLoad(false); 
      }
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
  }, [_u]);

  /* ============================================================
      📸 PIPELINE: WASM TRANSCODE
     ============================================================ */
  const _handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const _rawFile = e.target.files[0];
    _sUp(true);

    try {
      toast.info("Initializing WASM...");
      const _fmt = await _dBF(); 
      const _optimizedBlob = await _wTI(_rawFile, _fmt, 0.75);
      const _preview = URL.createObjectURL(_optimizedBlob);
      
      _sAvaUrl(_preview);
      _sFileBlob(_optimizedBlob);

      const _b64 = await _blobToBase64(_optimizedBlob);
      localStorage.setItem(OFFLINE_AVA_KEY, _b64);
      toast.success("Image Optimized");
    } catch (error) {
      toast.error("WASM bypassed, using original");
      _sFileBlob(_rawFile);
    } finally {
      _sUp(false);
    }
  };

  /* ============================================================
      💾 SAVE LOGIC: HYBRID SYNC
     ============================================================ */
  const _saveProfile = async () => {
    if (!_u) return;
    _sUp(true);

    try {
      if (!navigator.onLine) {
        await _enQ({
          type: "PROFILE_UPDATE",
          payload: { id: _u.id, username: _name, avatarBlob: _fileBlob }
        });
        localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify({ username: _name, avatar_url: _avaUrl }));
        toast.warning("Offline: Queued locally");
        _sUp(false);
        return;
      }

      let _finalAvatarUrl = _avaUrl;

      if (_fileBlob) {
        const _path = `avatars/${_u.id}-${Date.now()}.webp`;
        const { error: _upErr } = await supabase.storage
          .from("brawnly-assets")
          .upload(_path, _fileBlob, { upsert: true });

        if (_upErr) throw _upErr;
        const { data: _pub } = supabase.storage.from("brawnly-assets").getPublicUrl(_path);
        _finalAvatarUrl = _pub.publicUrl;
      }

      const _dbPayload = { id: _u.id, username: _name, avatar_url: _finalAvatarUrl, updated_at: new Date().toISOString() };
      const { error: _dbErr } = await supabase.from("user_profiles").upsert(_dbPayload);
      if (_dbErr) throw _dbErr;

      await supabase.auth.updateUser({ data: { full_name: _name, avatar_url: _finalAvatarUrl } });
      localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify(_dbPayload));
      toast.success("Profile Synced");
    } catch (err: any) {
      toast.error("Sync Failed: " + (err.message || "Unknown error"));
    } finally {
      _sUp(false);
    }
  };

  // Rendering State
  if (_loading && !_name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 animate-pulse">Initializing Node...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 md:pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 border-l-[8px] md:border-l-[12px] border-black dark:border-white pl-6 md:pl-8">
          <h1 className="text-[36px] md:text-[64px] font-black uppercase tracking-tighter leading-none italic text-black dark:text-white">
            Node_Identity
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50 flex items-center gap-2 text-black dark:text-white">
              <_Sc size={12} className="text-emerald-500" /> Brawnly_V3 // ID: {_u?.id.slice(0,8)}
            </p>
          </div>
        </header>

        <section className="space-y-10">
          <_m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row items-center gap-8 bg-neutral-50 dark:bg-[#111] p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black dark:border-white overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-2xl">
                {_avaUrl ? (
                  <img src={_avaUrl.startsWith('blob:') ? _avaUrl : getOptimizedImage(_avaUrl, 300)} alt="avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20 text-black dark:text-white"><_Hd size={40} /></div>
                )}
              </div>
              <label className={`absolute bottom-0 right-0 md:bottom-2 md:right-2 bg-black dark:bg-white text-white dark:text-black p-3 rounded-full cursor-pointer shadow-xl active:scale-90 transition-all ${_uploading ? 'opacity-50' : ''}`}>
                {_uploading ? <_L2 size={18} className="animate-spin" /> : <_Cm size={18} />}
                <input type="file" className="hidden" accept="image/*" onChange={_handleFileChange} disabled={_uploading} />
              </label>
            </div>
            
            <div className="flex-1 space-y-5 w-full text-black dark:text-white">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest opacity-40">Display_Name</label>
                <input type="text" value={_name} onChange={(e) => _sName(e.target.value)} className="w-full bg-transparent border-b-2 border-black dark:border-white py-2 text-xl md:text-2xl font-black focus:outline-none focus:border-emerald-500 transition-colors" placeholder="IDENTIFIER" />
              </div>
              <div className="p-3 bg-white dark:bg-black rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[9px] font-mono opacity-60 break-all">{_u?.email}</p>
              </div>
            </div>
          </_m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <button onClick={_saveProfile} disabled={_uploading} className="bg-black dark:bg-white text-white dark:text-black p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[10px] md:text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl">
              {_uploading ? <_L2 className="animate-spin" /> : <_Sv />} Sync_Identity
            </button>
            <button onClick={() => _sO()} className="border-4 border-black dark:border-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[10px] md:text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all text-black dark:text-white hover:bg-red-600 hover:border-red-600 hover:text-white">
              <_Lo /> Kill_Session
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}