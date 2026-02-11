import { useState as _s, useEffect as _e, useRef as _r } from "react";
import { Outlet, useLocation as _uL } from "react-router-dom";
import { songsApi as _sa, type Song as _S } from "@/lib/api";
import Header from "./Header";
import Footer from "./Footer";
import Splash from "../features/Splash";
import AdvancedTranslate from "@/components/features/AdvancedTranslate";

const Layout = () => {
  const _l = _uL();
  const _iH = _l.pathname === "/";
  const [_sS, _ssS] = _s(_iH);
  
  // States untuk Brawnly Sonic Engine
  const [_mL, _smL] = _s<_S[]>([]);
  const [_cL, _scL] = _s(0);
  const [_pR, _spR] = _s(false); 
  
  // State SENSOR OFFLINE
  const [_isOnline, _setIsOnline] = _s(navigator.onLine);
  const _aR = _r<HTMLIFrameElement>(null);

  _e(() => {
    if (_iH) {
      const t = setTimeout(() => _ssS(false), 4000);
      return () => clearTimeout(t);
    } else {
      _ssS(false);
    }
  }, [_iH]);

  // Listener Online/Offline Status
  _e(() => {
    const handleOnline = () => _setIsOnline(true);
    const handleOffline = () => {
      _setIsOnline(false);
      _spR(false); // Matikan paksa Sonic Engine jika tiba-tiba offline
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. USE-EFFECT LOAD DATA: HANYA BERJALAN SEKALI SAAT MOUNT
  _e(() => {
    let isMounted = true;
    
    const _fL = async () => {
      try {
        const _cM = localStorage.getItem("brawnly_music_cache");
        if (_cM && !_isOnline) {
          if (isMounted) _smL(JSON.parse(_cM));
          return;
        }

        const _d = await _sa.getAll();
        if (_d && _d.length > 0) {
          if (isMounted) _smL(_d);
          localStorage.setItem("brawnly_music_cache", JSON.stringify(_d));
        }
      } catch (e) {}
    };
    _fL();
    
    return () => { isMounted = false; };
  }, [_isOnline]); // HAPUS _mL dari sini agar tidak infinite loop

  // 2. USE-EFFECT CUSTOM EVENT LISTENER
  _e(() => {
    const _hM = (e: any) => {
      if (!_isOnline) {
        console.warn("[BRAWNLY_SONIC_ENGINE]: Cannot start playback in offline mode.");
        return;
      }
      if (e.detail?.type === "PLAY_SONG" && _mL.length > 0) {
        const _idx = _mL.findIndex(s => s.url.includes(e.detail.id));
        if (_idx !== -1) {
          _scL(_idx);
          _spR(true);
        }
      }
    };
    window.addEventListener("BRAWNLY_MUSIC", _hM);
    return () => window.removeEventListener("BRAWNLY_MUSIC", _hM);
  }, [_mL, _isOnline]); // _mL dibutuhkan di sini untuk pencarian index

  // 3. USE-EFFECT YOUTUBE AUTO-SHUFFLE LISTENER
  _e(() => {
    const _hY = (e: MessageEvent) => {
      if (e.origin !== "https://www.youtube.com") return;
      try {
        const _d = JSON.parse(e.data);
        if (_d.event === "infoDelivery" && _d.info && _d.info.playerState === 0) {
          if (_mL.length > 0 && _isOnline) { 
            const _nI = Math.floor(Math.random() * _mL.length);
            _scL(_nI);
          }
        }
      } catch {}
    };

    window.addEventListener("message", _hY);
    return () => window.removeEventListener("message", _hY);
  }, [_mL, _isOnline]);

  const _gY = (u: string) => {
    const r = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    return u.match(r)?.[2] || null;
  };

  const _jL = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Brawnly",
    "description": "Smart Fitness and Wellness Tracker Application 2026",
    "url": "https://brawnly.online",
    "author": { "@type": "Person", "name": "Budi Putra Jaya" }
  };

  if (_sS) return <Splash />;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <script type="application/ld+json">{JSON.stringify(_jL)}</script>
      <Header />
      <AdvancedTranslate />
      
      <main className="flex-1 focus:outline-none" id="main-content">
        <Outlet />
      </main>
      
      <Footer />

      {_mL.length > 0 && _pR && _isOnline && (
        <div className="fixed invisible w-0 h-0 pointer-events-none overflow-hidden">
          <iframe
            ref={_aR}
            key={`brawnly-global-player-${_cL}`} 
            style={{ border: 0 }}
            src={`https://www.youtube.com/embed/${_gY(_mL[_cL].url)}?enablejsapi=1&autoplay=1&origin=${window.location.origin}&widget_referrer=${window.location.origin}&rel=0&controls=0&showinfo=0&playsinline=1`}
            allow="autoplay; encrypted-media"
            title="Brawnly_Sonic_Engine"
          />
        </div>
      )}
    </div>
  );
};

export default Layout;