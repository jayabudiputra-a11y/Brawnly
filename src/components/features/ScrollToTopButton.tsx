import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] p-4 rounded-full transition-all duration-500 
      /* Efek Gradien 5 Warna ala 2000-an */
      bg-gradient-to-tr from-[#FF0080] via-[#7928CA] via-[#00DFD8] via-[#47FF00] to-[#FFF500]
      /* Border Kontras & Shadow Brutalist */
      border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]
      /* Animasi Hover */
      hover:scale-110 hover:-translate-y-2 active:scale-90 active:shadow-none
      ${
        isVisible 
          ? "opacity-100 scale-100 animate-bounce-slow" 
          : "opacity-0 scale-0 pointer-events-none"
      }`}
      style={{
        /* Menambah rotasi gradien agar lebih 'hidup' */
        backgroundSize: "200% 200%",
        animation: isVisible ? "gradientShift 3s ease infinite" : "none"
      }}
    >
      <ChevronUp className="w-8 h-8 text-white stroke-[4px] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
      
      {/* CSS internal untuk animasi gradien bergerak */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
      `}</style>
    </button>
  );
}