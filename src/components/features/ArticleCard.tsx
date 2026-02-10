import { Link as _L } from "react-router-dom";
import { Eye as _E } from "lucide-react";
import { useTranslation as _uT } from "react-i18next";
import { motion as _m } from "framer-motion";
import { useEffect as _uE, useState as _uS } from "react";

import _mA from "@/assets/myAvatar.jpg";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { generateFullImageUrl as _gFI, type LangCode as _LC } from "@/utils/helpers";
import { useSaveData as _uSD } from "@/hooks/useSaveData";

interface ArticleCardProps {
  article: any;
  priority?: boolean;
}

/* ------------------------------
   Ultra lightweight hash
--------------------------------*/
function _hS(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

/* ------------------------------
   Cookie setter minimal
--------------------------------*/
function _sC(name: string, val: string, days = 30) {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie = `${name}=${val}; path=/; expires=${d.toUTCString()}; SameSite=Lax`;
}

/* ------------------------------
   Reconnect Backoff (ric WS / basetime)
--------------------------------*/
function _cRB(connectFn: () => Promise<void>) {
  let a = 0;
  let t: any = null;

  const run = async () => {
    if (!navigator.onLine) return;

    try {
      await connectFn();
      a = 0;
    } catch {
      a++;
      const base = Math.min(30000, 1000 * 2 ** a);
      const jitter = Math.random() * 500;
      t = setTimeout(run, base + jitter);
    }
  };

  run();

  window.addEventListener("online", run);

  return () => {
    if (t) clearTimeout(t);
    window.removeEventListener("online", run);
  };
}

export default function ArticleCard({ article: _a, priority: _p = false }: ArticleCardProps) {
  const { i18n: _i } = _uT();
  const _ln = (_i.language as _LC) || "en";
  const { isEnabled: _iE, saveData: _sD } = _uSD();

  const [_offline, _setOffline] = _uS(!navigator.onLine);

  /* ------------------------------
     Offline detection
  --------------------------------*/
  _uE(() => {
    const goOn = () => _setOffline(false);
    const goOff = () => _setOffline(true);
    window.addEventListener("online", goOn);
    window.addEventListener("offline", goOff);
    return () => {
      window.removeEventListener("online", goOn);
      window.removeEventListener("offline", goOff);
    };
  }, []);

  /* ------------------------------
     Text Resolve
  --------------------------------*/
  const _t = _a[`title_${_ln}`] ?? _a.title_en ?? _a.title ?? "";

  /* ------------------------------
     Image Resolve
  --------------------------------*/
  const _fIP = _a.featured_image_path_clean
    ? _a.featured_image_path_clean.split("\r\n")[0]?.trim()
    : null;

  const _rIU = _fIP ? _gFI(_fIP) : null;
  const _iLQM = _iE && _sD.quality === "low";
  const _tW = _iLQM ? 200 : 400;
  const _dU = _rIU ? _gOI(_rIU, _tW) : null;

  /* ------------------------------
     memory cache
  --------------------------------*/
  const _cacheKey = `ac_${_a.slug}`;
  const _cacheHash = _hS(_cacheKey);

  _uE(() => {
    try {
      const payload = {
        t: _t,
        s: _a.slug,
        i: _rIU
      };

      localStorage.setItem(_cacheKey, JSON.stringify(payload));
      _sC("ac_h", _cacheHash);
    } catch {}
  }, [_t, _a.slug, _rIU]);

  /* ------------------------------
     time reconnect example
     (Plubase connect inside)
  --------------------------------*/
  _uE(() => {
    const stop = _cRB(async () => {
      // Example only — replace with supabase realtime connect
      // await supabase.realtime.connect()
      return Promise.resolve();
    });
    return stop;
  }, []);

  /* ------------------------------
     JSON-LD
  --------------------------------*/
  const _jLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: _t,
    image: _rIU,
    author: {
      "@type": "Person",
      name: _a.author || "Budi Putra Jaya"
    },
    publisher: {
      "@type": "Organization",
      name: "Brawnly",
      logo: {
        "@type": "ImageObject",
        url: "https://brawnly.online/favicon.ico"
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://brawnly.online/article/${_a.slug}`
    }
  };

  return (
    <article
      className="group relative bg-transparent border-b border-gray-100 dark:border-neutral-900 last:border-0 py-6 outline-none overflow-hidden"
      tabIndex={0}
    >
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>

      <_L
        to={`/article/${_a.slug}`}
        className="flex flex-row items-center gap-4 md:gap-8 outline-none relative z-10"
      >
        <div className="relative flex-shrink-0 w-[110px] h-[110px] md:w-[200px] md:h-[130px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-transparent group-hover:border-yellow-400/50 transition-colors duration-500">
          {_dU ? (
            <img
              src={_dU}
              alt={_t}
              loading={_p ? "eager" : "lazy"}
              width={200}
              height={130}
              className="w-full h-full object-cover grayscale transition-all duration-700 ease-in-out group-hover:grayscale-0 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 text-[10px] font-black uppercase">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#00a354] group-hover:text-yellow-500 transition-colors duration-300">
            {_a.category || "BRAWNLY SELECTION"}
          </span>

          <_m.h2
            className="text-[17px] md:text-[22px] leading-[1.2] font-black uppercase tracking-tighter text-black dark:text-white line-clamp-2 mb-2 transition-all duration-300"
            variants={{
              initial: { x: 0 },
              hover: { x: 5, color: "#facc15" }
            }}
            initial="initial"
            whileHover="hover"
          >
            {_t}
          </_m.h2>

          <div className="flex items-center gap-2">
            <img
              src={_gOI(_mA, 40)}
              alt="Author"
              className="w-4 h-4 rounded-full grayscale group-hover:grayscale-0 group-hover:ring-1 group-hover:ring-yellow-400 transition-all duration-500"
            />
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <span className="text-black dark:text-white group-hover:text-yellow-400/80 transition-colors">
                By {_a.author || "Budi Putra Jaya"}
              </span>
              <span className="flex items-center gap-1">
                <_E className="w-3 h-3 text-[#00a354] group-hover:text-yellow-400" />
                {_a.views ?? 0}
              </span>
            </div>
          </div>
        </div>
      </_L>
    </article>
  );
}
