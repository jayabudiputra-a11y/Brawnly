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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-3 rounded-full shadow-lg transition-all duration-300 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-white ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
      }`}
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
}