import { Routes as _Rs, Route as _Rt, useLocation as _uL, Navigate as _Nv } from "react-router-dom";
import React, {
  useEffect as _e,
  lazy as _lz,
  Suspense as _Sp,
  useTransition,
  startTransition,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import _L from "@/components/layout/Layout";
import _IF from "@/components/common/IframeA11yFixer";
import _ST from "@/components/features/ScrollToTopButton";
import _MT from "@/components/seo/MetaTags";
import { useAuth } from "@/hooks/useAuth";

import _mP from "@/assets/myPride.gif";

const _SPINNER = (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      contain: "layout style",
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        border: "2px solid #10b981",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
        willChange: "transform",
      }}
    />
  </div>
);

const _PAGE_SHELL = (
  <div
    style={{
      minHeight: "100vh",
      background: "var(--bg, #fff)",
      contain: "layout style paint",
      contentVisibility: "auto",
    }}
    aria-hidden="true"
  />
);

const _ARTICLE_SHELL = (
  <div
    style={{
      minHeight: "100vh",
      background: "var(--bg, #fff)",
      contain: "layout style paint",
    }}
    aria-hidden="true"
  >
    <div
      style={{
        maxWidth: 1320,
        margin: "0 auto",
        padding: "48px 16px 0",
      }}
    >
      <div
        style={{
          height: 12,
          width: "40%",
          background: "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
          borderRadius: 4,
          marginBottom: 20,
        }}
      />
      <div
        style={{
          height: 80,
          width: "85%",
          background: "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
          borderRadius: 4,
          marginBottom: 32,
        }}
      />
      <div
        style={{
          aspectRatio: "21/9",
          width: "100%",
          background: "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
          borderRadius: 16,
        }}
      />
    </div>
  </div>
);

const _OFFLINE_PAGE = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6 z-[9999] relative">
    <h1 className="text-4xl md:text-6xl font-black text-red-600 mb-4 tracking-widest italic">OFFLINE</h1>
    <p className="mb-6 opacity-50 uppercase text-[10px] tracking-widest">Koneksi terputus saat memuat modul</p>
    <button
      onClick={() => window.location.reload()}
      className="px-8 py-4 border-2 border-white text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all active:scale-95"
    >
      Coba Lagi
    </button>
  </div>
);

const _safeLazy = (importFunc: () => Promise<any>) =>
  _lz(() =>
    importFunc().catch(() => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return { default: _OFFLINE_PAGE };
      }
      if (typeof window !== "undefined") window.location.reload();
      return { default: () => null as any };
    })
  );

const _H = _safeLazy(() => import("@/pages/Home"));
const _As = _safeLazy(() => import("@/pages/Articles"));
const _AP = _safeLazy(() => import("@/pages/ArticlePage"));
const _Cy = _safeLazy(() => import("@/pages/Category"));
const _Ab = _safeLazy(() => import("@/pages/About"));
const _Ct = _safeLazy(() => import("@/pages/Contact"));
const _Ar = _safeLazy(() => import("@/pages/Author"));
const _NF = _safeLazy(() => import("@/pages/NotFound"));
const _Sb = _safeLazy(() => import("@/pages/Subscription"));
const _Pf = _safeLazy(() => import("@/pages/Profile"));
const _AC = _safeLazy(() => import("@/pages/AuthCallback"));
const _Lb = _safeLazy(() => import("@/pages/Library"));
const _Vd = _safeLazy(() => import("@/pages/Videos"));
const _Ts = _safeLazy(() => import("@/pages/Terms"));
const _Py = _safeLazy(() => import("@/pages/Privacy"));
const _Es = _safeLazy(() => import("@/pages/Ethics"));
const _SU = _safeLazy(() => import("@/pages/SignUp"));
const _SI = _safeLazy(() => import("@/pages/SignIn"));

const _preloadRoute = (importer: () => Promise<any>) => {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "script";
  document.head.appendChild(link);
  importer().catch(() => {});
};

const _PR: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const { user, loading } = useAuth();
  const _loc = _uL();

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const _isAuthFlow =
    _loc.hash.includes("access_token") ||
    _loc.search.includes("code") ||
    _loc.pathname.includes("auth/callback");

  if (_loc.pathname === "/profile") {
    if (user || _isAuthFlow) return <>{children}</>;
    return <_Nv to="/signin" replace />;
  }

  if (!user && !_isAuthFlow) return <_Nv to="/signin" replace />;

  return <>{children}</>;
});

