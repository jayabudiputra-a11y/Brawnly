import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Tambahkan ini
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation(); // Ambil info path/URL saat ini

  // 1. Logika OTOMATIS: Scroll ke atas setiap kali ganti halaman (About, Contact, dll)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // Akan terpicu setiap kali visitor pindah path

  // 2. Logika TOMBOL: Munculkan tombol saat di-scroll ke bawah
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
      type="button"
      className={`
        fixed
        bottom-6
        left-1/2
        -translate-x-1/2
        z-40
        /* Tambahkan efek pelangi pada tombol agar selaras dengan tema kamu */
        bg-gradient-to-r from-red-500 via-green-500 to-blue-500
        hover:scale-110
        text-white
        p-3
        rounded-full
        shadow-lg
        transition-all
        duration-500
        ease-in-out
        group
        ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full pointer-events-none"
        }
      `}
    >
      <ChevronUp className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1" />
    </button>
  );
}