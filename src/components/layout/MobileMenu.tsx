import { memo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { navItems } from "@/config/navItems";

const MobileMenu = memo(({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler, { passive: true });
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-yellow-300"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi mobile"
      style={{
        contain: "layout style paint",
        willChange: "transform",
        transform: "translateZ(0)",
      }}
    >
      <div
        className="p-6 border-b-4 border-[#800000] flex justify-between items-center"
        style={{ minHeight: 80 }}
      >
        <h2 className="text-2xl font-extrabold text-[#800000]">Brawnly</h2>

        <button
          onClick={handleClose}
          className="p-2 text-[#800000]"
          aria-label="Tutup menu mobile"
          type="button"
          style={{ touchAction: "manipulation" }}
        >
          <X className="w-8 h-8" aria-hidden="true" />
        </button>
      </div>

      <nav
        className="flex-1 flex flex-col items-center justify-center space-y-10 text-3xl font-bold"
        aria-label="Navigasi utama"
      >
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={handleClose}
            className="text-[#800000] transition-all hover:bg-gradient-to-r hover:from-red-500 hover:via-yellow-400 hover:to-purple-600 hover:bg-clip-text hover:text-transparent"
            style={{ touchAction: "manipulation" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
});

MobileMenu.displayName = "MobileMenu";

export default MobileMenu;