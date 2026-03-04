import { useEffect, useState, useCallback } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOverFooter, setIsOverFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Logika tampil setelah scroll 200px
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 200);

      // Logika sembunyi jika menyentuh footer
      const footer = document.querySelector("footer");
      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        // Jika bagian atas footer sudah masuk ke layar (dengan offset 20px)
        setIsOverFooter(footerTop < windowHeight - 20);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Tombol hanya benar-benar tampil jika isVisible TRUE dan TIDAK sedang di area footer
  const showButton = isVisible && !isOverFooter;

  return (
    <button
      onClick={showButton ? scrollToTop : undefined}
      className={`fixed bottom-10 left-1/2 z-[9999] p-4 rounded-full transition-all duration-500 
      bg-gradient-to-tr from-[#FF0080] via-[#7928CA] via-[#00DFD8] via-[#47FF00] to-[#FFF500]
      border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]
      hover:scale-110 active:scale-95 active:shadow-none
      ${
        showButton 
          ? "opacity-100 translate-y-0 -translate-x-1/2 scale-100" 
          : "opacity-0 translate-y-20 -translate-x-1/2 scale-50 pointer-events-none"
      }`}
      style={{
        backgroundSize: "200% 200%",
        animation: showButton ? "gradientShift 3s ease infinite" : "none",
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