const _RouteTransition: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = memo(({ children, fallback }) => (
  <_Sp fallback={fallback ?? _PAGE_SHELL}>{children}</_Sp>
));

function App() {
  const { pathname: _p } = _uL();
  const _prevPath = useRef(_p);
  const [_isPending, _startTrans] = useTransition();

  _e(() => {
    if (typeof window === "undefined") return;
    if (_prevPath.current !== _p) {
      startTransition(() => {
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      });
      _prevPath.current = _p;
    }
  }, [_p]);

  _e(() => {
    if (typeof window === "undefined") return;

    const _io = new IntersectionObserver(() => {}, {});
    _io.disconnect();

    const _idle = (window as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));

    _idle(() => {
      _preloadRoute(() => import("@/pages/Articles"));
      _preloadRoute(() => import("@/pages/ArticlePage"));
    });

    const _handleMouseover = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href") || "";
      if (href.startsWith("/article")) _preloadRoute(() => import("@/pages/ArticlePage"));
      if (href.startsWith("/articles")) _preloadRoute(() => import("@/pages/Articles"));
      if (href.startsWith("/profile")) _preloadRoute(() => import("@/pages/Profile"));
      if (href.startsWith("/library")) _preloadRoute(() => import("@/pages/Library"));
      if (href.startsWith("/videos")) _preloadRoute(() => import("@/pages/Videos"));
    };

    document.addEventListener("mouseover", _handleMouseover, { passive: true });

    return () => {
      document.removeEventListener("mouseover", _handleMouseover);
    };
  }, []);

  _e(() => {
    const _style = document.createElement("style");
    _style.id = "brawnly-perf-keyframes";
    if (!document.getElementById("brawnly-perf-keyframes")) {
      _style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        :root { --bg: #fff; }
        @media (prefers-color-scheme: dark) { :root { --bg: #0a0a0a; } }
        .dark { --bg: #0a0a0a; }
      `;
      document.head.appendChild(_style);
    }
    return () => {
      const el = document.getElementById("brawnly-perf-keyframes");
      if (el) el.remove();
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300"
      style={{ contain: "layout style" }}
    >
      <_MT
        title="Brawnly Smart Tracker"
        description="Next-gen fitness platform 2026."
        image={_mP}
      />
      <_IF />
      <_ST />

      <_Sp
        fallback={_SPINNER}
      >
        <_Rs>
          <_Rt element={<_L />}>
            <_Rt
              path="/"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_H />
                </_RouteTransition>
              }
            />
            <_Rt
              path="articles"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_As />
                </_RouteTransition>
              }
            />
            <_Rt
              path="subscribe"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Sb />
                </_RouteTransition>
              }
            />
            <_Rt
              path="profile"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_PR>
                    <_Pf />
                  </_PR>
                </_RouteTransition>
              }
            />
            <_Rt
              path="library"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Lb />
                </_RouteTransition>
              }
            />
            <_Rt
              path="videos"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Vd />
                </_RouteTransition>
              }
            />
            <_Rt
              path="article/:slug"
              element={
                <_RouteTransition fallback={_ARTICLE_SHELL}>
                  <_AP />
                </_RouteTransition>
              }
            />
            <_Rt
              path="category/:slug"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Cy />
                </_RouteTransition>
              }
            />
            <_Rt
              path="about"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Ab />
                </_RouteTransition>
              }
            />
            <_Rt
              path="contact"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Ct />
                </_RouteTransition>
              }
            />
            <_Rt
              path="author"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Ar />
                </_RouteTransition>
              }
            />
            <_Rt
              path="auth/callback"
              element={
                <_RouteTransition fallback={_SPINNER}>
                  <_AC />
                </_RouteTransition>
              }
            />
            <_Rt
              path="terms"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Ts />
                </_RouteTransition>
              }
            />
            <_Rt
              path="privacy"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Py />
                </_RouteTransition>
              }
            />
            <_Rt
              path="ethics"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Es />
                </_RouteTransition>
              }
            />
          </_Rt>

          <_Rt
            path="/signup"
            element={
              <_RouteTransition fallback={_SPINNER}>
                <_SU />
              </_RouteTransition>
            }
          />
          <_Rt
            path="/signin"
            element={
              <_RouteTransition fallback={_SPINNER}>
                <_SI />
              </_RouteTransition>
            }
          />
          <_Rt
            path="*"
            element={
              <_RouteTransition fallback={_PAGE_SHELL}>
                <_NF />
              </_RouteTransition>
            }
          />
        </_Rs>
      </_Sp>
    </div>
  );
}

export default App;