import { useEffect, useState, useCallback } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-10 left-1/2 z-[9999] p-4 rounded-full transition-all duration-500 
      bg-gradient-to-tr from-[#FF0080] via-[#7928CA] via-[#00DFD8] via-[#47FF00] to-[#FFF500]
      border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]
      hover:scale-110 active:scale-95 active:shadow-none
      ${
        isVisible 
          ? "opacity-100 translate-y-0 -translate-x-1/2" 
          : "opacity-0 translate-y-10 -translate-x-1/2 pointer-events-none"
      }`}
      style={{
        backgroundSize: "200% 200%",
        animation: isVisible ? "gradientShift 3s ease infinite" : "none",
        willChange: "transform, opacity"
      }}
    >
      <ChevronUp className="w-8 h-8 text-white stroke-[4px] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
      
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </button>
  );
}