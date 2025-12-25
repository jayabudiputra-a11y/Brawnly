import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import Splash from "../features/Splash";
import AdvancedTranslate from "@/components/features/AdvancedTranslate";

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [showSplash, setShowSplash] = useState(isHome);

  useEffect(() => {
    if (isHome) {
      const t = setTimeout(() => setShowSplash(false), 4000);
      return () => clearTimeout(t);
    }
    setShowSplash(false);
  }, [isHome]);

  if (showSplash) return <Splash />;

  return (
    /* PENTING: bg-white dark:bg-black adalah kunci Toggle bekerja.
       transition-colors memastikan perpindahan mode terasa smooth (halus).
    */
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">

      {/* Header biasanya berisi ThemeToggle */}
      <Header />

      <AdvancedTranslate />

      {/* Main Content: Dibuat bersih tanpa padding agar halaman internal yang mengatur spacing */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;