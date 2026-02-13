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
  // Ambil status auth dari hook central
  const { user: _u, signOut: _sO } = useAuth();

  // States
  const [_loading, _sLoad] = _s(true);
  const [_uploading, _sUp] = _s(false);
  const [_name, _sName] = _s("");
  const [_avaUrl, _sAvaUrl] = _s<string | null>(null); 
  const [_fileBlob, _sFileBlob] = _s<Blob | null>(null); 
  const [_isOffline, _sOffline] = _s(!navigator.onLine);

  /* ============================================================
      🛠️ HELPER: BLOB TO BASE64 (Untuk Offline Storage)
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
      🔄 INIT: LOAD DATA
     ============================================================ */
  _e(() => {
    if (!_u) return;

    const _init = async () => {
      try {
        const _snap = localStorage.getItem(PROFILE_SNAP_KEY);
        const _offlineAva = localStorage.getItem(OFFLINE_AVA_KEY);
        
        if (_snap) {
          const _p = JSON.parse(_snap);
          _sName(_p.username || "");
          if (_offlineAva) _sAvaUrl(_offlineAva);
          else if (_p.avatar_url) _sAvaUrl(_p.avatar_url);
        }

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
        await setCookieHash(_u.id);
      } catch (e) {
        console.warn("Hydration error:", e);
      } finally {
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
      toast.info("WASM Transcoding initialized...");
      const _fmt = await _dBF(); 
      const _optimizedBlob = await _wTI(_rawFile, _fmt, 0.75);
      const _preview = URL.createObjectURL(_optimizedBlob);
      
      _sAvaUrl(_preview);
      _sFileBlob(_optimizedBlob);

      const _b64 = await _blobToBase64(_optimizedBlob);
      localStorage.setItem(OFFLINE_AVA_KEY, _b64);

      toast.success(`Optimized: ${(_optimizedBlob.size / 1024).toFixed(1)}KB`);
    } catch (error) {
      toast.error("WASM Optimization failed");
      _sFileBlob(_rawFile);
    } finally {
      _sUp(false);
    }
  };

  /* ============================================================
      💾 SAVE LOGIC: CLOUD SYNC
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
        toast.warning("Offline: Changes queued");
        _sUp(false);
        return;
      }

      let _finalAvatarUrl = _avaUrl;

      // 1. Upload ke Storage jika ada file baru
      if (_fileBlob) {
        const _path = `avatars/${_u.id}-${Date.now()}.webp`;
        const { error: _upErr } = await supabase.storage
          .from("brawnly-assets")
          .upload(_path, _fileBlob, { upsert: true });

        if (_upErr) throw _upErr;

        const { data: _pub } = supabase.storage
          .from("brawnly-assets")
          .getPublicUrl(_path);

        _finalAvatarUrl = _pub.publicUrl;
      }

      // 2. Update Tabel user_profiles di Database
      const _dbPayload = {
        id: _u.id,
        username: _name,
        avatar_url: _finalAvatarUrl,
        updated_at: new Date().toISOString()
      };

      const { error: _dbErr } = await supabase
        .from("user_profiles")
        .upsert(_dbPayload);

      if (_dbErr) throw _dbErr;

      // 3. Update Supabase Auth Metadata (FIXED: _finalUrl -> _finalAvatarUrl)
      await supabase.auth.updateUser({
        data: { full_name: _name, avatar_url: _finalAvatarUrl }
      });

      // 4. Update Snapshot Lokal
      localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify(_dbPayload));
      _sAvaUrl(_finalAvatarUrl);
      
      toast.success("Identity Synced Successfully");
    } catch (err: any) {
      toast.error("Sync Failed: " + (err.message || "Unknown error"));
    } finally {
      _sUp(false);
    }
  };

  if (_loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-20 px-6 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        <header className="mb-16 border-l-[12px] border-black dark:border-white pl-8 text-black dark:text-white">
          <h1 className="text-[48px] md:text-[64px] font-black uppercase tracking-tighter leading-none italic text-black dark:text-white">
            Node_Identity
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 flex items-center gap-2">
              <_Sc size={12} className="text-emerald-500" /> Brawnly_Cloud_V3 // ID: {_u?.id.slice(0,8)}
            </p>
          </div>
        </header>

        <section className="space-y-12">
          <_m.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-10 bg-neutral-50 dark:bg-[#111] p-10 rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800"
          >
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-black dark:border-white overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative shadow-2xl">
                {_avaUrl ? (
                  <img 
                    src={_avaUrl.startsWith('blob:') ? _avaUrl : getOptimizedImage(_avaUrl, 300)} 
                    alt="avatar" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20 text-black dark:text-white"><_Hd size={48} /></div>
                )}
              </div>
              <label className={`absolute bottom-2 right-2 bg-black dark:bg-white text-white dark:text-black p-3 rounded-full cursor-pointer hover:scale-110 shadow-xl ${_uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {_uploading ? <_L2 size={20} className="animate-spin" /> : <_Cm size={20} />}
                <input type="file" className="hidden" accept="image/*" onChange={_handleFileChange} disabled={_uploading} />
              </label>
            </div>
            
            <div className="flex-1 space-y-6 w-full text-black dark:text-white">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Display_Name</label>
                <input 
                  type="text" 
                  value={_name} 
                  onChange={(e) => _sName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-black dark:border-white py-2 text-2xl font-black focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="IDENTIFIER_NAME"
                />
              </div>
              <div className="p-4 bg-white dark:bg-black rounded-xl border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-mono opacity-60 break-all">{_u?.email}</p>
              </div>
            </div>
          </_m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={_saveProfile}
              disabled={_uploading}
              className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 hover:invert transition-all active:scale-95 disabled:opacity-30 shadow-xl"
            >
              {_uploading ? <_L2 className="animate-spin" /> : <_Sv />} Sync_Identity
            </button>
            <button 
              onClick={() => _sO()}
              className="border-4 border-black dark:border-white p-8 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-red-600 hover:text-white transition-all text-black dark:text-white"
            >
              <_Lo /> Kill_Session
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}