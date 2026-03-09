// ─────────────────────────────────────────────────────────────────────────────
// Ad blocker WAJIB di-import paling pertama — sebelum React, router, semua lib.
// Self-executing: patches fetch, XHR, window.open, sendBeacon, createElement,
// location.href/replace/assign, history.pushState/replaceState,
// iframe.src, MutationObserver, click capture, dan CSP meta injection.
// Blocks: v2006.com, hatcheskoeri, defacesirras.click, phiglerdail.net,
//         nn125.com, rajabsyne.shop, /cx/ path, /afu.php path,
//         doubleclick, popads, adcash, dll.
// ─────────────────────────────────────────────────────────────────────────────

import { Routes as _Rs, Route as _Rt, useLocation as _uL, Navigate as _Nv } from "react-router-dom";
import React, {
  useEffect as _e,
  lazy as _lz,
  Suspense as _Sp,
  useRef,
  useState,
  memo,
} from "react";
import _L from "@/components/layout/Layout";
import _IF from "@/components/common/IframeA11yFixer";
import _ST from "@/components/features/ScrollToTopButton";
import _MT from "@/components/seo/MetaTags";
import { useAuth } from "@/hooks/useAuth";
import { _shouldBlock } from "@/lib/adblocker";

import _mP from "@/assets/myPride.gif";

const _SPINNER = (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
      width: "100%",
      background: "var(--bg, #fff)",
    }}
    aria-hidden="true"
  />
);

const _ARTICLE_SHELL = (
  <div
    style={{
      minHeight: "100vh",
      background: "var(--bg, #fff)",
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

const _H  = _safeLazy(() => import("@/pages/Home"));
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
const _Lc = _safeLazy(() => import("@/pages/License"));

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

// ─── Pop-under / focus-steal killer ──────────────────────────────────────────
// When window loses focus unexpectedly (ad opened new tab), immediately refocus.
// Also closes any ad window references we might track.
function _usePopUnderKiller() {
  _e(() => {
    let _lastFocusTime = Date.now();
    let _blurTimer: ReturnType<typeof setTimeout> | null = null;

    const _onBlur = () => {
      _lastFocusTime = Date.now();
      // Give legit clicks 300ms grace; then try to refocus if focus was stolen
      _blurTimer = setTimeout(() => {
        // Only auto-refocus if the blur was NOT from user interacting with
        // our own UI (e.g. typing in a form opened in another tab intentionally)
        if (document.visibilityState === "visible") {
          try { window.focus(); } catch { /* ignore */ }
        }
      }, 300);
    };

    const _onFocus = () => {
      if (_blurTimer) { clearTimeout(_blurTimer); _blurTimer = null; }
    };

    // Kill any ad URLs that somehow got into the URL bar via postMessage tricks
    const _onMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? e.data : JSON.stringify(e.data ?? "");
        if (_shouldBlock(data)) {
          if (import.meta.env.DEV) console.debug("[AD_BLOCK] postMessage blocked:", data.slice(0, 120));
          e.stopImmediatePropagation();
        }
      } catch { /* ignore */ }
    };

    // Intercept any ad attempts to navigate via visibilitychange
    const _onVisibility = () => {
      if (document.visibilityState === "hidden") return;
      // When page becomes visible again, scan for any new ad nodes
      document
        .querySelectorAll<HTMLElement>("script[src], iframe[src], a[href]")
        .forEach((node) => {
          const tag = node.tagName;
          const attr = tag === "A" ? "href" : "src";
          const val = node.getAttribute(attr) || "";
          if (val && _shouldBlock(val)) {
            if (import.meta.env.DEV) console.debug(`[AD_BLOCK] visibility scan removed ${tag}:`, val.slice(0, 120));
            node.remove();
          }
        });
    };

    window.addEventListener("blur",             _onBlur,       { passive: true });
    window.addEventListener("focus",            _onFocus,      { passive: true });
    window.addEventListener("message",          _onMessage,    true);
    document.addEventListener("visibilitychange", _onVisibility, { passive: true });

    return () => {
      window.removeEventListener("blur",              _onBlur);
      window.removeEventListener("focus",             _onFocus);
      window.removeEventListener("message",           _onMessage, true);
      document.removeEventListener("visibilitychange", _onVisibility);
      if (_blurTimer) clearTimeout(_blurTimer);
    };
  }, []);
}

function App() {
  const { pathname: _p } = _uL();
  const _prevPath = useRef(_p);
  const [mounted, setMounted] = useState(false);

  // ── Pop-under / focus-steal killer ──
  _usePopUnderKiller();

  _e(() => {
    setMounted(true);
  }, []);

  _e(() => {
    if (typeof window === "undefined") return;
    if (_prevPath.current !== _p) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      _prevPath.current = _p;
    }
  }, [_p]);

  _e(() => {
    if (typeof window === "undefined") return;

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
        html { scroll-behavior: auto !important; }
      `;
      document.head.appendChild(_style);
    }
    return () => {
      const el = document.getElementById("brawnly-perf-keyframes");
      if (el) el.remove();
    };
  }, []);

  if (!mounted) return _PAGE_SHELL;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <_MT
        title="Brawnly Smart Tracker"
        description="Next-gen fitness platform 2026."
        image={_mP}
      />
      <_IF />
      <_ST />

      <_Sp fallback={_SPINNER}>
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
            <_Rt
              path="license"
              element={
                <_RouteTransition fallback={_PAGE_SHELL}>
                  <_Lc />
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