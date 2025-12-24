import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Loader2, X, Check, Globe } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
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
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [changing, setChanging] = useState(false);

  const current =
    LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const changeLang = async (code: string) => {
    if (changing || code === i18n.language) {
      setVisible(false);
      return;
    }
    setChanging(true);
    await i18n.changeLanguage(code);
    setChanging(false);
    setVisible(false);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".advanced-translate")) {
        setVisible(false);
      }
    };
    if (visible) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [visible]);

  return (
    <div
      className="
        advanced-translate
        fixed
        right-4
        top-[92px]
        z-[9999]
      "
    >
      {/* TOGGLE */}
      <button
        onClick={() => setVisible(v => !v)}
        disabled={changing}
        aria-label="Change language"
        className="
          flex items-center gap-1.5
          rounded-full
          bg-white
          border border-gray-300
          px-2.5 py-1.5
          shadow-md
          text-sm text-gray-800
          hover:bg-gray-50
          active:scale-95
        "
      >
        <span className="text-base leading-none">{current.flag}</span>
        <Globe size={14} />
        {changing ? (
          <Loader2 size={14} className="animate-spin opacity-60" />
        ) : (
          <ChevronDown size={14} />
        )}
      </button>

      {/* PANEL */}
      {visible && (
        <div
          className="
            absolute
            right-0
            mt-2
            w-[240px]
            rounded-xl
            bg-white
            border border-gray-300
            shadow-2xl
          "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800">
              Select Language
            </h4>
            <button
              onClick={() => setVisible(false)}
              aria-label="Close"
              className="p-1 rounded hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          </div>

          {/* LIST */}
          <div className="max-h-[50vh] overflow-y-auto p-2 space-y-1">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                disabled={changing}
                className={`
                  w-full flex items-center gap-2
                  px-2 py-2
                  rounded-lg
                  text-sm
                  ${
                    i18n.language === lang.code
                      ? "bg-emerald-100 text-emerald-800"
                      : "hover:bg-gray-100 text-gray-800"
                  }
                `}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.name}</span>
                {i18n.language === lang.code && (
                  <Check size={14} className="text-emerald-600" />
                )}
              </button>
            ))}
          </div>

          {/* FOOTER */}
          <div className="px-3 py-2 border-t border-gray-200 text-center text-xs text-gray-500">
            FitApp Translate
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTranslate;
