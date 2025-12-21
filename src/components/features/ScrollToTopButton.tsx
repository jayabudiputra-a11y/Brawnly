

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility(); 

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  return (
    <button
      onClick={scrollToTop}
      aria-label="Gulir ke atas halaman"
      type="button" // ✅ PERBAIKAN: Mencegah submission formulir
      className={`
        fixed
        bottom-6
        right-6
        z-50 
        bg-emerald-600
        hover:bg-emerald-700
        text-white
        p-3
        rounded-full
        shadow-lg
        transition-all
        duration-300
        ease-in-out
        group
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}
      `}
    >
      <ChevronUp
        className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1"
      />
    </button>
  );
}