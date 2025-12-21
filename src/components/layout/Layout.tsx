

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

  if (showSplash) return <Splash />;

  return (
    <div className="app-layout min-h-screen flex flex-col bg-gray-50">
      <Header />

      <AdvancedTranslate />


      <main className="main-content flex-1 py-6 sm:py-8 lg:py-10">
        <div className="content-container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
