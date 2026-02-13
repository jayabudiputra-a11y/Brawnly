import { Link as _L } from "react-router-dom";
import { Eye as _E } from "lucide-react";
import { motion as _m } from "framer-motion";
import { useEffect as _uE, useState as _uS } from "react";
import _mA from "@/assets/myAvatar.jpg";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useSaveData as _uSD } from "@/hooks/useSaveData";
import { CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";

interface ArticleCardProps {
  article: any;
  priority?: boolean;
}

// Helper: Simple Hash for Cookie Integrity
function _hS(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return Math.abs(h).toString(36);
}

// Helper: Secure Cookie Setter
function _sC(n: string, v: string, d = 30) {
  const e = new Date();
  e.setTime(e.getTime() + d * 864e5);
  document.cookie = `${n}=${v}; path=/; expires=${e.toUTCString()}; SameSite=Lax`;
}

export default function ArticleCard({ article: _a, priority: _p = false }: ArticleCardProps) {
  
  const _t = _a.title || "Untitled Article";

  const { isEnabled: _iE, saveData: _sD } = _uSD();
  const [_oF, _sOF] = _uS(!navigator.onLine);

  _uE(() => {
    const oN = () => _sOF(false);
    const oF = () => _sOF(true);
    window.addEventListener("online", oN);
    window.addEventListener("offline", oF);
    return () => {
      window.removeEventListener("online", oN);
      window.removeEventListener("offline", oF);
    };
  }, []);

  // Image URL Formatter
  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    return `${_CC.baseUrl}/${_u}`;
  };

  // Logic Optimasi Gambar (Width & Quality)
  const _rP = _a.featured_image ? _a.featured_image.split(/[\r\n]+/)[0]?.trim() : null;
  const _hQ = _rP ? _fC(_rP) : null;
  const _iL = _iE && _sD.quality === "low";
  const _tW = _iL ? 200 : 400; // Load kecil jika Data Saver aktif
  const _dU = _hQ ? _gOI(_hQ, _tW) : null;

  const _cK = `ac_${_a.slug}`;
  const _cH = _hS(_cK);

  _uE(() => {
    if (!_a.slug) return;
    try {
      const _pL = JSON.stringify({ t: _t, s: _a.slug, i: _hQ });
      const _ex = localStorage.getItem(_cK);
      
      // Bersihkan cache lama jika format URL berubah
      if (_ex && (_ex.includes("supabase.co") || _ex.includes("f_auto,v"))) {
        localStorage.removeItem(_cK);
      }
      
      localStorage.setItem(_cK, _pL);
      _sC("ac_h", _cH);
    } catch {}
  }, [_t, _a.slug, _hQ]);

  // Schema Markup (SEO Structured Data)
  const _jL = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: _t,
    image: _hQ,
    author: { "@type": "Person", name: _a.author?.username || "Brawnly Editorial" },
    publisher: {
      "@type": "Organization",
      name: "Brawnly",
      logo: { "@type": "ImageObject", url: "https://brawnly.online/favicon.ico" }
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://brawnly.online/article/${_a.slug}` }
  };

  return (
    <article className="group relative bg-transparent border-b border-gray-100 dark:border-neutral-900 last:border-0 py-6 outline-none overflow-hidden" tabIndex={0}>
      <script type="application/ld+json">{JSON.stringify(_jL)}</script>
      
      <_L to={`/article/${_a.slug}`} className="flex flex-row items-center gap-4 md:gap-8 outline-none relative z-10">
        {/* Thumbnail Section */}
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
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] font-black uppercase">No Media</div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#00a354] group-hover:text-yellow-500 transition-colors duration-300">
            {_a.category || "BRAWNLY SELECTION"}
          </span>
          
          <_m.h2 
            className="text-[17px] md:text-[22px] leading-[1.2] font-black uppercase tracking-tighter text-black dark:text-white line-clamp-2 mb-2 transition-all duration-300" 
            initial={{ x: 0 }} 
            whileHover={{ x: 5, color: "#facc15" }}
          >
            {_t}
          </_m.h2>

          <div className="flex items-center gap-2">
            <img src={_gOI(_mA, 40)} alt="B" className="w-4 h-4 rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" />
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <span className="text-black dark:text-white group-hover:text-yellow-400/80 transition-colors">
                By {_a.author?.username || "Brawnly Editorial"}
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