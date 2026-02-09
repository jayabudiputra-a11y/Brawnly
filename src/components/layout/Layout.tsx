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
    } else {
      setShowSplash(false);
    }
  }, [isHome]);

  useEffect(() => {
    if (!showSplash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, showSplash]);

  if (showSplash) return <Splash />;

  return (
    
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      
      <Header />

      <AdvancedTranslate />

      <main className="flex-1 focus:outline-none" id="main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;