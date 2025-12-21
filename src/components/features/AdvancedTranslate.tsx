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
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

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
    <div className="advanced-translate">
      <button
        className="translate-toggle"
        onClick={() => setVisible(!visible)}
        disabled={changing}
        aria-label={
          visible
            ? "Tutup pemilih bahasa"
            : `Ubah bahasa, saat ini: ${current.name}`
        }
      >
        <span className="flag">{current.flag}</span>
        <Globe size={16} />
        {changing ? (
          <Loader2 size={16} className="animate-spin text-gray-400" />
        ) : (
          <ChevronDown size={16} className="arrow" />
        )}
      </button>

      {visible && (
        <div className="translate-panel mini">
          <div className="panel-header">
            <h4>Select Language</h4>
            <button
              className="close-btn"
              onClick={() => setVisible(false)}
              aria-label="Tutup pemilih bahasa"
            >
              <X size={16} />
            </button>
          </div>

          <div className="lang-list">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`lang-item ${
                  i18n.language === lang.code ? "active" : ""
                }`}
                onClick={() => changeLang(lang.code)}
                disabled={changing}
                aria-current={
                  i18n.language === lang.code ? "page" : undefined
                }
                aria-label={`Pilih ${lang.name}`}
              >
                <span className="flag">{lang.flag}</span>
                <span className="name">{lang.name}</span>
                {i18n.language === lang.code && (
                  <Check size={16} className="check" />
                )}
              </button>
            ))}
          </div>

          <div className="panel-footer">
            <small>FitApp Translate</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTranslate;
