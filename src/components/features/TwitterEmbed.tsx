import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => Promise<void>;
        createTweet: (
          tweetId: string,
          container: HTMLElement,
          options?: Record<string, string>
        ) => Promise<HTMLElement | undefined>;
      };
    };
  }
}

interface TwitterEmbedProps {
  /** Full tweet URL — accepts both twitter.com and x.com formats */
  url: string;
  /** Override theme. Defaults to auto-detect from <html class="dark"> */
  theme?: "light" | "dark";
  /** Card alignment. Default: center */
  align?: "left" | "center" | "right";
  /** Extra className for the outer wrapper div */
  className?: string;
}

function extractTweetId(url: string): string | null {
  try {
    const match = url.match(/(?:twitter\.com|x\.com)\/[^/]+\/statuse?s?\/(\d+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function loadTwitterScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.twttr?.widgets) { resolve(); return; }
    
    // Jika script sedang di-load oleh komponen lain, tunggu sampai selesai
    if (document.getElementById("twitter-wjs")) {
      let retries = 0;
      const check = setInterval(() => {
        retries++;
        if (window.twttr?.widgets) { clearInterval(check); resolve(); }
        // Timeout setelah 5 detik menunggu script
        if (retries > 50) { clearInterval(check); reject(new Error("Script Load Timeout")); }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = "twitter-wjs";
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    
    script.onload = () => {
      let retries = 0;
      const check = setInterval(() => {
        retries++;
        if (window.twttr?.widgets) { clearInterval(check); resolve(); }
        if (retries > 50) { clearInterval(check); reject(new Error("Widget Init Timeout")); }
      }, 100);
    };
    
    // Tangkap error jika diblokir AdBlocker/Brave Shields
    script.onerror = () => reject(new Error("Script diblokir (CSP/AdBlock)"));
    document.head.appendChild(script);
  });
}

export default function TwitterEmbed({
  url,
  theme,
  align = "center",
  className = "",
}: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [renderedTheme, setRenderedTheme] = useState<"light" | "dark">("light");

  // Sync theme with document dark mode class, or use the explicit prop
  useEffect(() => {
    if (theme) { setRenderedTheme(theme); return; }
    const detect = () =>
      document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark");
    setRenderedTheme(detect() ? "dark" : "light");
    
    const observer = new MutationObserver(() =>
      setRenderedTheme(detect() ? "dark" : "light")
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [theme]);

  // Render tweet whenever url or resolved theme changes
  useEffect(() => {
    const tweetId = extractTweetId(url);
    if (!tweetId || !containerRef.current) return;

    let cancelled = false;
    setStatus("loading");
    containerRef.current.innerHTML = "";

    (async () => {
      try {
        await loadTwitterScript();
        if (cancelled || !containerRef.current) return;

        // BIKIN TIMEOUT 8 DETIK UNTUK PROSES RENDER
        // Kalau internet jelek atau Tweet dihapus, gak akan muter terus
        const renderPromise = window.twttr!.widgets.createTweet(tweetId, containerRef.current, {
          theme: renderedTheme,
          align,
          dnt: "true",
          conversation: "none",
          lang: "id",
        });

        const timeoutPromise = new Promise<undefined>((_, reject) => {
          setTimeout(() => reject(new Error("Render Timeout (8s)")), 8000);
        });

        // Balapan antara render Twitter vs Timeout 8 detik
        const el = await Promise.race([renderPromise, timeoutPromise]);

        if (cancelled) return;

        // Twitter API mengembalikan elemen HTML jika sukses, atau undefined jika tweet tidak ada/dihapus
        if (el) {
          setStatus("success");
        } else {
          setStatus("error"); // Tangkap kasus "Tweet Dihapus/Not Found"
        }
      } catch (err) {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; };
  }, [url, renderedTheme, align]);

  if (!extractTweetId(url)) {
    return (
      <div className={`py-4 text-center text-sm text-red-500 font-mono ${className}`}>
        Invalid Twitter/X URL: {url}
      </div>
    );
  }

  return (
    <div
      className={`twitter-embed-wrapper w-full flex justify-${align} relative ${className}`}
      style={{ minHeight: status === "loading" ? 120 : undefined }}
    >
      {/* LOADING SPINNER */}
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center w-full py-10 z-10">
          <div className="w-6 h-6 rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin" />
        </div>
      )}

      {/* ERROR FALLBACK */}
      {status === "error" && (
        <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center text-sm text-neutral-500 dark:text-neutral-400 font-mono max-w-sm mx-auto w-full bg-neutral-50 dark:bg-neutral-900 relative z-20">
          <span className="block mb-2 text-base font-black">𝕏</span>
          Tweet gagal dimuat atau telah dihapus.{" "}
          <br />
          <a
            href={url.replace("x.com", "twitter.com")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 underline hover:text-blue-500 transition-colors"
          >
            Buka di X (Twitter)
          </a>
        </div>
      )}

      {/* TWEET CONTAINER */}
      <div
        ref={containerRef}
        className={`w-full transition-opacity duration-300 ${status === "success" ? "opacity-100 relative z-20" : "opacity-0 absolute -z-10"}`}
        style={{ maxWidth: "550px", margin: align === "center" ? "0 auto" : undefined }}
      />
    </div>
  );
}