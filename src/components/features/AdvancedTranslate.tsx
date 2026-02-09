import React, { useState as _s, useEffect as _e } from "react";
import { useTranslation as _uT } from "react-i18next";
import { ChevronDown as _Cd, Loader2 as _L2, X as _X, Check as _Ck, Globe as _Gb } from "lucide-react";

interface _L {
  code: string;
  name: string;
  flag: string;
}

const _LS: _L[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" }
];

const AdvancedTranslate: React.FC = () => {
  const { i18n: _i } = _uT();
  const [_v, _sv] = _s(false);
  const [_ch, _sch] = _s(false);

  const _curr = _LS.find(_l => _l.code === _i.language) || _LS[0];

  const _hCL = async (_c: string) => {
    if (_ch || _c === _i.language) {
      _sv(false);
      return;
    }
    _sch(true);
    await _i.changeLanguage(_c);
    _sch(false);
    _sv(false);
  };

  _e(() => {
    const _cl = (_ev: MouseEvent) => {
      if (!(_ev.target as Element).closest(".advanced-translate")) {
        _sv(false);
      }
    };
    if (_v) document.addEventListener("click", _cl);
    return () => document.removeEventListener("click", _cl);
  }, [_v]);

  return (
    <div className="advanced-translate fixed right-4 top-[92px] z-[9999]">
      <button
        onClick={() => _sv(_prev => !_prev)}
        disabled={_ch}
        aria-label="Change language"
        className="flex items-center gap-1.5 rounded-full bg-white border border-gray-300 px-2.5 py-1.5 shadow-md text-sm text-gray-800 hover:bg-gray-50 active:scale-95"
      >
        <span className="text-base leading-none">{_curr.flag}</span>
        <_Gb size={14} />
        {_ch ? (
          <_L2 size={14} className="animate-spin opacity-60" />
        ) : (
          <_Cd size={14} />
        )}
      </button>

      {_v && (
        <div className="absolute right-0 mt-2 w-[240px] rounded-xl bg-white border border-gray-300 shadow-2xl">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800">Select Language</h4>
            <button
              onClick={() => _sv(false)}
              aria-label="Close"
              className="p-1 rounded hover:bg-gray-100"
            >
              <_X size={14} />
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-2 space-y-1">
            {_LS.map(_lang => (
              <button
                key={_lang.code}
                onClick={() => _hCL(_lang.code)}
                disabled={_ch}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm ${
                  _i.language === _lang.code
                    ? "bg-emerald-100 text-emerald-800"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <span className="text-base">{_lang.flag}</span>
                <span className="flex-1 text-left">{_lang.name}</span>
                {_i.language === _lang.code && (
                  <_Ck size={14} className="text-emerald-600" />
                )}
              </button>
            ))}
          </div>

          <div className="px-3 py-2 border-t border-gray-200 text-center text-xs text-gray-500">
            Brawnly Translate
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTranslate;