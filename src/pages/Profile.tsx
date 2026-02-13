import React, { useState as _s, useEffect as _e } from "react";
import { motion as _m } from "framer-motion";
import { Camera as _Cm, Save as _Sv, LogOut as _Lo, Loader2 as _L2, ShieldCheck as _Sc, WifiOff as _Wo, HardDrive as _Hd } from "lucide-react";
import { toast } from "sonner";
import { useNavigate as _uN } from "react-router-dom";

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
  const { user: _u, signOut: _sO, loading: _authLoading } = useAuth();
  const _nav = _uN();

  // States
  const [_loading, _sLoad] = _s(true);
  const [_uploading, _sUp] = _s(false);
  const [_name, _sName] = _s("");
  const [_avaUrl, _sAvaUrl] = _s<string | null>(null); 
  const [_fileBlob, _sFileBlob] = _s<Blob | null>(null); 
  const [_isOffline, _sOffline] = _s(!navigator.onLine);

  /* ============================================================
      🛡️ LOCKDOWN: Cegah Lemparan rute sebelum data siap
     ============================================================ */
  _e(() => {
    // Jika auth sudah selesai tapi user tidak ada, baru lempar ke signin
    if (!_authLoading && !_u) {
      _nav("/signin", { replace: true });
    }
    
    // Set flag keras di session storage untuk mematikan auto-redirect di App.tsx
    sessionStorage.setItem("lock_identity_node", "true");
    
    return () => {
      sessionStorage.removeItem("lock_identity_node");
    };
  }, [_u, _authLoading, _nav]);

  /* ============================================================
      🔄 INIT: HARD STABILIZED
     ============================================================ */
  _e(() => {
    if (!_u) return;

    const _init = async () => {
      // Tunggu buffer untuk menenangkan onAuthStateChange
      await new Promise(r => setTimeout(r, 1000));

      try {
        const _snap = localStorage.getItem(PROFILE_SNAP_KEY);
        if (_snap) {
          const _p = JSON.parse(_snap);
          _sName(_p.username || "");
          _sAvaUrl(_p.avatar_url || localStorage.getItem(OFFLINE_AVA_KEY));
        }

        if (navigator.onLine) {
          const { data: _d, error: _err } = await supabase
            .from("user_profiles")
            .select("username, avatar_url")
            .eq("id", _u.id)
            .maybeSingle();

          if (!_err && _d) {
            _sName(_d.username || "");
            if (!_fileBlob) _sAvaUrl(_d.avatar_url);
            localStorage.setItem(PROFILE_SNAP_KEY, JSON.stringify(_d));
          }
        }
      } catch (e) {
        console.warn("Node fault:", e);
      } finally {
        _sLoad(false);
      }
    };

    _init();
  }, [_u]);

  // Handle File & Save (Logika utuh seperti sebelumnya...)
  const _handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const _rawFile = e.target.files[0];
    _sUp(true);
    try {
      const _fmt = await _dBF(); 
      const _optimizedBlob = await _wTI(_rawFile, _fmt, 0.75);
      _sAvaUrl(URL.createObjectURL(_optimizedBlob));
      _sFileBlob(_optimizedBlob);
      toast.success("Optimized");
    } catch (error) {
      _sFileBlob(_rawFile);
    } finally { _sUp(false); }
  };

  const _saveProfile = async () => {
    if (!_u) return;
    _sUp(true);
    try {
      let _finalUrl = _avaUrl;
      if (_fileBlob) {
        const _path = `avatars/${_u.id}-${Date.now()}.webp`;
        await supabase.storage.from("brawnly-assets").upload(_path, _fileBlob);
        const { data } = supabase.storage.from("brawnly-assets").getPublicUrl(_path);
        _finalUrl = data.publicUrl;
      }
      await supabase.from("user_profiles").upsert({ id: _u.id, username: _name, avatar_url: _finalUrl });
      await supabase.auth.updateUser({ data: { full_name: _name, avatar_url: _finalUrl } });
      toast.success("Identity Synced");
    } catch (err) { toast.error("Sync Failed"); } finally { _sUp(false); }
  };

  // Rendering
  if (_loading || _authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <_L2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 animate-pulse">Initializing_Node...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-16 border-l-[12px] border-black dark:border-white pl-8">
          <h1 className="text-[48px] md:text-[64px] font-black uppercase tracking-tighter leading-none italic text-black dark:text-white">Node_Identity</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mt-4 text-black dark:text-white flex items-center gap-2">
            <_Sc size={12} className="text-emerald-500" /> Brawnly_V3 // {_u?.email}
          </p>
        </header>

        <section className="space-y-12">
          <_m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center gap-10 bg-neutral-50 dark:bg-[#111] p-10 rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-black dark:border-white overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-2xl relative">
                {_avaUrl ? (
                  <img src={_avaUrl.startsWith('blob:') ? _avaUrl : getOptimizedImage(_avaUrl, 300)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20 text-black dark:text-white"><_Hd size={48} /></div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 bg-black dark:bg-white text-white dark:text-black p-3 rounded-full cursor-pointer hover:scale-110 shadow-xl">
                <_Cm size={20} />
                <input type="file" className="hidden" accept="image/*" onChange={_handleFileChange} />
              </label>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 text-black dark:text-white">Display_Name</label>
                <input type="text" value={_name} onChange={(e) => _sName(e.target.value)} className="w-full bg-transparent border-b-2 border-black dark:border-white py-2 text-2xl font-black focus:outline-none focus:border-emerald-500 text-black dark:text-white" />
              </div>
            </div>
          </_m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={_saveProfile} disabled={_uploading} className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 hover:invert transition-all">
              <_Sv /> Sync_Identity
            </button>
            <button onClick={() => _sO()} className="border-4 border-black dark:border-white p-8 rounded-[2rem] font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-red-600 hover:text-white transition-all text-black dark:text-white">
              <_Lo /> Kill_Session
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}