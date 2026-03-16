import { useEffect as _e, useState as _s, useRef as _uR } from "react";

const INSTAGRAM_USERNAME = "deul.umm";
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
const INSTAGRAM_POST_PERMALINK =
  "https://www.instagram.com/p/DVVb2ZbCdU7/?utm_source=ig_embed&utm_campaign=loading";

function InstagramSEONode() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
      }}
    >
      <span itemScope itemType="https://schema.org/Person">
        <span itemProp="sameAs" content={INSTAGRAM_URL} />
        <span itemProp="sameAs" content={INSTAGRAM_POST_PERMALINK} />
        <a href={INSTAGRAM_URL} itemProp="url" rel="noopener noreferrer" tabIndex={-1}>
          Follow on Instagram — @{INSTAGRAM_USERNAME}
        </a>
        <span itemProp="name" content={INSTAGRAM_USERNAME} />
        <span
          itemProp="description"
          content={`Instagram profile of ${INSTAGRAM_USERNAME} — visual stories, posts, and reels.`}
        />
      </span>
      <meta name="instagram:profile" content={INSTAGRAM_USERNAME} />
      <link rel="author" href={INSTAGRAM_URL} />
    </div>
  );
}

let _igScriptState: "idle" | "loading" | "loaded" = "idle";
const _igScriptCallbacks: (() => void)[] = [];

function _loadInstagramScript(onReady: () => void): void {
  if (_igScriptState === "loaded") {
    onReady();
    return;
  }

  _igScriptCallbacks.push(onReady);

  if (_igScriptState === "loading") return;

  _igScriptState = "loading";

  const existing = document.getElementById("ig-embed-script");
  if (existing) {
    const poll = setInterval(() => {
      if ((window as any).instgrm?.Embeds?.process) {
        clearInterval(poll);
        _igScriptState = "loaded";
        _igScriptCallbacks.forEach((cb) => cb());
        _igScriptCallbacks.length = 0;
      }
    }, 150);
    return;
  }

  const script = document.createElement("script");
  script.id = "ig-embed-script";
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  script.defer = true;

  script.onload = () => {
    const poll = setInterval(() => {
      if ((window as any).instgrm?.Embeds?.process) {
        clearInterval(poll);
        _igScriptState = "loaded";
        _igScriptCallbacks.forEach((cb) => cb());
        _igScriptCallbacks.length = 0;
      }
    }, 150);
  };

  script.onerror = () => {
    _igScriptState = "idle";
    _igScriptCallbacks.length = 0;
  };

  document.body.appendChild(script);
}

export default function InstagramWidget() {
  const _containerRef = _uR<HTMLDivElement>(null);
  const _mountRef = _uR<HTMLDivElement>(null);
  const _hasInjected = _uR(false);

  const [_inView, _setInView] = _s(false);
  const [_embedReady, _setEmbedReady] = _s(false);
  const [_isMounted, _setMounted] = _s(false);

  _e(() => {
    _setMounted(true);
  }, []);

  _e(() => {
    if (!_isMounted || !_containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          _setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(_containerRef.current);
    return () => observer.disconnect();
  }, [_isMounted]);

  _e(() => {
    if (!_inView || !_mountRef.current || _hasInjected.current) return;

    _hasInjected.current = true;

    const blockquote = document.createElement("blockquote");
    blockquote.className = "instagram-media";
    blockquote.setAttribute("data-instgrm-captioned", "");
    blockquote.setAttribute("data-instgrm-permalink", INSTAGRAM_POST_PERMALINK);
    blockquote.setAttribute("data-instgrm-version", "14");
    blockquote.style.cssText =
      "background:#FFF;border:0;border-radius:3px;margin:0 auto;max-width:100%;min-width:240px;padding:0;width:100%";

    const inner = document.createElement("div");
    inner.style.padding = "16px";
    blockquote.appendChild(inner);

    _mountRef.current.appendChild(blockquote);

    _loadInstagramScript(() => {
      try {
        (window as any).instgrm?.Embeds?.process(_mountRef.current ?? undefined);
      } catch {}
      _setEmbedReady(true);
    });
  }, [_inView]);

  return (
    <div
      ref={_containerRef}
      className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111] w-full"
      itemScope
      itemType="https://schema.org/SocialMediaPosting"
    >
      <InstagramSEONode />
      <meta itemProp="url" content={INSTAGRAM_POST_PERMALINK} />
      <meta itemProp="author" content={INSTAGRAM_USERNAME} />

      <div className="h-1.5 w-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" />

      <div className="px-4 pt-5 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-md flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-white"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Instagram"
              role="img"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 leading-none mb-0.5">
              Instagram
            </p>
            <p className="text-[13px] font-black uppercase italic tracking-tight text-black dark:text-white leading-none truncate">
              @{INSTAGRAM_USERNAME}
            </p>
          </div>
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow ${INSTAGRAM_USERNAME} on Instagram`}
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ee2a7b] to-[#6228d7] text-white shadow-sm hover:from-[#6228d7] hover:to-[#ee2a7b] transition-all duration-300 flex-shrink-0 whitespace-nowrap"
        >
          Follow
        </a>
      </div>

      <div className="px-2 pb-2 overflow-hidden w-full" style={{ minHeight: 250, maxWidth: "100%" }}>
        {!_embedReady && (
          <div
            className="animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center"
            style={{ height: 250 }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-20" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
        )}
        <div
          ref={_mountRef}
          style={{ display: _embedReady ? "block" : "none" }}
          suppressHydrationWarning
        />
      </div>

      <div className="px-4 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View all posts on Instagram"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ee2a7b] hover:text-[#6228d7] transition-colors duration-300"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          View all posts on Instagram
        </a>
      </div>
    </div>
  );
}