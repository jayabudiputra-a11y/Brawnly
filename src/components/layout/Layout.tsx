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
  const [_mL, _smL] = _s<_S[]>([]);
  const [_cL, _scL] = _s(0);
  const [_iP, _siP] = _s(false);
  const [_pR, _spR] = _s(false);
  const _aR = _r<HTMLIFrameElement>(null);

  _e(() => {
    if (_iH) {
      const t = setTimeout(() => _ssS(false), 4000);
      return () => clearTimeout(t);
    } else {
      _ssS(false);
    }
  }, [_iH]);

  _e(() => {
    const _fL = async () => {
      try {
        const _d = await _sa.getAll();
        if (_d && _d.length > 0) _smL(_d);
      } catch (e) {}
    };
    _fL();

    const _hM = (e: any) => {
      if (e.detail?.type === "PLAY_SONG") {
        const _idx = _mL.findIndex(s => s.url.includes(e.detail.id));
        if (_idx !== -1) {
          _scL(_idx);
          _spR(true);
          _siP(true);
        }
      }
    };
    window.addEventListener("BRAWNLY_MUSIC", _hM);
    return () => window.removeEventListener("BRAWNLY_MUSIC", _hM);
  }, [_mL]);

  const _sC = (f: string) => {
    _aR.current?.contentWindow?.postMessage(`{"event":"command","func":"${f}","args":""}`, "*");
  };

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

      {_mL.length > 0 && _pR && (
        <div className="fixed invisible w-0 h-0 pointer-events-none">
          <iframe
            ref={_aR}
            key="brawnly-global-player"
            style={{ border: 0 }}
            src={`https://www.youtube.com/embed/${_gY(_mL[_cL].url)}?enablejsapi=1&autoplay=1&origin=${window.location.origin}&widget_referrer=${window.location.origin}&rel=0&controls=0&showinfo=0&playsinline=1`}
            allow="autoplay; encrypted-media"
            title="Brawnly_Sonic_Engine"
          />
        </div>
      )}

      {_pR && (
        <div className="fixed bottom-6 left-6 z-[9999] flex items-center gap-3 bg-white/10 dark:bg-black/40 backdrop-blur-xl p-2 pr-6 rounded-full border border-white/20 shadow-2xl animate-slide-in">
          <button 
            onClick={() => { _sC(_iP ? "pauseVideo" : "playVideo"); _siP(!_iP); }}
            className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20"
          >
            {_iP ? "⏸" : "▶"}
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">Now_Playing</span>
            <span className="text-[11px] font-black uppercase tracking-widest truncate max-w-[120px]">{_mL[_cL]?.title}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;