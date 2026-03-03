import React, { useEffect, useRef, useState } from "react";

interface TwitterEmbedProps {
  url: string;
  align?: "left" | "center" | "right";
}

function extractTweetId(url: string): string | null {
  const match = url.match(
    /(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/status(?:es)?\/(\d+)/i
  );
  return match ? match[1] : null;
}

function extractTweetAuthor(url: string): string | null {
  const match = url.match(
    /(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)\/status/i
  );
  return match ? match[1] : null;
}

const WIDGET_TIMEOUT_MS = 8000;
const SITE_URL = "https://www.brawnly.online";

export default function TwitterEmbed({ url, align = "center" }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");

  const tweetId = extractTweetId(url);
  const tweetAuthor = extractTweetAuthor(url);
  const tweetUrl = url.trim().startsWith("http") ? url.trim() : `https://twitter.com/i/web/status/${tweetId}`;
  const canonicalTweetUrl = tweetId
    ? tweetAuthor
      ? `https://twitter.com/${tweetAuthor}/status/${tweetId}`
      : `https://twitter.com/i/web/status/${tweetId}`
    : tweetUrl;

  useEffect(() => {
    if (!tweetId || !containerRef.current) {
      setStatus("failed");
      return;
    }

    let active = true;

    // Timeout fallback — if Twitter widget doesn't render within threshold
    timerRef.current = setTimeout(() => {
      if (active && status === "loading") {
        setStatus("failed");
      }
    }, WIDGET_TIMEOUT_MS);

    const renderTweet = () => {
      if (!active || !containerRef.current) return;
      const tw = (window as any).twttr;
      if (!tw?.widgets?.createTweet) return;

      containerRef.current.innerHTML = "";

      tw.widgets
        .createTweet(tweetId, containerRef.current, {
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          align,
          dnt: true,
          lang: "id",
        })
        .then((el: HTMLElement | undefined) => {
          if (!active) return;
          if (el) {
            if (timerRef.current) clearTimeout(timerRef.current);
            setStatus("loaded");
          } else {
            setStatus("failed");
          }
        })
        .catch(() => {
          if (active) setStatus("failed");
        });
    };

    const loadWidgetScript = () => {
      // Script already loaded
      if ((window as any).twttr?.widgets) {
        renderTweet();
        return;
      }

      // Script tag already in DOM, wait for it
      if (document.getElementById("twitter-widget-script")) {
        const poll = setInterval(() => {
          if ((window as any).twttr?.widgets) {
            clearInterval(poll);
            renderTweet();
          }
        }, 200);
        return;
      }

      // Inject script fresh
      const script = document.createElement("script");
      script.id = "twitter-widget-script";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      script.onload = renderTweet;
      script.onerror = () => {
        if (active) setStatus("failed");
      };
      document.body.appendChild(script);
    };

    loadWidgetScript();

    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tweetId, align]);

  const alignClass =
    align === "center"
      ? "mx-auto"
      : align === "right"
      ? "ml-auto"
      : "mr-auto";

  /* ============================================================
     JSON-LD: SocialMediaPosting — tweet embed structured data
     ============================================================ */
  const _jLdPost = tweetId
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SocialMediaPosting",
        "url": canonicalTweetUrl,
        "sharedContent": {
          "@type": "WebPage",
          "url": canonicalTweetUrl,
        },
        "identifier": tweetId,
        "discussionUrl": canonicalTweetUrl,
        ...(tweetAuthor
          ? {
              "author": {
                "@type": "Person",
                "name": tweetAuthor,
                "url": `https://twitter.com/${tweetAuthor}`,
                "sameAs": [
                  `https://twitter.com/${tweetAuthor}`,
                  `https://x.com/${tweetAuthor}`,
                ],
              },
            }
          : {}),
        "publisher": {
          "@type": "Organization",
          "name": "X (Twitter)",
          "url": "https://twitter.com",
          "sameAs": ["https://x.com", "https://twitter.com"],
        },
        "isPartOf": {
          "@type": "WebPage",
          "url": SITE_URL,
          "name": "Brawnly",
        },
        "potentialAction": {
          "@type": "ViewAction",
          "target": canonicalTweetUrl,
          "name": "View on X / Twitter",
        },
      })
    : null;

  /* ============================================================
     JSON-LD: CreativeWork — fallback / general embed reference
     ============================================================ */
  const _jLdCreative = tweetId
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "url": canonicalTweetUrl,
        "identifier": tweetId,
        "name": tweetAuthor
          ? `Tweet by @${tweetAuthor} — ID ${tweetId}`
          : `Tweet ID ${tweetId}`,
        "description": tweetAuthor
          ? `Embedded tweet by @${tweetAuthor} (ID: ${tweetId}) on Brawnly.`
          : `Embedded tweet (ID: ${tweetId}) featured on Brawnly.`,
        "embedUrl": `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`,
        "isBasedOn": canonicalTweetUrl,
        "isPartOf": {
          "@type": "WebSite",
          "name": "Brawnly",
          "url": SITE_URL,
        },
      })
    : null;

  /* ============================================================
     SEO HIDDEN NODE — reusable for all render states
     ============================================================ */
  const SeoHiddenNode = () =>
    tweetId ? (
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
        {/* JSON-LD: SocialMediaPosting */}
        {_jLdPost && (
          <script type="application/ld+json">{_jLdPost}</script>
        )}

        {/* JSON-LD: CreativeWork */}
        {_jLdCreative && (
          <script type="application/ld+json">{_jLdCreative}</script>
        )}

        {/* Microdata: SocialMediaPosting */}
        <span
          itemScope
          itemType="https://schema.org/SocialMediaPosting"
        >
          <a
            href={canonicalTweetUrl}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {tweetAuthor
              ? `Tweet by @${tweetAuthor} — ID ${tweetId}`
              : `Tweet ID ${tweetId}`}
          </a>
          <meta itemProp="identifier" content={tweetId} />
          <meta itemProp="discussionUrl" content={canonicalTweetUrl} />
          {tweetAuthor && (
            <span
              itemScope
              itemType="https://schema.org/Person"
              itemProp="author"
            >
              <a
                href={`https://twitter.com/${tweetAuthor}`}
                itemProp="url"
                tabIndex={-1}
                rel="noopener noreferrer"
              >
                @{tweetAuthor}
              </a>
              <span itemProp="name">@{tweetAuthor}</span>
              <meta
                itemProp="sameAs"
                content={`https://twitter.com/${tweetAuthor}`}
              />
              <meta
                itemProp="sameAs"
                content={`https://x.com/${tweetAuthor}`}
              />
            </span>
          )}
          <span
            itemScope
            itemType="https://schema.org/Organization"
            itemProp="publisher"
          >
            <span itemProp="name">X (Twitter)</span>
            <a
              href="https://twitter.com"
              itemProp="url"
              tabIndex={-1}
              rel="noopener noreferrer"
            >
              Twitter / X
            </a>
          </span>
          <span
            itemScope
            itemType="https://schema.org/WebPage"
            itemProp="isPartOf"
          >
            <a
              href={SITE_URL}
              itemProp="url"
              tabIndex={-1}
              rel="noopener noreferrer"
            >
              Brawnly
            </a>
            <span itemProp="name">Brawnly</span>
          </span>
          {/* Shared content reference */}
          <span
            itemScope
            itemType="https://schema.org/WebPage"
            itemProp="sharedContent"
          >
            <meta itemProp="url" content={canonicalTweetUrl} />
          </span>
        </span>

        {/* Direct canonical link for crawlers */}
        <link rel="noopener noreferrer" href={canonicalTweetUrl} />
      </div>
    ) : null;

  // ── FALLBACK CARD (widget failed / timed out) ──
  if (status === "failed" || !tweetId) {
    return (
      <div
        className={`w-full max-w-[550px] ${alignClass}`}
        itemScope
        itemType="https://schema.org/SocialMediaPosting"
      >
        {/* Inline microdata for fallback state */}
        {tweetId && <meta itemProp="identifier" content={tweetId} />}
        {tweetId && <meta itemProp="url" content={canonicalTweetUrl} />}
        {tweetId && <meta itemProp="discussionUrl" content={canonicalTweetUrl} />}

        {/* SEO hidden node */}
        <SeoHiddenNode />

        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            tweetAuthor
              ? `View tweet by @${tweetAuthor} (ID: ${tweetId}) on X / Twitter`
              : `View tweet ID ${tweetId} on X / Twitter`
          }
          itemProp="url"
          className="group flex flex-col gap-3 rounded-2xl border-2 border-black dark:border-white bg-white dark:bg-[#111] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-white dark:fill-black"
                aria-label="X / Twitter"
                role="img"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-black dark:text-white">
                Post on X / Twitter
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                ID: {tweetId}
                {tweetAuthor && ` — @${tweetAuthor}`}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200 dark:bg-neutral-800" aria-hidden="true" />

          {/* CTA */}
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-serif italic text-neutral-500 dark:text-neutral-400">
              Klik untuk lihat post ini di X ↗
            </p>
            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black group-hover:bg-neutral-800 transition-colors flex-shrink-0">
              View Post
            </span>
          </div>
        </a>
      </div>
    );
  }

  // ── LOADING + LOADED STATES ──
  return (
    <div
      className={`w-full max-w-[550px] ${alignClass} relative`}
      itemScope
      itemType="https://schema.org/SocialMediaPosting"
      aria-label={
        tweetAuthor
          ? `Embedded tweet by @${tweetAuthor} — loading`
          : `Embedded tweet ID ${tweetId} — loading`
      }
    >
      {/* Inline microdata for loading/loaded state */}
      {tweetId && <meta itemProp="identifier" content={tweetId} />}
      {tweetId && <meta itemProp="url" content={canonicalTweetUrl} />}
      {tweetId && <meta itemProp="discussionUrl" content={canonicalTweetUrl} />}
      {tweetAuthor && <meta itemProp="author" content={`@${tweetAuthor}`} />}

      {/* SEO hidden node */}
      <SeoHiddenNode />

      {/* Skeleton shown while Twitter widget loads */}
      {status === "loading" && (
        <div
          className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111] p-5 space-y-3 animate-pulse"
          role="status"
          aria-live="polite"
          aria-label={
            tweetAuthor
              ? `Loading tweet by @${tweetAuthor}...`
              : `Loading tweet ID ${tweetId}...`
          }
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" aria-hidden="true" />
            <div className="space-y-1.5 flex-1" aria-hidden="true">
              <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
              <div className="h-2.5 bg-neutral-100 dark:bg-neutral-900 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2" aria-hidden="true">
            <div className="h-3 bg-neutral-100 dark:bg-neutral-900 rounded w-full" />
            <div className="h-3 bg-neutral-100 dark:bg-neutral-900 rounded w-4/5" />
            <div className="h-3 bg-neutral-100 dark:bg-neutral-900 rounded w-3/5" />
          </div>
          <div className="flex items-center gap-2 pt-1" aria-hidden="true">
            <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-2.5 bg-neutral-100 dark:bg-neutral-900 rounded w-20" />
          </div>
          <p className="text-[9px] text-center text-neutral-400 uppercase tracking-widest pt-1">
            Memuat tweet...
          </p>
        </div>
      )}

      {/* Twitter widget mounts here */}
      <div
        ref={containerRef}
        className={status === "loading" ? "opacity-0 h-0 overflow-hidden" : ""}
        suppressHydrationWarning
        aria-label={
          status === "loaded"
            ? tweetAuthor
              ? `Tweet by @${tweetAuthor} — ID ${tweetId}`
              : `Tweet ID ${tweetId}`
            : undefined
        }
      />
    </div>
  );
}