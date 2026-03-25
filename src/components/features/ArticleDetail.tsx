import React, {
  useState as _s,
  useEffect as _e,
  useMemo as _uM,
  useRef as _uR,
  useCallback as _uC,
  Suspense,
  lazy,
  startTransition,
} from "react";
import { Link as _L, useParams as _uP, useNavigate as _uN } from "react-router-dom";
import { Helmet as _Hm } from "react-helmet-async";
import {
  Eye as _Ey,
  Bookmark as _Bm,
  Check as _Ck,
  WifiOff as _Wo,
  Share2 as _Sh,
  ArrowLeft as _Al,
  Send as _Sd,
  MessageSquare as _Ms,
  Loader2 as _L2,
  User as _Us,
  Reply as _Rp,
  CornerDownRight as _Cr,
  X as _X,
  Camera as _Ca,
  PlayCircle as _Pc,
  Aperture as _Ap,
  Swords as _Sw,
  UserPlus as _Up,
  ExternalLink as _El,
  Volume2,
  VolumeX,
  Pause,
} from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import FormattedDate from "@/components/features/FormattedDate";
import _mA from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";
import TwitterEmbed from "@/components/features/TwitterEmbed";
import InstagramWidget from "@/components/features/InstagramWidget";
import { isTweetUrl } from "@/lib/utils";
import _muscleLeft from "@/assets/119-1191125_muscle-arms-png-big-arm-muscles-transparent-png.png";
import _muscleRight from "@/assets/634-6343275_muscle-arm-png-background-images-barechested-transparent-png.png";
import PayPalWidget from "@/components/features/PaypalWidget";
import { useArticleData as _uAD } from "@/hooks/useArticleData";
import { useArticleViews as _uAV } from "@/hooks/useArticleViews";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useArticles as _uAs } from "@/hooks/useArticles";
import { useAuth } from "@/hooks/useAuth";
import { supabase, CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";
import { commentsApi } from "@/lib/api";

import { wasmTranscodeImage as _wTI, wasmCreatePlaceholder as _wCP } from "@/lib/wasmImagePipeline";
import { wasmVideoToThumbnail as _wVT } from "@/lib/wasmVideoPipeline";
import { detectBestFormat as _dBF, detectBestFormat } from "@/lib/imageFormat";
import { setCookieHash, mirrorQuery, warmupEnterpriseStorage } from "@/lib/enterpriseStorage";
import { enqueue } from "@/lib/idbQueue";
import { saveAssetToShared, getAssetFromShared } from "@/lib/sharedStorage";
import { registerSW } from "@/pwa/swRegister";
import VideoShortsGrid from "@/components/features/VideoShortsGrid";
import YouTubeShortsGrid from "@/components/features/YoutubeShortsGrid";
import { buildVideoJsonLdList } from "@/lib/videoJsonLd";

// ── Journal theme CSS imports ─────────────────────────────────────────────────
import { JOURNAL_CSS_OCEAN } from "./journalCssOcean";
import { JOURNAL_CSS_FOREST } from "./journalCssForest";
import { JOURNAL_CSS_ROSE } from "./journalCssRose";
import { JOURNAL_CSS_SLATE } from "./journalCssSlate";
import { JOURNAL_CSS_EMBER } from "./journalCssEmber";
import { JOURNAL_CSS_DUSK } from "./journalCssDusk";
import { JOURNAL_CSS_NOIR } from "./journalCssNoir";
import { JOURNAL_CSS_SAGE } from "./journalCssSage";

import type { CommentWithUser as _Cu } from "@/types";

const IMAGE_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
const IMAGE_COPYRIGHT_NOTICE = "© 2026 Budi Putra Jaya. All rights reserved.";
const IMAGE_ACQUIRE_LICENSE_URL = "https://www.brawnly.online/license";
const IMAGE_CREATOR_NAME = "Budi Putra Jaya";

const INSTAGRAM_USERNAME = "deul.umm";
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
const INSTAGRAM_POST_PERMALINK =
  "https://www.instagram.com/p/DVVb2ZbCdU7/?utm_source=ig_embed&utm_campaign=loading";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@rudayaDIR";
const YOUTUBE_CHANNEL_HANDLE = "rudayaDIR";
const YOUTUBE_CHANNEL_VIDEOS_URL = `${YOUTUBE_CHANNEL_URL}/videos`;
const YOUTUBE_SHORTS_URL = `${YOUTUBE_CHANNEL_URL}/shorts`;

const SUBSTACK_URL =
  "https://deulo.substack.com/p/wifi-densepose-melacak-tubuh-manusia";
const SUBSTACK_ROOT_URL = "https://deulo.substack.com";
const SUBSTACK_RSS_URL = "https://deulo.substack.com/feed";
const SUBSTACK_POST_TITLE =
  "WiFi DensePose: Melacak Tubuh Manusia Menembus Tembok, Tanpa Kamera";
const SUBSTACK_POST_DESC =
  "Proyek open-source ini menggunakan sinyal WiFi biasa untuk mengestimasi pose tubuh secara real-time — dan hasilnya mengubah cara kita memandang privasi dan keamanan selamanya.";

const PINTEREST_PROFILE_URL =
  "https://ru.pinterest.com/mustbeloveonthebrain/";
const PINTEREST_PIN_URL = "https://pin.it/54og3CaPN";
const PINTEREST_PIN_URL_2 = "https://pin.it/4D4StcRSo";

const CR_PLAYER_TAG = "RY9J2RC2Y";
const CR_PLAYER_NAME = "bmjpdam9";
const CR_PLAYER_ID = "7-54051567";
const CR_ADD_FRIEND_URL =
  "https://link.clashroyale.com/?supercell_id&p=34-325a499d-fa6d-436b-a6cd-1d592a8afdea";
const CR_ROYALEAPI_BATTLES = `https://royaleapi.com/player/${CR_PLAYER_TAG}/battles`;
const CR_ROYALEAPI_PROFILE = `https://royaleapi.com/player/${CR_PLAYER_TAG}`;

const DANA_NAME = "Putra";
const DANA_LINK_1 = "https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012092026031661814425";
const DANA_LINK_2 = "https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012022082292326653";

// ── GIF fallback untuk URL slot yang kosong ───────────────────────────────────
const GIF_FALLBACK =
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y3V3eTd0N2tyMnV1MDM4Z3VwOGduY3NmanRtbHNnNTV6NmVmMHJ6aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xTiTnnfeulzLtBmE0w/giphy.gif";

type RSSItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail: string;
  videoId?: string;
};

const _rssCache = new Map<string, { ts: number; items: RSSItem[] }>();
const RSS_CACHE_TTL = 5 * 60 * 1000;

type ProxyEntry = {
  make: (u: string) => string | null;
  extract?: (text: string) => string;
};

const CORS_PROXIES: ProxyEntry[] = [
  { make: (u) => u },
  {
    make: (u) =>
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  },
  {
    make: (u) => {
      if (u.includes("api.rss2json.com")) return null;
      return `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`;
    },
    extract: (t) => {
      try {
        const parsed = JSON.parse(t);
        return parsed.contents ?? t;
      } catch {
        return t;
      }
    },
  },
  {
    make: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  },
];

async function _parseXmlItems(text: string): Promise<RSSItem[]> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/xml");

  const parseErr =
    doc.querySelector("parseerror") || doc.querySelector("parsererror");
  if (parseErr) return [];

  const rawItems = [...doc.querySelectorAll("item, entry")];
  if (rawItems.length === 0) return [];

  return rawItems.map((item) => {
    const linkEl = item.querySelector("link");
    const link =
      linkEl?.textContent?.trim() ||
      linkEl?.getAttribute("href") ||
      "";
    const ytVideoId =
      item.querySelector("videoId")?.textContent?.trim() ||
      link.match(/(?:v=|youtu\.be\/|\/embed\/|shorts\/)([\w-]{11})/)?.[1];

    return {
      title: item.querySelector("title")?.textContent?.trim() || "",
      link,
      pubDate:
        item
          .querySelector("pubDate, published, updated")
          ?.textContent?.trim() || "",
      description: (
        item.querySelector("description, summary")?.textContent || ""
      )
        .replace(/<[^>]+>/g, "")
        .trim()
        .slice(0, 160),
      thumbnail: ytVideoId
        ? `https://i.ytimg.com/vi/${ytVideoId}/mqdefault.jpg`
        : "",
      videoId: ytVideoId,
    };
  });
}

async function fetchRSSViaProxy(feedUrl: string): Promise<RSSItem[]> {
  const cached = _rssCache.get(feedUrl);
  if (cached && Date.now() - cached.ts < RSS_CACHE_TTL) return cached.items;

  const _skipRss2json =
    feedUrl.includes("youtube.com/feeds") ||
    feedUrl.includes("tumblr.com/rss");

  if (!_skipRss2json) {
    try {
      const res = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === "ok" && Array.isArray(data.items) && data.items.length > 0) {
          const items: RSSItem[] = data.items.map((item: any) => ({
            title: item.title || "",
            link: item.link || "",
            pubDate: item.pubDate || "",
            description: (item.description || "")
              .replace(/<[^>]+>/g, "")
              .trim()
              .slice(0, 160),
            thumbnail:
              item.thumbnail ||
              (item.enclosure?.link) ||
              "",
            videoId: (item.link || "").match(
              /(?:v=|youtu\.be\/|\/embed\/|shorts\/)([\w-]{11})/
            )?.[1],
          }));
          _rssCache.set(feedUrl, { ts: Date.now(), items });
          return items;
        }
      }
    } catch (_e) {}
  }

  const proxyStartIndex = feedUrl.includes("youtube.com/feeds") ? 1 : 0;

  for (let pi = proxyStartIndex; pi < CORS_PROXIES.length; pi++) {
    const proxy = CORS_PROXIES[pi];
    const endpoint = proxy.make(feedUrl);
    if (!endpoint) continue;

    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), pi === 0 ? 5000 : 7000);

      const res = await fetch(endpoint, {
        signal: ctrl.signal,
        headers: { Accept: "application/rss+xml, application/json, text/xml, */*" },
      });
      clearTimeout(tid);

      if (!res.ok) continue;

      let text = await res.text();
      if (proxy.extract) text = proxy.extract(text);
      if (!text || text.trim().length < 10) continue;

      if (text.trim().startsWith("{")) {
        try {
          const data = JSON.parse(text);
          if (data.status === "ok" && Array.isArray(data.items) && data.items.length > 0) {
            const items: RSSItem[] = data.items.map((item: any) => ({
              title: item.title || "",
              link: item.link || "",
              pubDate: item.pubDate || "",
              description: (item.description || "")
                .replace(/<[^>]+>/g, "")
                .trim()
                .slice(0, 160),
              thumbnail:
                item.thumbnail || (item.enclosure?.link) || "",
              videoId: (item.link || "").match(
                /(?:v=|youtu\.be\/|\/embed\/|shorts\/)([\w-]{11})/
              )?.[1],
            }));
            _rssCache.set(feedUrl, { ts: Date.now(), items });
            return items;
          }
        } catch (_je) {}
      }

      const items = await _parseXmlItems(text);
      if (items.length > 0) {
        _rssCache.set(feedUrl, { ts: Date.now(), items });
        return items;
      }
    } catch (_pe) {
      continue;
    }
  }

  return [];
}

const _rssPending = new Map<string, Promise<RSSItem[]>>();

function useRSSFeed(url: string, count = 3) {
  const [items, _setItems] = _s<RSSItem[]>([]);
  const [loading, _setLoading] = _s(true);

  _e(() => {
    let cancelled = false;
    _setLoading(true);

    const doFetch = (): Promise<RSSItem[]> => {
      if (_rssPending.has(url)) return _rssPending.get(url)!;
      const p = fetchRSSViaProxy(url).finally(() => _rssPending.delete(url));
      _rssPending.set(url, p);
      return p;
    };

    doFetch()
      .then((data) => {
        if (!cancelled) {
          _setItems(data.slice(0, count));
          _setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) _setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url, count]);

  return { items, loading };
}

function useYouTubeFeed(handle: string, count = 4) {
  const [items, _setItems] = _s<RSSItem[]>([]);
  const [loading, _setLoading] = _s(true);

  const CHANNEL_ID = "UCCtKrAzh4V8u573Is973jzA";

  _e(() => {
    let cancelled = false;

    async function load() {
      try {
        _setLoading(true);
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

        const doFetch = (): Promise<RSSItem[]> => {
          if (_rssPending.has(feedUrl)) return _rssPending.get(feedUrl)!;
          const p = fetchRSSViaProxy(feedUrl).finally(() =>
            _rssPending.delete(feedUrl)
          );
          _rssPending.set(feedUrl, p);
          return p;
        };

        const data = await doFetch();
        if (data && data.length > 0 && !cancelled) {
          _setItems(data.slice(0, count));
        }
      } catch (err) {}
      finally {
        if (!cancelled) _setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [CHANNEL_ID, count]);

  return { items, loading, channelId: CHANNEL_ID };
}

// ── ParsedBlock type ──────────────────────────────────────────────────────────
type ParsedBlock =
  | { type: "text"; html: string }
  | { type: "tweet"; url: string }
  | { type: "fullhtml"; html: string; styles: string; scopeId: string; rawHtml: string }
  | { type: "journalhtml"; html: string; scopeId: string };

// ── FullHtmlBlockProps type ───────────────────────────────────────────────────
type FullHtmlBlockProps = {
  body: string;
  styles: string;
  scopeId: string;
  rawHtml: string;
  journalHtml?: string;
};

// ── YouTube URL helpers ───────────────────────────────────────────────────────
function _extractYouTubeId(url: string): string | null {
  return (
    url.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1] || null
  );
}

function _isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

// ── injectYouTubeCards ────────────────────────────────────────────────────────
function injectYouTubeCards(html: string): string {
  const pWithYtLink = /<p[^>]*>([\s\S]*?)<\/p>/gi;

  return html.replace(pWithYtLink, (pMatch, inner) => {
    const linkMatches = [...inner.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];

    const ytLinks = linkMatches.filter(m => _isYouTubeUrl(m[1]));
    if (ytLinks.length === 0) return pMatch;

    let result = pMatch;

    for (const linkMatch of ytLinks) {
      const fullAnchor = linkMatch[0];
      const href = linkMatch[1];
      const videoId = _extractYouTubeId(href);
      const thumbUrl = videoId
        ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        : "";

      let displayUrl = href;
      try {
        const u = new URL(href);
        displayUrl = u.hostname.replace("www.", "") + u.pathname + (u.search.slice(0, 20) || "");
        if (displayUrl.length > 38) displayUrl = displayUrl.slice(0, 36) + "…";
      } catch {}

      const cardHtml = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="yt-card-wrap" aria-label="Watch on YouTube">
  <div class="yt-card">
    <div class="yt-card-thumb">
      ${thumbUrl
        ? `<img src="${thumbUrl}" alt="YouTube thumbnail" loading="lazy" />`
        : `<div style="width:100%;height:100%;background:#111;"></div>`
      }
      <div class="yt-card-play">
        <div class="yt-card-play-btn">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white" style="margin-left:3px"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <span class="yt-card-badge">▶ YouTube</span>
    </div>
    <div class="yt-card-info">
      <div class="yt-card-yt-icon">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </div>
      <div class="yt-card-text">
        <span class="yt-card-label">Tonton di YouTube</span>
        <span class="yt-card-url">${displayUrl}</span>
      </div>
      <span class="yt-card-arrow">↗</span>
    </div>
  </div>
</a>`;

      result = result.replace(fullAnchor, cardHtml);
    }

    return result;
  });
}

// ── isHtmlContent ─────────────────────────────────────────────────────────────
function isFullHtmlDocument(text: string): boolean {
  return /<!doctype\s+html/i.test(text) || /<html[\s>]/i.test(text);
}

function isHtmlContent(text: string): boolean {
  return /<(p|h[1-6]|ul|ol|li|blockquote|strong|em|a|br|div|span|table|thead|tbody|tr|td|th|img|hr|pre|code)[^>]*>/i.test(text);
}

// ── extractBodyWithStyles ─────────────────────────────────────────────────────
function extractBodyWithStyles(html: string): { body: string; styles: string } {
  const styleBlocks: string[] = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch: RegExpExecArray | null;
  while ((styleMatch = styleRegex.exec(html)) !== null) {
    styleBlocks.push(styleMatch[1]);
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = "";
  if (bodyMatch) {
    body = bodyMatch[1]
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .trim();
  } else {
    body = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<!doctype[^>]*>/gi, "")
      .replace(/<html[^>]*>/gi, "")
      .replace(/<\/html>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<body[^>]*>/gi, "")
      .replace(/<\/body>/gi, "")
      .trim();
  }

  const styles = styleBlocks.join("\n");
  return { body, styles };
}

function fmtHtml(text: string): string {
  if (isFullHtmlDocument(text)) {
    const { body } = extractBodyWithStyles(text);
    return injectYouTubeCards(body);
  }
  if (isHtmlContent(text)) {
    return injectYouTubeCards(text);
  }
  return text
    .replace(
      /\*\*(.*?)\*\*/g,
      `<strong class="font-black text-black dark:text-white">$1</strong>`
    )
    .replace(/\*(.*?)\*/g, `<em class="italic text-red-700">$1</em>`);
}

// ── Default Journal CSS (cream/gold palette) ──────────────────────────────────
const JOURNAL_CSS = `:root{--ink:#0d0d0d;--ink-mid:#1a1a1a;--ink-soft:#2c2c2c;--cream:#f5f0e8;--cream-deep:#ede6d6;--gold:#b8952a;--gold-light:#d4aa40;--rust:#8b3a2a;--steel:#4a5568;--mist:#9ca3af;--rule:#c9b882;--font-display:'Playfair Display',Georgia,serif;--font-body:'Cormorant Garamond',Georgia,serif;--font-mono:'Space Mono',monospace;}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}body{background:var(--cream);color:var(--ink);font-family:var(--font-body);font-size:18px;line-height:1.75;font-weight:300;-webkit-font-smoothing:antialiased;width:100%;max-width:100%;overflow-x:hidden;}img{display:block;max-width:100%;height:auto;}a{color:var(--gold);text-decoration:none;}a:hover{color:var(--rust);}.masthead{background:var(--ink);color:var(--cream);padding:0;position:relative;overflow:hidden;}.masthead::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.015) 2px,rgba(255,255,255,0.015) 4px);pointer-events:none;}.masthead-inner{max-width:100%;margin:0 auto;padding:0 1rem;}.masthead-topbar{display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid rgba(184,149,42,0.4);font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.12em;color:var(--mist);text-transform:uppercase;}.masthead-topbar .issue-tag{background:var(--gold);color:var(--ink);padding:0.2em 0.7em;font-weight:700;}.masthead-logo{text-align:center;padding:2.5rem 0 1.5rem;border-bottom:3px double rgba(184,149,42,0.5);}.masthead-logo .journal-name{font-family:var(--font-display);font-size:clamp(2.8rem,7vw,5.5rem);font-weight:900;color:var(--cream);line-height:1;}.masthead-logo .journal-tagline{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.3em;color:var(--gold);text-transform:uppercase;margin-top:0.5rem;}.hero{background:var(--ink);display:grid;grid-template-columns:1fr 1fr;}.hero-image{position:relative;overflow:hidden;min-height:280px;}.hero-image img{width:100%;height:100%;object-fit:cover;object-position:center top;filter:grayscale(30%) contrast(1.1);transition:transform 6s ease;}.hero-image:hover img{transform:scale(1.04);}.hero-image::after{content:'';position:absolute;inset:0;background:linear-gradient(to right,transparent 60%,var(--ink));}.hero-content{padding:3.5rem 3rem 3.5rem 2.5rem;display:flex;flex-direction:column;justify-content:center;}.hero-category{font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.3em;color:var(--gold);text-transform:uppercase;margin-bottom:1.2rem;display:flex;align-items:center;gap:0.8rem;}.hero-category::before{content:'';display:block;width:30px;height:1px;background:var(--gold);}.hero-headline{font-family:var(--font-display);font-size:clamp(2rem,4vw,3.4rem);font-weight:700;color:var(--cream);line-height:1.15;margin-bottom:1.5rem;}.hero-headline em{font-style:italic;color:var(--gold-light);}.hero-deck{font-family:var(--font-body);font-size:1.05rem;color:rgba(245,240,232,0.75);line-height:1.6;font-style:italic;margin-bottom:2rem;border-left:2px solid var(--gold);padding-left:1rem;}.hero-byline{display:flex;align-items:center;gap:1rem;font-family:var(--font-mono);font-size:0.62rem;color:var(--mist);letter-spacing:0.1em;text-transform:uppercase;}.hero-byline .author-name{color:var(--gold-light);font-weight:700;}.journal-wrapper{max-width:100%;margin:0 auto;padding:0 1rem;}.rule-divider{display:flex;align-items:center;gap:1rem;padding:2rem 0;color:var(--rule);font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.25em;text-transform:uppercase;}.rule-divider::before,.rule-divider::after{content:'';flex:1;height:1px;background:linear-gradient(to right,transparent,var(--rule),transparent);}.section-opening{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1.5px solid var(--ink);margin:2.5rem 0;}.opening-text{padding:2.8rem 2.5rem;border-right:1.5px solid var(--ink);}.opening-text p{font-size:1.12rem;line-height:1.8;margin-bottom:1.2rem;}.opening-image{position:relative;overflow:hidden;min-height:200px;}.opening-image img{width:100%;height:100%;object-fit:cover;filter:sepia(15%) contrast(1.05);}.opening-image .img-caption{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(13,13,13,0.85));color:rgba(245,240,232,0.8);font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;padding:1.5rem 1rem 0.8rem;}.pull-quote-box{border:1.5px solid var(--ink);margin:2.5rem 0;padding:2.5rem 3rem;background:var(--ink);position:relative;}.pull-quote-box blockquote{font-family:var(--font-display);font-size:clamp(1.4rem,3vw,2rem);font-style:italic;color:var(--cream);line-height:1.45;position:relative;z-index:1;}.pull-quote-box cite{display:block;font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.2em;color:var(--gold);text-transform:uppercase;margin-top:1.2rem;font-style:normal;}.three-col-grid{display:grid;grid-template-columns:repeat(3,1fr);border:1.5px solid var(--ink);margin:2.5rem 0;}.col-box{padding:2rem 1.8rem;border-right:1.5px solid var(--ink);}.col-box:last-child{border-right:none;}.col-box h3{font-family:var(--font-display);font-size:1rem;font-weight:700;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid var(--rule);}.col-box p{font-size:0.95rem;line-height:1.7;color:var(--ink-soft);}.image-strip{display:grid;grid-template-columns:repeat(4,1fr);border:1.5px solid var(--ink);margin:2.5rem 0;}.strip-item{position:relative;overflow:hidden;border-right:1.5px solid var(--ink);aspect-ratio:3/4;}.strip-item:last-child{border-right:none;}.strip-item img{width:100%;height:100%;object-fit:cover;filter:grayscale(20%);}.strip-item .strip-label{position:absolute;bottom:0;left:0;right:0;background:var(--ink);color:var(--gold);font-family:var(--font-mono);font-size:0.5rem;letter-spacing:0.2em;text-transform:uppercase;padding:0.5rem;text-align:center;}.body-section{border:1.5px solid var(--ink);display:grid;grid-template-columns:2fr 1fr;gap:0;margin:2.5rem 0;}.body-main{padding:2.8rem 2.5rem;border-right:1.5px solid var(--ink);}.body-main h2{font-family:var(--font-display);font-size:1.9rem;font-weight:700;margin-bottom:1.2rem;}.body-main p{font-size:1.05rem;line-height:1.85;margin-bottom:1.3rem;color:var(--ink-soft);}.body-sidebar{padding:2.5rem 1.8rem;background:var(--cream-deep);display:flex;flex-direction:column;gap:2rem;}.sidebar-fact{border-left:3px solid var(--gold);padding-left:1rem;}.sidebar-fact .fact-num{font-family:var(--font-display);font-size:2.5rem;font-weight:900;color:var(--gold);line-height:1;}.sidebar-fact .fact-label{font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--steel);margin-top:0.3rem;}.sidebar-fact .fact-desc{font-size:0.88rem;color:var(--ink-soft);line-height:1.5;margin-top:0.5rem;}.full-width-image{border:1.5px solid var(--ink);margin:2.5rem 0;position:relative;overflow:hidden;}.full-width-image img{width:100%;aspect-ratio:16/7;object-fit:cover;object-position:center 30%;filter:contrast(1.05) saturate(0.9);}.full-width-image .overlay-text{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(13,13,13,0.9) 60%);padding:4rem 3rem 2rem;}.full-width-image .overlay-text h2{font-family:var(--font-display);font-size:clamp(1.5rem,4vw,2.8rem);font-weight:900;color:var(--cream);letter-spacing:-0.02em;line-height:1.2;}.full-width-image .overlay-text h2 em{color:var(--gold-light);font-style:italic;}.two-col-story{display:grid;grid-template-columns:1fr 1fr;border:1.5px solid var(--ink);margin:2.5rem 0;}.story-image{overflow:hidden;min-height:200px;}.story-image img{width:100%;height:100%;object-fit:cover;}.story-text{padding:2.5rem 2.2rem;border-left:1.5px solid var(--ink);display:flex;flex-direction:column;justify-content:center;}.story-text h2{font-family:var(--font-display);font-size:1.7rem;font-weight:700;margin-bottom:1.2rem;line-height:1.25;}.story-text p{font-size:1rem;line-height:1.8;color:var(--ink-soft);margin-bottom:1.1rem;}.twitter-grid{display:grid;grid-template-columns:1fr 1fr;border:1.5px solid var(--ink);margin:2.5rem 0;}.twitter-box{padding:2rem 1.8rem;border-right:1.5px solid var(--ink);background:var(--cream-deep);}.twitter-box:last-child{border-right:none;background:var(--ink);}.tw-card{border:1px solid rgba(0,0,0,0.15);border-radius:2px;padding:1.2rem;background:white;margin-bottom:0.8rem;}.gallery-grid{display:grid;grid-template-columns:1fr 1fr 1fr;border:1.5px solid var(--ink);margin:2.5rem 0;}.gallery-item{overflow:hidden;border-right:1.5px solid var(--ink);border-bottom:1.5px solid var(--ink);}.gallery-item:nth-child(3n){border-right:none;}.gallery-item:nth-last-child(-n+3){border-bottom:none;}.gallery-item.span-2{grid-column:span 2;}.gallery-item img{width:100%;height:260px;object-fit:cover;}.essay-block{border:1.5px solid var(--ink);margin:2.5rem 0;}.essay-header{padding:1.5rem 2.5rem;background:var(--ink);border-bottom:1.5px solid var(--ink);display:flex;justify-content:space-between;align-items:center;}.essay-header h2{font-family:var(--font-display);font-size:1.4rem;font-weight:700;font-style:italic;color:var(--cream);}.essay-body{padding:2.5rem;}.essay-body p{font-size:1.08rem;line-height:1.9;margin-bottom:1.4rem;color:var(--ink-soft);}.essay-body .italic-line{font-style:italic;color:var(--gold);font-size:1.12rem;font-family:var(--font-display);}.final-image-row{display:grid;grid-template-columns:3fr 2fr;border:1.5px solid var(--ink);margin:2.5rem 0;}.final-image-row .img-left{overflow:hidden;min-height:200px;}.final-image-row .img-left img{width:100%;height:100%;object-fit:cover;}.final-image-row .img-right-stack{display:flex;flex-direction:column;border-left:1.5px solid var(--ink);}.final-image-row .img-right-stack .img-top{border-bottom:1.5px solid var(--ink);overflow:hidden;flex:1;}.final-image-row .img-right-stack .img-top img{width:100%;height:100%;object-fit:cover;}.final-image-row .img-right-stack .img-bottom{overflow:hidden;flex:1;}.final-image-row .img-right-stack .img-bottom img{width:100%;height:100%;object-fit:cover;} .article-footer{border:1.5px solid var(--ink);margin:2.5rem 0 0.5rem;background:var(--ink);padding:2.5rem;display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start;}.article-footer h4{font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--cream);margin-bottom:0.5rem;}.article-footer .author-role{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:1rem;}.article-footer p{font-size:0.9rem;color:rgba(245,240,232,0.75);line-height:1.7;}.article-footer .tags-list{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1rem;}.article-footer .tag{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;padding:0.3em 0.8em;border:1px solid rgba(184,149,42,0.5);color:var(--gold);}.section-title-box{border:1.5px solid var(--ink);border-bottom:none;padding:1rem 2rem;background:var(--cream-deep);display:flex;align-items:center;gap:1.5rem;}.reading-meta{display:flex;align-items:center;gap:1.5rem;padding:0.8rem 0;font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--steel);}.drop-cap::first-letter{font-family:var(--font-display);font-size:5rem;font-weight:900;float:left;line-height:0.75;margin:0.1em 0.12em 0 0;color:var(--gold);border-bottom:3px solid var(--gold);padding-bottom:0.05em;}.tw-header{display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;}.tw-icon{width:18px;height:18px;flex-shrink:0;}.tw-label{font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);}.tw-handle{font-family:var(--font-mono);font-size:0.7rem;font-weight:700;color:var(--gold);margin-bottom:0.4rem;}.tw-text{font-size:0.9rem;line-height:1.6;color:#1a1a1a;margin-bottom:0.5rem;}.tw-date{display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.6rem;color:#666;}.tw-link{color:var(--gold);text-decoration:none;}.col-number{font-family:var(--font-mono);font-size:2.5rem;font-weight:700;color:var(--cream-deep);line-height:1;margin-bottom:0.5rem;-webkit-text-stroke:1.5px var(--ink);}@media(max-width:700px){.hero{grid-template-columns:1fr;}.hero-image{min-height:200px;}.section-opening,.body-section,.two-col-story{grid-template-columns:1fr;}.opening-text{border-right:none;border-bottom:1.5px solid var(--ink);}.story-text{border-left:none;border-top:1.5px solid var(--ink);}.body-sidebar{border-top:1.5px solid var(--ink);}.three-col-grid{grid-template-columns:1fr;}.col-box{border-right:none;border-bottom:1.5px solid var(--ink);}.col-box:last-child{border-bottom:none;}.image-strip{grid-template-columns:1fr 1fr;}.strip-item:nth-child(2n){border-right:none;}.twitter-grid{grid-template-columns:1fr;}.twitter-box{border-right:none;border-bottom:1.5px solid var(--ink);}.gallery-grid{grid-template-columns:1fr 1fr;}.gallery-item.span-2{grid-column:span 2;}.final-image-row{grid-template-columns:1fr;}.final-image-row .img-right-stack{border-left:none;border-top:1.5px solid var(--ink);flex-direction:row;}.final-image-row .img-right-stack .img-top{border-right:1.5px solid var(--ink);border-bottom:none;}.article-footer{grid-template-columns:1fr;}}@media(max-width:860px){.hero{grid-template-columns:1fr;}.section-opening,.body-section,.two-col-story{grid-template-columns:1fr;}.three-col-grid{grid-template-columns:1fr;}.image-strip{grid-template-columns:1fr 1fr;}.twitter-grid{grid-template-columns:1fr;}.gallery-grid{grid-template-columns:1fr 1fr;}.final-image-row{grid-template-columns:1fr;}.article-footer{grid-template-columns:1fr;}}@media(max-width:560px){body{font-size:16px;}.gallery-grid{grid-template-columns:1fr;}}`;

// ── Theme selector — picks CSS based on class name found in HTML fragment ─────
function _selectJournalCss(html: string): string {
  if (/journal-theme-ocean/i.test(html))  return JOURNAL_CSS_OCEAN;
  if (/journal-theme-forest/i.test(html)) return JOURNAL_CSS_FOREST;
  if (/journal-theme-rose/i.test(html))   return JOURNAL_CSS_ROSE;
  if (/journal-theme-slate/i.test(html))  return JOURNAL_CSS_SLATE;
  if (/journal-theme-ember/i.test(html))  return JOURNAL_CSS_EMBER;
  if (/journal-theme-dusk/i.test(html))   return JOURNAL_CSS_DUSK;
  if (/journal-theme-noir/i.test(html))   return JOURNAL_CSS_NOIR;
  if (/journal-theme-sage/i.test(html))   return JOURNAL_CSS_SAGE;
  return JOURNAL_CSS;
}

// ─────────────────────────────────────────────────────────────────────────────
// FullHtmlBlock — renders full HTML document content inside a sandboxed iframe.
// ─────────────────────────────────────────────────────────────────────────────

function FullHtmlBlock({ body, styles, scopeId, rawHtml, journalHtml }: FullHtmlBlockProps) {
  const iframeRef = _uR<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = _s<number>(0);

  // Inject Google Fonts ke parent document
  _e(() => {
    const fontsNeeded = [
      "Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600",
      "Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400",
      "Space+Mono:wght@400;700",
    ];
    fontsNeeded.forEach((font) => {
      const href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);

  const srcdoc = _uM(() => {
    const heightScript = `<script>
(function(){
  var lastH = 0;
  var stableCount = 0;
  var STABLE_THRESHOLD = 3;
  var scopeId = '${scopeId}';
  var roActive = true;

  function send(h) {
    if (!h || h < 20) return;
    if (Math.abs(h - lastH) < 2) {
      stableCount++;
      return;
    }
    lastH = h;
    stableCount = 0;
    window.parent.postMessage({ type: 'iframeHeight', scopeId: scopeId, height: h }, '*');
  }

  function measure() {
    var body  = document.body;
    var docEl = document.documentElement;
    if (!body) return 0;
    var h = Math.max(
      body.offsetHeight   || 0,
      docEl.offsetHeight  || 0
    );
    if (h === 0) {
      h = Math.max(body.scrollHeight || 0, docEl.scrollHeight || 0);
    }
    return Math.ceil(h);
  }

  function poll() {
    if (stableCount >= STABLE_THRESHOLD) return;
    var h = measure();
    if (h > 0) send(h);
  }

  function setupObserver() {
    if (typeof ResizeObserver === 'undefined') return;
    var ro = new ResizeObserver(function(entries) {
      if (!roActive) return;
      var bodyEntry = entries.find(function(e){ return e.target === document.body; });
      if (!bodyEntry) return;
      requestAnimationFrame(function(){
        var h = measure();
        if (Math.abs(h - lastH) > 4) {
          stableCount = 0;
          send(h);
        }
      });
    });
    if (document.body) ro.observe(document.body);
  }

  function watchImages() {
    function attachToImg(img) {
      if (img.complete) {
        setTimeout(poll, 50);
      } else {
        img.addEventListener('load',  function() { stableCount = 0; setTimeout(poll, 50); }, { once: true });
        img.addEventListener('error', function() { setTimeout(poll, 50); }, { once: true });
      }
    }
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) attachToImg(imgs[i]);

    if (typeof MutationObserver !== 'undefined') {
      var mo = new MutationObserver(function(mutations) {
        for (var m = 0; m < mutations.length; m++) {
          var added = mutations[m].addedNodes;
          for (var n = 0; n < added.length; n++) {
            var node = added[n];
            if (node.nodeName === 'IMG') attachToImg(node);
            if (node.querySelectorAll) {
              var nested = node.querySelectorAll('img');
              for (var k = 0; k < nested.length; k++) attachToImg(nested[k]);
            }
          }
        }
      });
      mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
  }

  function waitFonts(cb) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function() { cb(); });
    } else {
      setTimeout(cb, 400);
    }
  }

  function init() {
    poll();
    requestAnimationFrame(poll);
    setupObserver();
    watchImages();
    waitFonts(function() {
      stableCount = 0;
      poll();
      requestAnimationFrame(poll);
    });

    var pollTimes = [100, 300, 600, 1000, 1600, 2400, 3500, 5000];
    for (var t = 0; t < pollTimes.length; t++) {
      (function(delay){ 
        setTimeout(function(){ 
          if (stableCount < STABLE_THRESHOLD) poll(); 
        }, delay); 
      })(pollTimes[t]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { init(); }, { once: true });
  } else {
    init();
  }

  window.addEventListener('load', function() {
    stableCount = 0;
    poll();
    setTimeout(poll, 300);
    setTimeout(poll, 1000);
  }, { once: true });
})();
<\/script>`;

    // ── Case 1: Journal HTML fragment — inject theme-selected CSS ────────────
    if (journalHtml) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
<style>${_selectJournalCss(journalHtml)}</style>
</head>
<body>
${journalHtml}
${heightScript}
</body>
</html>`;
    }

    const isFullDoc = /<!doctype\s+html/i.test(rawHtml) || /<html[\s>]/i.test(rawHtml);

    if (isFullDoc) {
      if (/<\/body>/i.test(rawHtml)) {
        return rawHtml.replace(/<\/body>/i, `${heightScript}</body>`);
      }
      return rawHtml + heightScript;
    }

    // Plain HTML fragment: wrap in full HTML shell with injected styles
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Cormorant Garamond',Georgia,serif;}
img{max-width:100%;height:auto;display:block;}
${styles}
</style>
</head>
<body>
${body}
${heightScript}
</body>
</html>`;
  }, [rawHtml, body, styles, scopeId, journalHtml]);

  // ── Listener postMessage ──────────────────────────────────────────────────
  _e(() => {
    const handler = (ev: MessageEvent) => {
      if (
        ev.data &&
        ev.data.type === "iframeHeight" &&
        ev.data.scopeId === scopeId &&
        typeof ev.data.height === "number" &&
        ev.data.height > 20
      ) {
        setIframeHeight((prev) => {
          const next = Math.ceil(ev.data.height);
          if (Math.abs(next - prev) < 4) return prev;
          if (next < prev && prev - next < 20) return prev;
          return next;
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [scopeId]);

  return (
    <div
      data-db-scope={scopeId}
      className="db-html-document-wrapper w-full"
      style={{ contain: "layout", willChange: "contents" }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={srcdoc}
        title="Article layout content"
        sandbox="allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
        style={{
          width: "100%",
          height: iframeHeight > 0 ? `${iframeHeight}px` : "1px",
          minHeight: iframeHeight > 0 ? 0 : "100vh",
          border: "none",
          display: "block",
          overflow: "hidden",
        }}
        scrolling="no"
        aria-label="Article layout content"
      />
    </div>
  );
}

// ── parseParagraphs ───────────────────────────────────────────────────────────
function parseParagraphs(paragraphs: string[]): ParsedBlock[] {
  const result: ParsedBlock[] = [];

  const standaloneTweetRe =
    /^(?:<[^>]+>)*\s*(https?:\/\/(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/statuse?s?\/\d+[^\s<"]*)\s*(?:<\/[^>]+>)*$/i;

  const inlineTweetRe =
    /https?:\/\/(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/statuse?s?\/\d+[^\s<"]*/gi;

  for (const raw of paragraphs) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (isFullHtmlDocument(trimmed)) {
      const { body, styles } = extractBodyWithStyles(trimmed);
      const hash = Array.from(trimmed.slice(0, 128))
        .reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
        .toString(36)
        .replace(/-/g, "n");
      const scopeId = `dbscope_${hash}`;
      result.push({ type: "fullhtml", html: body, styles, scopeId, rawHtml: trimmed });
      continue;
    }

    if (isHtmlContent(trimmed)) {
      if (needsJournalIframe(trimmed)) {
        const hash = Array.from(trimmed.slice(0, 128))
          .reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0)
          .toString(36)
          .replace(/-/g, "n");
        const scopeId = `jscope_${hash}`;
        result.push({ type: "journalhtml", html: trimmed, scopeId });
      } else {
        result.push({ type: "text", html: fmtHtml(trimmed) });
      }
      continue;
    }

    const standaloneMatch = trimmed.match(standaloneTweetRe);
    if (standaloneMatch) {
      result.push({ type: "tweet", url: standaloneMatch[1] });
      continue;
    }

    const matches = [...trimmed.matchAll(inlineTweetRe)];
    if (matches.length > 0) {
      let cursor = 0;
      for (const match of matches) {
        const start = match.index!;
        const end = start + match[0].length;
        const before = trimmed.slice(cursor, start).trim();
        if (before) result.push({ type: "text", html: fmtHtml(before) });
        result.push({ type: "tweet", url: match[0] });
        cursor = end;
      }
      const after = trimmed.slice(cursor).trim();
      if (after) result.push({ type: "text", html: fmtHtml(after) });
      continue;
    }

    result.push({ type: "text", html: fmtHtml(trimmed) });
  }

  return result;
}

// ── needsJournalIframe ────────────────────────────────────────────────────────
// Detect HTML fragments that use journal layout classes (including all 8 themes)
// and therefore need to be rendered inside an iframe with journal CSS injected.
function needsJournalIframe(html: string): boolean {
  const journalPatterns = [
    /class=["'][^"']*(?:masthead|hero|section-opening|pull-quote|three-col-grid|image-strip|body-section|gallery-grid|essay-block|article-footer|journal-wrapper|rule-divider|drop-cap)/,
    /class=["'][^"']*journal/,
    /journal-theme-(?:ocean|forest|rose|slate|ember|dusk|noir|sage)/,
  ];
  return journalPatterns.some(pattern => pattern.test(html));
}

function safeBlobRevoke(url: string | null) {
  if (!url || !url.startsWith("blob:")) return;
  try {
    URL.revokeObjectURL(url);
  } catch {}
}

function formatRSSDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr.slice(0, 16);
  }
}

function SuspenseFallbackWidget() {
  return (
    <div className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111] animate-pulse">
      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-2">
            <div className="h-2 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>
        <div className="h-32 w-full bg-neutral-100 dark:bg-neutral-900 rounded-xl" />
        <div className="h-3 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>
    </div>
  );
}

function SuspenseFallbackArticle() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="w-20 h-[3px] bg-red-600 animate-pulse" />
    </div>
  );
}

function SuspenseFallbackComments() {
  return (
    <div className="max-w-[840px] mx-auto py-16 border-t-2 border-neutral-100 dark:border-neutral-900 px-4 md:px-0">
      <div className="animate-pulse space-y-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
        <div className="h-40 w-full bg-neutral-100 dark:bg-neutral-900 rounded-xl border-2 border-neutral-200 dark:border-neutral-800" />
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-4">
              <div className="w-14 h-14 bg-neutral-200 dark:bg-neutral-800 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-900 rounded" />
                <div className="h-4 w-3/4 bg-neutral-100 dark:bg-neutral-900 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function YouTubeSEONode() {
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
      <span itemScope itemType="https://schema.org/VideoChannel">
        <span data-href={YOUTUBE_CHANNEL_URL} itemProp="url" data-rel="noopener noreferrer">
          YouTube Channel — @{YOUTUBE_CHANNEL_HANDLE}
        </span>
        <span itemProp="name" content={YOUTUBE_CHANNEL_HANDLE} />
        <span
          itemProp="description"
          content={`Watch videos and shorts on YouTube channel @${YOUTUBE_CHANNEL_HANDLE}. Subscribe for the latest content from Brawnly.`}
        />
        <span itemProp="sameAs" content={YOUTUBE_CHANNEL_URL} />
      </span>
      <meta name="youtube:channel" content={YOUTUBE_CHANNEL_HANDLE} />
      <meta name="youtube:channel:url" content={YOUTUBE_CHANNEL_URL} />
    </div>
  );
}

function SubstackSEONode() {
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
      <span itemScope itemType="https://schema.org/NewsArticle">
        <a href={SUBSTACK_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
          {SUBSTACK_POST_TITLE}
        </a>
        <span itemProp="headline" content={SUBSTACK_POST_TITLE} />
        <span itemProp="description" content={SUBSTACK_POST_DESC} />
        <span itemProp="author" content="deulo" />
        <span itemProp="publisher" content="Substack — deulo" />
        <span itemProp="sameAs" content={SUBSTACK_ROOT_URL} />
      </span>
      <span itemScope itemType="https://schema.org/Blog">
        <a href={SUBSTACK_ROOT_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
          Read all posts on Substack — deulo
        </a>
        <span itemProp="name" content="deulo on Substack" />
      </span>
      <meta name="substack:publication" content="deulo" />
      <meta name="substack:post:title" content={SUBSTACK_POST_TITLE} />
    </div>
  );
}

function PinterestSEONode() {
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
        <a href={PINTEREST_PROFILE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
          Pinterest — mustbeloveonthebrain
        </a>
        <span itemProp="name" content="mustbeloveonthebrain" />
        <span itemProp="sameAs" content={PINTEREST_PROFILE_URL} />
        <span
          itemProp="description"
          content="Discover pins and boards by mustbeloveonthebrain on Pinterest — curated visual content."
        />
      </span>
      <meta name="pinterest:profile" content="mustbeloveonthebrain" />
    </div>
  );
}

function ClashRoyaleSEONode() {
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
        <span itemProp="name" content={CR_PLAYER_NAME} />
        <span itemProp="identifier" content={CR_PLAYER_TAG} />
        <span
          itemProp="description"
          content={`Clash Royale player ${CR_PLAYER_NAME} — Tag: #${CR_PLAYER_TAG}, ID: ${CR_PLAYER_ID}. Level 53, 109K+ Gold. View battles, deck stats, and trophies on RoyaleAPI.`}
        />
        <a href={CR_ROYALEAPI_PROFILE} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
          View Clash Royale profile — {CR_PLAYER_NAME} #{CR_PLAYER_TAG}
        </a>
        <a href={CR_ROYALEAPI_BATTLES} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
          View Clash Royale battles — {CR_PLAYER_NAME}
        </a>
        <a href={CR_ADD_FRIEND_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
          Add {CR_PLAYER_NAME} as friend in Clash Royale
        </a>
      </span>
      <meta name="clashroyale:player:tag" content={CR_PLAYER_TAG} />
      <meta name="clashroyale:player:name" content={CR_PLAYER_NAME} />
      <meta name="clashroyale:player:id" content={CR_PLAYER_ID} />
    </div>
  );
}

function DanaWidget() {
  const [_sent, _setSent] = _s(false);

  return (
    <div
      className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl"
      style={{ background: "#118EEA" }}
    >
      <div className="h-1.5 w-full" style={{ background: "#0B6FBD" }} />

      <div className="px-6 pt-6 pb-5 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <svg
              viewBox="0 0 120 40"
              className="w-12 h-auto"
              aria-label="DANA"
              role="img"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="50%"
                y="30"
                textAnchor="middle"
                fill="white"
                fontFamily="Arial, sans-serif"
                fontWeight="900"
                fontSize="28"
                letterSpacing="2"
              >
                DANA
              </text>
            </svg>
          </div>

          <div className="text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/70 leading-none mb-1">
              Kirim Dana ke
            </p>
            <p className="text-[22px] font-black uppercase tracking-tight text-white leading-none">
              {DANA_NAME}
            </p>
          </div>

          <p className="text-[11px] font-serif italic text-white/80 text-center leading-snug">
            Kirim dana ke {DANA_NAME}?
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full max-w-[200px]">
          <a
            href={DANA_LINK_1}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Kirim dana ke ${DANA_NAME} via DANA`}
            onClick={() => _setSent(true)}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-md transition-all duration-200 active:scale-95"
            style={{ background: "white", color: "#118EEA" }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0" aria-hidden="true">
              <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm11-1V7h-2v4H7l5 5 5-5h-4z" />
            </svg>
            Kirim Sekarang
          </a>
          <a
            href={DANA_LINK_2}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Kirim dana ke ${DANA_NAME} via DANA (alternatif)`}
            onClick={() => _setSent(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all duration-200 active:scale-95"
            style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1.5px solid rgba(255,255,255,0.4)" }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            Link Alternatif
          </a>
        </div>

        {_sent && (
          <p className="text-[10px] font-black uppercase tracking-widest text-white/90 animate-pulse">
            Terima kasih, {DANA_NAME}! 🙏
          </p>
        )}
      </div>
    </div>
  );
}

function YouTubeWidget() {
  const { items, loading } = useYouTubeFeed(YOUTUBE_CHANNEL_HANDLE, 4);
  const [_subbed, _setSubbed] = _s(false);
  const [_plusCount, _setPlusCount] = _s(0);

  const _handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (_subbed) return;
    _setSubbed(true);
    _setPlusCount((p) => p + 1);
    window.open(YOUTUBE_CHANNEL_URL, "_blank", "noopener,noreferrer");
    toast.success("+1 Subscriber! Opening YouTube…");
  };

  return (
    <div
      className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111]"
      itemScope
      itemType="https://schema.org/VideoChannel"
    >
      <YouTubeSEONode />
      <meta itemProp="url" content={YOUTUBE_CHANNEL_URL} />
      <meta itemProp="name" content={YOUTUBE_CHANNEL_HANDLE} />

      <div className="h-1.5 w-full bg-[#FF0000]" />

      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FF0000] flex items-center justify-center shadow-md flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-label="YouTube" role="img">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 leading-none mb-0.5">
              YouTube
            </p>
            <p className="text-[13px] font-black uppercase italic tracking-tight text-black dark:text-white leading-none">
              @{YOUTUBE_CHANNEL_HANDLE}
            </p>
          </div>
        </div>

        <button
          onClick={_handleSubscribe}
          aria-label={_subbed ? "Already subscribed to YouTube channel" : `Subscribe to @${YOUTUBE_CHANNEL_HANDLE} on YouTube`}
          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all duration-300 flex-shrink-0 ${
            _subbed
              ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
              : "bg-[#FF0000] text-white hover:bg-red-700 shadow-sm"
          }`}
        >
          {_subbed ? "Subscribed ✓" : "Subscribe"}
          {_plusCount > 0 && (
            <span className="ml-1 bg-white text-[#FF0000] rounded-full px-1.5 py-0.5 text-[8px] font-black animate-bounce">
              +{_plusCount}
            </span>
          )}
        </button>
      </div>

      <div className="px-4 pb-2">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-20 h-14 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                  <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, i) => (
              <a
                key={`yt-feed-${i}`}
                href={item.link || YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Watch: ${item.title}`}
                className="flex gap-3 group hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl p-2 -mx-2 transition-colors duration-200"
                itemScope
                itemType="https://schema.org/VideoObject"
              >
                <meta itemProp="url" content={item.link} />
                <meta itemProp="name" content={item.title} />
                {item.videoId && (
                  <meta itemProp="thumbnailUrl" content={`https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} />
                )}
                <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-900 relative">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FF0000]/10">
                      <_Pc size={20} className="text-[#FF0000]" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <_Pc size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black uppercase leading-tight line-clamp-2 text-black dark:text-white group-hover:text-[#FF0000] transition-colors">
                    {item.title}
                  </p>
                  {item.pubDate && (
                    <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                      {formatRSSDate(item.pubDate)}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-[12px] font-serif italic text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">
            Watch videos & shorts on{" "}
            <span className="font-black not-italic text-black dark:text-white">
              @{YOUTUBE_CHANNEL_HANDLE}
            </span>{" "}
            ✦
          </p>
        )}
      </div>

      <div className="px-6 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
        <a
          href={YOUTUBE_CHANNEL_VIDEOS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit YouTube channel videos"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF0000] hover:text-red-700 transition-colors duration-300"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          All videos on YouTube
        </a>
        <a
          href={YOUTUBE_SHORTS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit YouTube Shorts"
          className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 hover:text-[#FF0000] transition-colors duration-300"
        >
          <_Pc size={11} aria-hidden="true" /> Shorts ↗
        </a>
      </div>
    </div>
  );
}

function SubstackWidget() {
  const { items, loading } = useRSSFeed(SUBSTACK_RSS_URL, 3);

  return (
    <div
      className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111]"
      itemScope
      itemType="https://schema.org/Blog"
    >
      <SubstackSEONode />
      <meta itemProp="url" content={SUBSTACK_ROOT_URL} />

      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6719] to-[#FF8C00]" />

      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6719] to-[#FF8C00] flex items-center justify-center shadow-md flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-label="Substack" role="img">
              <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 leading-none mb-0.5">
              Substack
            </p>
            <p className="text-[13px] font-black uppercase italic tracking-tight text-black dark:text-white leading-none">
              deulo
            </p>
          </div>
        </div>

        <a
          href={SUBSTACK_ROOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Subscribe to deulo on Substack"
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF6719] to-[#FF8C00] text-white shadow-sm hover:opacity-80 transition-opacity flex-shrink-0"
        >
          Subscribe
        </a>
      </div>

      <div className="px-4 pb-2">
        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full mb-1" />
                <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded w-3/4 mb-1" />
                <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, i) => (
              <a
                key={`sub-feed-${i}`}
                href={item.link || SUBSTACK_ROOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read: ${item.title}`}
                className="block group hover:bg-orange-50 dark:hover:bg-neutral-900 rounded-xl p-3 -mx-3 transition-colors duration-200 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                itemScope
                itemType="https://schema.org/NewsArticle"
              >
                <meta itemProp="url" content={item.link} />
                <meta itemProp="headline" content={item.title} />
                <p className="text-[12px] font-black uppercase leading-tight line-clamp-2 text-black dark:text-white group-hover:text-[#FF6719] transition-colors mb-1">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[10px] font-serif italic text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
                {item.pubDate && (
                  <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                    {formatRSSDate(item.pubDate)}
                  </p>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-2">
            <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer" className="block group">
              <p className="text-[12px] font-black uppercase leading-tight line-clamp-2 text-black dark:text-white group-hover:text-[#FF6719] transition-colors mb-1">
                {SUBSTACK_POST_TITLE}
              </p>
              <p className="text-[10px] font-serif italic text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {SUBSTACK_POST_DESC}
              </p>
            </a>
          </div>
        )}
      </div>

      <div className="px-6 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <a
          href={SUBSTACK_ROOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Read all posts on Substack by deulo"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF6719] hover:text-[#FF8C00] transition-colors duration-300"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          Read all posts on Substack
        </a>
      </div>
    </div>
  );
}

function PinterestWidget() {
  return (
    <div
      className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111] transition-all duration-300 hover:shadow-2xl"
      itemScope
      itemType="https://schema.org/Person"
    >
      <PinterestSEONode />
      <meta itemProp="sameAs" content={PINTEREST_PROFILE_URL} />
      <meta itemProp="name" content="mustbeloveonthebrain" />

      <div className="h-1.5 w-full bg-[#E60023]" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E60023] flex items-center justify-center shadow-md flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-label="Pinterest" role="img">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 leading-none mb-0.5">
                Pinterest
              </p>
              <p className="text-[13px] font-black uppercase italic tracking-tight text-black dark:text-white leading-none">
                mustbeloveonthebrain
              </p>
            </div>
          </div>

          <a
            href={PINTEREST_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow mustbeloveonthebrain on Pinterest"
            className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#E60023] text-white shadow-sm hover:bg-red-800 transition-colors duration-300 flex-shrink-0"
          >
            Follow
          </a>
        </div>

        <p className="text-[12px] font-serif italic text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">
          Discover pins & boards on{" "}
          <span className="font-black not-italic text-black dark:text-white">Pinterest</span>{" "}
          ✦
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <a
            href={PINTEREST_PIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Pinterest Pin 1 by mustbeloveonthebrain"
            className="flex items-center gap-2 text-[10px] font-bold text-[#E60023] hover:underline truncate"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            Pinned — View Pin ①
          </a>
          <a
            href={PINTEREST_PIN_URL_2}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Pinterest Pin 2 by mustbeloveonthebrain"
            className="flex items-center gap-2 text-[10px] font-bold text-[#E60023] hover:underline truncate"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            Pinned — View Pin ②
          </a>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E60023] hover:text-red-800 transition-colors duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          <a href={PINTEREST_PROFILE_URL} target="_blank" rel="noopener noreferrer" aria-label="View full profile on Pinterest">
            View profile on Pinterest
          </a>
        </div>
      </div>
    </div>
  );
}

function ClashRoyaleWidget() {
  return (
    <div
      className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111]"
      itemScope
      itemType="https://schema.org/Person"
    >
      <ClashRoyaleSEONode />
      <meta itemProp="name" content={CR_PLAYER_NAME} />
      <meta itemProp="identifier" content={CR_PLAYER_TAG} />

      <div className="h-1.5 w-full bg-gradient-to-r from-[#0070DD] via-[#00C3FF] to-[#0070DD]" />

      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0070DD] to-[#004A99] flex items-center justify-center shadow-md flex-shrink-0">
            <_Sw size={16} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 leading-none mb-0.5">
              Clash Royale
            </p>
            <p className="text-[13px] font-black uppercase italic tracking-tight text-black dark:text-white leading-none">
              {CR_PLAYER_NAME}
            </p>
          </div>
        </div>

        <a
          href={CR_ADD_FRIEND_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Add ${CR_PLAYER_NAME} as friend in Clash Royale`}
          onClick={(e) => {
            e.stopPropagation();
            toast.success("Opening Clash Royale — Add Friend…");
          }}
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gradient-to-r from-[#0070DD] to-[#00C3FF] text-white shadow-sm hover:from-[#00C3FF] hover:to-[#0070DD] transition-all duration-300 flex-shrink-0 flex items-center gap-1.5"
        >
          <_Up size={10} aria-hidden="true" /> Add Friend
        </a>
      </div>

      <div className="mx-6 mb-4 p-3 rounded-xl bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-sm border border-[#CC8800]">
              <span className="text-[14px] font-black text-white drop-shadow-sm" aria-hidden="true">👑</span>
            </div>
            <div>
              <p className="text-[12px] font-black text-black dark:text-white leading-tight">
                #{CR_PLAYER_TAG}
              </p>
              <p className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                ID: {CR_PLAYER_ID}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#0070DD]">Lv. 53</p>
            <p className="text-[8px] font-bold text-neutral-400 uppercase">109K+ Gold</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-col gap-2">
          <a
            href={CR_ROYALEAPI_BATTLES}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View full battle log on RoyaleAPI"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0070DD] hover:text-[#00C3FF] transition-colors duration-300"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            View full battle log on RoyaleAPI
          </a>
          <a
            href={CR_ADD_FRIEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Add ${CR_PLAYER_NAME} as friend in-game on Clash Royale`}
            className="flex items-center gap-2 text-[10px] font-bold text-[#FFD700] hover:text-[#FFA500] transition-colors duration-300"
          >
            <_Up size={11} aria-hidden="true" />
            Add {CR_PLAYER_NAME} as friend in-game
          </a>
          <a
            href={CR_ROYALEAPI_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View full Clash Royale profile for #${CR_PLAYER_TAG}`}
            className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors duration-300"
          >
            <_El size={11} aria-hidden="true" />
            View full profile — #{CR_PLAYER_TAG}
          </a>
        </div>
      </div>
    </div>
  );
}

function SocialWidgetsDesktop() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <PayPalWidget />
      </Suspense>
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <InstagramWidget />
      </Suspense>
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <YouTubeWidget />
      </Suspense>
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <SubstackWidget />
      </Suspense>
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <PinterestWidget />
      </Suspense>
    </div>
  );
}

function SocialWidgetsMobileTop() {
  return (
    <div className="lg:hidden flex flex-col gap-6 my-10 max-w-[840px] mx-auto">
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <PayPalWidget />
      </Suspense>
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <InstagramWidget />
      </Suspense>
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <YouTubeWidget />
      </Suspense>
    </div>
  );
}

function SocialWidgetsMobileBottom() {
  return (
    <div className="lg:hidden flex flex-col gap-6 mt-10 max-w-[840px] mx-auto">
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <SubstackWidget />
      </Suspense>
      <Suspense fallback={<SuspenseFallbackWidget />}>
        <PinterestWidget />
      </Suspense>
    </div>
  );
}

function CommentItem({
  comment,
  avatar,
  onReply,
  isReply = false,
}: {
  comment: _Cu;
  avatar: string | null;
  onReply?: () => void;
  isReply?: boolean;
}) {
  const [_avatarError, _setAvatarError] = _s(false);

  return (
    <div
      className={`flex gap-4 md:gap-6 relative ${isReply ? "ml-10 md:ml-16 mt-6" : ""}`}
      itemScope
      itemType="https://schema.org/Comment"
    >
      <meta itemProp="identifier" content={String(comment.id)} />
      <meta itemProp="text" content={comment.content} />
      <meta itemProp="datePublished" content={comment.created_at} />
      <span itemProp="author" itemScope itemType="https://schema.org/Person" style={{ display: "none" }}>
        <span itemProp="name">{comment.user_name}</span>
      </span>

      {isReply && (
        <_Cr
          className="absolute -left-10 top-2 text-neutral-300 dark:text-neutral-800"
          size={20}
          aria-hidden="true"
        />
      )}

      <div className="flex-shrink-0">
        <div
          className={`${isReply ? "w-10 h-10" : "w-14 h-14"} border-2 border-black dark:border-white overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-sm`}
        >
          {avatar && !_avatarError ? (
            <img
              src={avatar}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              alt={`${comment.user_name} avatar`}
              onError={() => _setAvatarError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-black tracking-tighter italic">
              <_Us size={isReply ? 16 : 24} aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2">
          <h4
            className={`font-black uppercase italic ${isReply ? "text-[11px]" : "text-[13px]"} flex items-center gap-2 text-black dark:text-white`}
            itemProp="author"
          >
            {comment.user_name}
            {comment.id.toString().startsWith("temp-") && (
              <span className="text-[9px] not-italic text-emerald-500 animate-pulse tracking-widest">
                SYNCING...
              </span>
            )}
          </h4>
          <time
            dateTime={comment.created_at}
            className="text-[10px] font-bold opacity-40 uppercase"
            itemProp="datePublished"
          >
            <FormattedDate dateString={comment.created_at} />
          </time>
        </div>

        <div
          className={`${isReply ? "text-[15px]" : "text-[18px]"} leading-relaxed font-serif text-neutral-800 dark:text-neutral-200 break-words mb-3`}
          itemProp="text"
        >
          {comment.content}
        </div>

        {!isReply && onReply && (
          <button
            onClick={onReply}
            aria-label={`Reply to ${comment.user_name}`}
            className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-emerald-600 hover:text-emerald-400 transition-colors"
          >
            <_Rp size={12} aria-hidden="true" /> Reply
          </button>
        )}
      </div>
    </div>
  );
}

function CommentSectionInner({
  articleId,
  articleTitle,
  articleDate,
  authorName,
  articleUrl,
  articleExcerpt,
}: {
  articleId: string;
  articleTitle?: string;
  articleDate?: string;
  authorName?: string;
  articleUrl?: string;
  articleExcerpt?: string;
}) {
  const { user: _u } = useAuth();
  const _nav = _uN();
  const _qC = useQueryClient();

  const [_txt, _sTxt] = _s<string>("");
  const [_sub, _sSub] = _s<boolean>(false);
  const [_replyTo, _sReplyTo] = _s<string | null>(null);
  const [_localComments, _setLocalComments] = _s<_Cu[]>([]);
  const [_blobCache, _sBlobCache] = _s<Record<string, string>>({});

  const _blobCacheRef = _uR<Record<string, string>>({});

  _e(() => {
    return () => {
      Object.values(_blobCacheRef.current).forEach(safeBlobRevoke);
      _blobCacheRef.current = {};
    };
  }, []);

  const _hydrateAvatar = async (url: string | null | undefined, userId: string) => {
    if (!url || url.startsWith("blob:") || _blobCache[userId]) return;
    try {
      const _fmt = await _dBF();
      const response = await fetch(url);
      const blob = await response.blob();
      const optimized = await _wTI(blob, _fmt, 0.4);
      const blobUrl = URL.createObjectURL(optimized);
      _blobCacheRef.current[userId] = blobUrl;
      _sBlobCache((prev) => ({ ...prev, [userId]: blobUrl }));
    } catch (e) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        _blobCacheRef.current[userId] = blobUrl;
        _sBlobCache((prev) => ({ ...prev, [userId]: blobUrl }));
      } catch (err) {}
    }
  };

  const { data: _serverComments } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: () => commentsApi.getCommentsByArticle(articleId),
    enabled: !!articleId,
  });

  _e(() => {
    if (_serverComments) {
      _setLocalComments(_serverComments);
      _serverComments.forEach((c) => {
        if (c.user_avatar_url) _hydrateAvatar(c.user_avatar_url, c.user_id);
      });
    }
  }, [_serverComments]);

  const _rootComments = _uM(
    () => _localComments.filter((c) => !c.parent_id),
    [_localComments]
  );

  const _replies = _uM(
    () => _localComments.filter((c) => c.parent_id),
    [_localComments]
  );

  const _onAddComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim() || !_u) return;
    _sSub(true);

    const payload = {
      article_id: articleId,
      user_id: _u.id,
      content: content.trim(),
      parent_id: parentId,
    };

    try {
      await setCookieHash(_u.id);
      mirrorQuery({ type: "COMMENT_POST", articleId, ts: Date.now() });

      if (!navigator.onLine) {
        await enqueue({ type: "ADD_COMMENT", payload });
        toast.info("Cached offline. Will sync when online.");
        _sTxt("");
        _sReplyTo(null);
        return;
      }

      const { error: cErr } = await supabase.from("comments").insert(payload);
      if (cErr) throw cErr;

      await _qC.invalidateQueries({ queryKey: ["comments", articleId] });
      toast.success("Perspective Synced");
      _sTxt("");
      _sReplyTo(null);
    } catch (e: any) {
      await enqueue({ type: "ADD_COMMENT", payload });
      toast.error("Network issue. Perspective queued.");
    } finally {
      _sSub(false);
    }
  };

  const _getRenderAvatar = (url: string | null | undefined, uid: string): string | null => {
    const result = uid === _u?.id ? _blobCache["me"] || url : _blobCache[uid] || url;
    return result || null;
  };

  return (
    <section
      className="max-w-[840px] mx-auto py-16 border-t-2 border-neutral-100 dark:border-neutral-900 px-4 md:px-0"
      aria-label="Discussion section"
      itemScope
      itemType="https://schema.org/DiscussionForumPosting"
    >
      {articleTitle && <meta itemProp="headline" content={`Discussion: ${articleTitle}`} />}
      {articleUrl && <meta itemProp="url" content={`${articleUrl}#discussion-${articleId}`} />}
      {articleDate && <meta itemProp="datePublished" content={articleDate} />}
      <meta itemProp="text" content={articleExcerpt || articleTitle || "Discussion section for this Brawnly article."} />
      <span itemScope itemType="https://schema.org/Person" itemProp="author" style={{ display: "none" }}>
        <meta itemProp="name" content={authorName || IMAGE_CREATOR_NAME} />
        <meta itemProp="url" content="https://www.brawnly.online" />
      </span>
      <meta itemProp="discussionUrl" content={`${articleUrl || "https://www.brawnly.online"}#discussion-${articleId}`} />
      <meta itemProp="interactionCount" content={`CommentAction:${_localComments.length}`} />

      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-red-600 text-white rounded-full" aria-hidden="true">
          <_Ms size={20} />
        </div>
        <h2
          id={`discussion-${articleId}`}
          className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white"
        >
          Discussion ({_localComments.length})
        </h2>
      </div>

      {_u ? (
        <form
          id="comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            _onAddComment(_txt, _replyTo);
          }}
          className="mb-16"
          aria-label="Write a comment"
        >
          <div className="relative overflow-hidden border-2 border-black dark:border-white rounded-xl shadow-2xl">
            {_replyTo && (
              <div className="bg-emerald-500 text-black px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                  <_Rp size={12} aria-hidden="true" /> Replying_To: {_replyTo.slice(0, 8)}
                </span>
                <button type="button" onClick={() => _sReplyTo(null)} aria-label="Cancel reply" className="hover:scale-110 transition-transform">
                  <_X size={14} aria-hidden="true" />
                </button>
              </div>
            )}

            <label htmlFor="comment-textarea" className="sr-only">Write your perspective</label>
            <textarea
              id="comment-textarea"
              name="comment_content"
              value={_txt}
              onChange={(e) => _sTxt(e.target.value)}
              placeholder={_replyTo ? "Transmitting reply..." : "Write your perspective..."}
              className="w-full bg-neutral-50 dark:bg-neutral-950 p-6 font-serif text-lg min-h-[140px] focus:outline-none resize-none text-black dark:text-white placeholder:opacity-20"
            />

            <div className="flex justify-between items-center p-4 bg-white dark:bg-black border-t-2 border-black dark:border-white">
              <span className="text-[10px] font-black uppercase opacity-50 tracking-widest text-black dark:text-white">
                ID_NODE: {_u.email || "Member"}
              </span>
              <button
                type="submit"
                disabled={_sub || !_txt.trim()}
                aria-label="Submit comment"
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:invert active:scale-95 transition-all disabled:opacity-30"
              >
                {_sub ? <_L2 className="animate-spin" size={14} aria-hidden="true" /> : <_Sd size={14} aria-hidden="true" />}{" "}
                Commit
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-10 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl text-center mb-16">
          <p className="mb-6 font-serif italic text-neutral-500 text-lg">
            Sign up to comment and reply as a Brawnly viewer.
          </p>
          <button
            onClick={() => _nav("/signin")}
            aria-label="Sign up to comment on Brawnly"
            className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg"
          >
            Sign Up Now
          </button>
        </div>
      )}

      <div className="space-y-12" role="list" aria-label="Comments">
        <_AP mode="popLayout">
          {_rootComments.map((_c) => (
            <_m.div key={_c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group" role="listitem">
              <CommentItem
                comment={_c}
                avatar={_getRenderAvatar(_c.user_avatar_url, _c.user_id)}
                onReply={() => { _sReplyTo(_c.id); }}
              />

              <div className="space-y-6" role="list" aria-label={`Replies to ${_c.user_name}`}>
                {_replies
                  .filter((r) => r.parent_id === _c.id)
                  .map((r) => (
                    <CommentItem
                      key={r.id}
                      comment={r}
                      isReply
                      avatar={_getRenderAvatar(r.user_avatar_url, r.user_id)}
                    />
                  ))}
              </div>
            </_m.div>
          ))}
        </_AP>
      </div>

      <div className="mt-20">
        <Suspense fallback={<SuspenseFallbackWidget />}>
          <ClashRoyaleWidget />
        </Suspense>
      </div>

      <div className="mt-8">
        <Suspense fallback={<SuspenseFallbackWidget />}>
          <DanaWidget />
        </Suspense>
      </div>
    </section>
  );
}

function CommentSection({
  articleId,
  articleTitle,
  articleDate,
  authorName,
  articleUrl,
  articleExcerpt,
}: {
  articleId: string;
  articleTitle?: string;
  articleDate?: string;
  authorName?: string;
  articleUrl?: string;
  articleExcerpt?: string;
}) {
  return (
    <Suspense fallback={<SuspenseFallbackComments />}>
      <CommentSectionInner
        articleId={articleId}
        articleTitle={articleTitle}
        articleDate={articleDate}
        authorName={authorName}
        articleUrl={articleUrl}
        articleExcerpt={articleExcerpt}
      />
    </Suspense>
  );
}

if (typeof document !== "undefined") {
  const _sid = "__adSkeletonStyles__";
  if (!document.getElementById(_sid)) {
    const s = document.createElement("style");
    s.id = _sid;
    s.textContent = `
      @keyframes mcSignBounce {
        0%, 100% { transform: translateY(0px) rotate(-2deg); }
        30%       { transform: translateY(-4px) rotate(1deg); }
        60%       { transform: translateY(-2px) rotate(-1deg); }
      }
      @keyframes mcArrowDrop {
        0%, 100% { transform: translateY(0px); opacity: 1; }
        50%       { transform: translateY(3px); opacity: 0.6; }
      }
    `;
    document.head.appendChild(s);
  }
}

function _MotionCaptureSign() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        marginLeft: 2,
        verticalAlign: "middle",
        flexShrink: 0,
      }}
    >
      <svg
        width="34"
        height="46"
        viewBox="0 0 34 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: "mcSignBounce 2.4s ease-in-out infinite", display: "block" }}
      >
        <rect x="15.5" y="22" width="3" height="22" rx="1.5" className="fill-black dark:fill-white" fill="currentColor" />
        <rect x="1" y="1" width="32" height="21" rx="4" className="fill-black dark:fill-white" fill="currentColor" />
        <rect x="2" y="2" width="30" height="19" rx="3" fill="white" className="dark:fill-[#111]" />
        <g style={{ animation: "mcArrowDrop 1.1s ease-in-out infinite" }}>
          <line x1="17" y1="6" x2="17" y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="stroke-black dark:stroke-white" />
          <polyline points="12,11 17,16 22,11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="stroke-black dark:stroke-white" />
        </g>
      </svg>
    </span>
  );
}

// ── ArticleContentBlock ───────────────────────────────────────────────────────
function ArticleContentBlock({
  block,
  index,
}: {
  block: ParsedBlock;
  index: number;
}) {
  if (block.type === "tweet") {
    return (
      <div
        key={`para-tweet-${index}`}
        className="my-10 md:my-14"
        itemScope
        itemType="https://schema.org/SocialMediaPosting"
      >
        <meta itemProp="url" content={block.url} />
        <Suspense fallback={<div className="h-32 w-full max-w-[550px] mx-auto bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-xl border border-neutral-200 dark:border-neutral-800" />}>
          <TwitterEmbed url={block.url} align="center" />
        </Suspense>
      </div>
    );
  }

  if (block.type === "fullhtml") {
    return (
      <div
        key={`para-fullhtml-${index}`}
        className="w-full my-6 md:my-10"
      >
        <FullHtmlBlock
          body={block.html}
          styles={block.styles}
          scopeId={block.scopeId}
          rawHtml={block.rawHtml}
        />
      </div>
    );
  }

  if (block.type === "journalhtml") {
    return (
      <div
        key={`para-jhtml-${index}`}
        className="w-full my-4 md:my-6"
      >
        <FullHtmlBlock
          body={block.html}
          styles=""
          scopeId={block.scopeId}
          rawHtml=""
          journalHtml={block.html}
        />
      </div>
    );
  }

  return (
    <div
      key={`para-text-${index}`}
      className="prose prose-neutral dark:prose-invert prose-lg md:prose-xl max-w-none mb-8 md:mb-10 font-serif text-neutral-800 dark:text-neutral-300 [&>p]:leading-[1.8] [&>p]:md:leading-[1.85] [&>h1]:font-black [&>h2]:font-black [&>h3]:font-black [&>ul]:list-disc [&>ol]:list-decimal [&>blockquote]:border-l-4 [&>blockquote]:border-red-600 [&>blockquote]:pl-4 [&>blockquote]:italic [&>a]:text-red-600 [&>a]:underline [&>img]:rounded-xl [&>img]:shadow-lg [&>pre]:rounded-xl [&>code]:bg-neutral-100 [&>code]:dark:bg-neutral-900 [&>code]:px-1 [&>code]:rounded"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

export default function ArticleDetail() {
  const { slug: _sl } = _uP<{ slug: string }>();
  const _slV = _sl ?? "unknown";

  const [_blobUrl, _setBlobUrl] = _s<string | null>(null);
  const [_blurUrl, _setBlurUrl] = _s<string | null>(null);

  const _liveCoverBlobRef = _uR<string | null>(null);

  const [_isOff, _sOff] = _s(false);
  const [_iS, _siS] = _s(false);
  const [isHydrated, setIsHydrated] = _s(false);
  const [_hasTracked, _sHasTracked] = _s(false);

  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    return `${_CC.baseUrl}/${_u}`;
  };

  const { processedData: _pD, isLoading: _iL, article: _art } = _uAD();

  // ── _allMedia: split media URLs, replace empty slots with GIF_FALLBACK ──────
  const _allMedia = _uM(() => {
    const sourceStr = _art?.featured_image_url || _art?.featured_image;
    if (!sourceStr) return [];
    return sourceStr
      .split(/[\r\n]+/)
      .map((u) => u.trim() || GIF_FALLBACK)
      .filter(Boolean);
  }, [_art?.featured_image_url, _art?.featured_image]);

  const _rawImgSource = _uM(
    () => (_allMedia[0] ? _fC(_allMedia[0]) : null),
    [_allMedia]
  );

  const _extraMedia = _uM(() => _allMedia.slice(1), [_allMedia]);

  const _dbTweetUrls = _uM<string[]>(() => {
    const candidates = [
      (_art as any)?.tweet_url_1 as string | null | undefined,
      (_art as any)?.tweet_url_2 as string | null | undefined,
    ];
    return candidates.filter(
      (u): u is string =>
        typeof u === "string" && u.trim().length > 0 && isTweetUrl(u.trim())
    );
  }, [_art]);

  const _mediaTweetUrls = _uM<string[]>(
    () => _extraMedia.filter((url: string) => isTweetUrl(url)),
    [_extraMedia]
  );

  const _allTweetUrls = _uM<string[]>(() => {
    const seen = new Set<string>();
    return [..._dbTweetUrls, ..._mediaTweetUrls].filter((url) => {
      const key = url.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [_dbTweetUrls, _mediaTweetUrls]);

  const _youtubeShorts = _uM(
    () =>
      _extraMedia.filter(
        (url: string) =>
          !isTweetUrl(url) &&
          (url.includes("youtube.com") || url.includes("youtu.be"))
      ),
    [_extraMedia]
  );

  const _ytShortsFromCol = _uM<string[]>(() => {
    const raw = (_art as any)?.youtube_shorts_url as string | null | undefined;
    if (!raw) return [];
    return raw
      .split(/[\r\n,]+/)
      .map((u: string) => u.trim())
      .filter(
        (u: string) =>
          u.length > 0 &&
          (u.includes("youtube.com") || u.includes("youtu.be"))
      );
  }, [_art]);

  const _allYoutubeShorts = _uM<string[]>(() => {
    const seen = new Set<string>();
    return [..._youtubeShorts, ..._ytShortsFromCol].filter((u) => {
      if (seen.has(u)) return false;
      seen.add(u);
      return true;
    });
  }, [_youtubeShorts, _ytShortsFromCol]);

  const _mp4Videos = _uM<string[]>(
    () =>
      _extraMedia.filter(
        (url: string) =>
          !isTweetUrl(url) &&
          !url.includes("youtube.com") &&
          !url.includes("youtu.be") &&
          /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
      ),
    [_extraMedia]
  );

  const _animatedImages = _uM(
    () =>
      _extraMedia.filter(
        (url: string) => !isTweetUrl(url) && url.match(/\.(gif|gifv|webp)$/i)
      ),
    [_extraMedia]
  );

  const _galleryImages = _uM(
    () =>
      _extraMedia.filter(
        (url: string) =>
          !isTweetUrl(url) &&
          !url.includes("youtube.com") &&
          !url.includes("youtu.be") &&
          !url.match(/\.(gif|gifv|webp)$/i) &&
          !/\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url)
      ),
    [_extraMedia]
  );

  const _parsedParagraphs = _uM(
    () => (_pD ? parseParagraphs(_pD.paragraphs) : []),
    [_pD]
  );

  _e(() => {
    setIsHydrated(true);
    try {
      const saved = localStorage.getItem(`brawnly_saved_${_slV}`);
      _siS(saved === "true");
    } catch {}
    try {
      _sOff(!navigator.onLine);
    } catch {}
  }, [_slV]);

  _e(() => {
    if (!(window as any).__brawnly_pwa_active) {
      warmupEnterpriseStorage();
      registerSW();
      detectBestFormat();
      (window as any).__brawnly_pwa_active = true;
    }

    const oN = () => {
      _sOff(false);
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          if ((reg as any).sync) {
            (reg as any).sync.register('sync-articles').catch(() => {});
          }
        });
      }
    };

    const oF = () => _sOff(true);

    window.addEventListener("online", oN);
    window.addEventListener("offline", oF);

    return () => {
      window.removeEventListener("online", oN);
      window.removeEventListener("offline", oF);
    };
  }, []);

  _e(() => {
    if (!_rawImgSource) return;

    if (_rawImgSource.match(/\.(gif|gifv|webp)$/i)) {
      _setBlobUrl(_rawImgSource);
      return;
    }

    let _active = true;
    let _createdBlobUrls: string[] = [];

    const _setLive = (url: string) => {
      if (
        _liveCoverBlobRef.current &&
        _liveCoverBlobRef.current.startsWith("blob:") &&
        _liveCoverBlobRef.current !== url
      ) {
        safeBlobRevoke(_liveCoverBlobRef.current);
      }
      _liveCoverBlobRef.current = url;
      _setBlobUrl(url);
    };

    (async () => {
      try {
        const cached = await getAssetFromShared(`cover_${_slV}`);
        if (cached && _active) {
          const url = URL.createObjectURL(cached);
          _createdBlobUrls.push(url);
          _setLive(url);
          return;
        }

        const res = await fetch(_rawImgSource);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const b = await res.blob();

        try {
          const placeholder = await _wCP(b);
          if (_active) _setBlurUrl(placeholder);
        } catch {}

        const _fmt = await _dBF();
        let final: string;

        if (_rawImgSource.match(/\.(mp4|webm|ogg|mov)$/i)) {
          try {
            const vThumb = await _wVT(b, 0.25);
            final = URL.createObjectURL(vThumb);
            _createdBlobUrls.push(final);
            await saveAssetToShared(`cover_${_slV}`, vThumb);
          } catch {
            final = _rawImgSource;
          }
        } else {
          try {
            const opt = await _wTI(b, _fmt, 0.75);
            final = URL.createObjectURL(opt);
            _createdBlobUrls.push(final);
            await saveAssetToShared(`cover_${_slV}`, opt);
          } catch {
            final = _rawImgSource;
          }
        }

        if (_active) _setLive(final);
      } catch (e) {
        if (_active) _setBlobUrl(_rawImgSource);
      }
    })();

    return () => {
      _active = false;
      _createdBlobUrls
        .filter((u) => u !== _liveCoverBlobRef.current)
        .forEach(safeBlobRevoke);
    };
  }, [_rawImgSource, _slV]);

  _e(() => {
    return () => {
      if (_liveCoverBlobRef.current && _liveCoverBlobRef.current.startsWith("blob:")) {
        safeBlobRevoke(_liveCoverBlobRef.current);
        _liveCoverBlobRef.current = null;
      }
    };
  }, []);

  _e(() => {
    if (_art?.id && !_hasTracked) {
      setCookieHash(_slV);
      mirrorQuery({ type: "ARTICLE_VIEW", id: _art.id, slug: _slV, ts: Date.now() });
      _sHasTracked(true);
    }
  }, [_art?.id, _hasTracked, _slV]);

  const { data: _allA } = _uAs();
  const _hC = _uM(
    () =>
      _allA
        ? [..._allA].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3)
        : [],
    [_allA]
  );

  const _hSv = () => {
    const _nS = !_iS;
    _siS(_nS);
    try {
      if (_nS) {
        localStorage.setItem(`brawnly_saved_${_slV}`, "true");
        toast.success("Identity Saved");
      } else {
        localStorage.removeItem(`brawnly_saved_${_slV}`);
        toast.info("Removed");
      }
    } catch {}
  };

  const { viewCount: _realtimeViews } = _uAV({
    id: _art?.id ?? "",
    slug: _slV,
    initialViews: _art?.views ?? 0,
  });

  const _jsonLdArticle =
    _pD && _art
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: _pD.title,
          description: _pD.excerpt,
          image: _rawImgSource
            ? {
                "@type": "ImageObject",
                "url": _gOI(_rawImgSource, 1200),
                "contentUrl": _gOI(_rawImgSource, 1200),
                "width": 1200,
                "height": 630,
                "name": `Cover image — ${_pD.title}`,
                "license": IMAGE_LICENSE_URL,
                "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
                "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
                "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
                "creditText": IMAGE_CREATOR_NAME,
              }
            : undefined,
          author: {
            "@type": "Person",
            name: _art.author || "Brawnly",
            url: "https://www.brawnly.online",
            sameAs: [
              INSTAGRAM_URL,
              YOUTUBE_CHANNEL_URL,
              SUBSTACK_ROOT_URL,
              PINTEREST_PROFILE_URL,
            ],
          },
          publisher: {
            "@type": "Organization",
            name: "Brawnly",
            url: "https://www.brawnly.online",
            logo: {
              "@type": "ImageObject",
              url: "https://www.brawnly.online/favicon.ico",
              contentUrl: "https://www.brawnly.online/favicon.ico",
              license: IMAGE_LICENSE_URL,
              creator: { "@type": "Person", name: IMAGE_CREATOR_NAME },
              copyrightNotice: IMAGE_COPYRIGHT_NOTICE,
              acquireLicensePage: IMAGE_ACQUIRE_LICENSE_URL,
            },
          },
          datePublished: _art.published_at,
          dateModified: _art.updated_at || _art.published_at,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://www.brawnly.online/article/${_slV}`,
          },
          url: `https://www.brawnly.online/article/${_slV}`,
          interactionStatistic: [
            {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/ReadAction",
              userInteractionCount: _realtimeViews,
            },
          ],
          isPartOf: { "@type": "WebSite", name: "Brawnly", url: "https://www.brawnly.online" },
        })
      : null;

  const _jsonLdVideoObjects = _uM(() => {
    if (!_pD || !_art) return null;
    const list = buildVideoJsonLdList({
      youtubeShortsUrls: _allYoutubeShorts,
      mp4VideoUrls: _mp4Videos,
      name: _pD.title,
      description: _pD.excerpt || _pD.title,
      uploadDate: _art.published_at,
      thumbnailUrl: _rawImgSource ? _gOI(_rawImgSource, 600) : undefined,
    });
    return list.length > 0 ? list : null;
  }, [_pD, _art, _allYoutubeShorts, _mp4Videos, _rawImgSource]);

  const _jsonLdBreadcrumb = _pD
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.brawnly.online" },
          { "@type": "ListItem", position: 2, name: "Articles", item: "https://www.brawnly.online/articles" },
          { "@type": "ListItem", position: 3, name: _pD.title, item: `https://www.brawnly.online/article/${_slV}` },
        ],
      })
    : null;

  const _jsonLdWebPage =
    _pD && _art
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `https://www.brawnly.online/article/${_slV}`,
          url: `https://www.brawnly.online/article/${_slV}`,
          name: `${_pD.title} | Brawnly`,
          description: _pD.excerpt,
          inLanguage: "id",
          isPartOf: { "@type": "WebSite", name: "Brawnly", url: "https://www.brawnly.online" },
          primaryImageOfPage: _rawImgSource
            ? {
                "@type": "ImageObject",
                url: _gOI(_rawImgSource, 1200),
                contentUrl: _gOI(_rawImgSource, 1200),
                license: IMAGE_LICENSE_URL,
                creator: { "@type": "Person", name: IMAGE_CREATOR_NAME },
                copyrightNotice: IMAGE_COPYRIGHT_NOTICE,
                acquireLicensePage: IMAGE_ACQUIRE_LICENSE_URL,
              }
            : undefined,
          datePublished: _art.published_at,
          author: { "@type": "Person", name: _art.author || "Brawnly" },
        })
      : null;

  const _jsonLdSocialLinks = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Brawnly / deulo",
    url: "https://www.brawnly.online",
    sameAs: [
      INSTAGRAM_URL,
      YOUTUBE_CHANNEL_URL,
      SUBSTACK_ROOT_URL,
      SUBSTACK_URL,
      PINTEREST_PROFILE_URL,
      CR_ROYALEAPI_PROFILE,
    ],
    knowsAbout: ["Brawnly","Technology","Fitness","WiFi DensePose","Clash Royale","Open Source","Social Media"],
  });

  const _articleCanonical = `https://www.brawnly.online/article/${_slV}`;

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="w-20 h-[3px] bg-red-600 animate-pulse" />
      </div>
    );
  }

  if (_iL && !_pD)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="w-20 h-[3px] bg-red-600 animate-pulse" />
      </div>
    );

  if (!_pD || !_art) return null;

  return (
    <Suspense fallback={<SuspenseFallbackArticle />}>
      <main
        className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative overflow-x-hidden"
        itemScope
        itemType="https://schema.org/Article"
      >
        <_Hm>
          <title>{_pD.title} | Brawnly</title>
          <meta name="description" content={_pD.excerpt} />

          <meta property="og:type" content="article" />
          <meta property="og:title" content={`${_pD.title} | Brawnly`} />
          <meta property="og:description" content={_pD.excerpt} />
          <meta property="og:url" content={_articleCanonical} />
          <meta property="og:site_name" content="Brawnly" />
          <meta property="og:locale" content="id_ID" />
          {_rawImgSource && <meta property="og:image" content={_gOI(_rawImgSource, 1200)} />}
          {_rawImgSource && <meta property="og:image:width" content="1200" />}
          {_rawImgSource && <meta property="og:image:height" content="630" />}
          {_art.published_at && <meta property="article:published_time" content={_art.published_at} />}
          {_art.updated_at && <meta property="article:modified_time" content={_art.updated_at} />}
          <meta property="article:author" content={_art.author || "Brawnly"} />
          <meta property="article:section" content="Technology" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${_pD.title} | Brawnly`} />
          <meta name="twitter:description" content={_pD.excerpt} />
          {_rawImgSource && <meta name="twitter:image" content={_gOI(_rawImgSource, 1200)} />}
          <meta name="twitter:site" content="@brawnly" />
          <meta name="twitter:creator" content="@brawnly" />

          <link rel="canonical" href={_articleCanonical} />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="author" content={_art.author || "Brawnly"} />
          <link rel="author" href="https://www.brawnly.online" />
          <meta name="publisher" content="Brawnly" />

          <link rel="me" href={INSTAGRAM_URL} />
          <link rel="me" href={YOUTUBE_CHANNEL_URL} />
          <link rel="me" href={SUBSTACK_ROOT_URL} />
          <link rel="me" href={PINTEREST_PROFILE_URL} />

          {_jsonLdArticle && <script type="application/ld+json">{_jsonLdArticle}</script>}
          {_jsonLdVideoObjects && _jsonLdVideoObjects.map((ld, idx) => (
            <script key={`ld-video-${idx}`} type="application/ld+json">{ld}</script>
          ))}
          {_jsonLdBreadcrumb && <script type="application/ld+json">{_jsonLdBreadcrumb}</script>}
          {_jsonLdWebPage && <script type="application/ld+json">{_jsonLdWebPage}</script>}
          <script type="application/ld+json">{_jsonLdSocialLinks}</script>
        </_Hm>

        <article className="sr-only" itemScope itemType="https://schema.org/Article" aria-hidden="true">
          <h1 itemProp="headline">{_pD.title}</h1>
          <p itemProp="description">{_pD.excerpt}</p>
          <address className="author" itemScope itemType="https://schema.org/Person">
            By <span itemProp="name">{_art.author || "Brawnly"}</span>
            <a itemProp="url" href="https://www.brawnly.online" rel="author" tabIndex={-1}>Brawnly</a>
          </address>
          <time dateTime={_art.published_at} itemProp="datePublished">{_art.published_at}</time>
          {(_art as any).updated_at && (
            <time dateTime={(_art as any).updated_at} itemProp="dateModified">{(_art as any).updated_at}</time>
          )}
          <div itemProp="articleBody">
            {_parsedParagraphs.map((block, i) => {
              if (block.type === "text" || block.type === "fullhtml") {
                return <p key={`seo-para-${i}`} dangerouslySetInnerHTML={{ __html: block.html }} />;
              }
              if (block.type === "journalhtml") {
                return <p key={`seo-jhtml-${i}`} dangerouslySetInnerHTML={{ __html: block.html }} />;
              }
              return (
                <a key={`seo-tweet-${i}`} href={block.url} rel="noopener noreferrer" tabIndex={-1}>
                  Embedded Tweet: {block.url}
                </a>
              );
            })}
          </div>
          <nav aria-label="Social profiles" itemProp="sameAs">
            <a href={INSTAGRAM_URL} rel="noopener noreferrer" tabIndex={-1}>Instagram: @{INSTAGRAM_USERNAME}</a>
            <a href={YOUTUBE_CHANNEL_URL} rel="noopener noreferrer" tabIndex={-1}>YouTube: @{YOUTUBE_CHANNEL_HANDLE}</a>
            <a href={SUBSTACK_ROOT_URL} rel="noopener noreferrer" tabIndex={-1}>Substack: deulo</a>
            <a href={PINTEREST_PROFILE_URL} rel="noopener noreferrer" tabIndex={-1}>Pinterest: mustbeloveonthebrain</a>
            <a href={CR_ROYALEAPI_PROFILE} rel="noopener noreferrer" tabIndex={-1}>Clash Royale: {CR_PLAYER_NAME} #{CR_PLAYER_TAG}</a>
          </nav>
          <meta itemProp="interactionStatistic" content={`${_realtimeViews} reads`} />
        </article>

        <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
          <button
            onClick={_hSv}
            aria-label={_iS ? "Remove article from saved" : "Save this article"}
            aria-pressed={_iS}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${
              _iS
                ? "bg-emerald-500 border-black text-black scale-110"
                : "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 shadow-xl"
            }`}
          >
            {_iS ? <_Ck size={20} aria-hidden="true" /> : <_Bm size={20} aria-hidden="true" />}
          </button>

          <button
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Node Link Copied");
              }
            }}
            aria-label="Copy link to this article"
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 hover:border-red-600 transition-all duration-500"
          >
            <_Sh size={20} aria-hidden="true" />
          </button>
        </aside>

        <div className="max-w-[1320px] mx-auto px-4 md:px-10">
          <header
            className="pt-12 md:pt-16 pb-8 md:pb-10 border-b-[8px] md:border-b-[12px] border-black dark:border-white mb-8 md:mb-10 relative text-black dark:text-white"
            itemScope
            itemType="https://schema.org/Article"
          >
            <meta itemProp="headline" content={_pD.title} />
            <meta itemProp="description" content={_pD.excerpt} />
            <meta itemProp="datePublished" content={_art.published_at} />
            {(_art as any).updated_at && <meta itemProp="dateModified" content={(_art as any).updated_at} />}
            <meta itemProp="author" content={_art.author || "Brawnly"} />
            <meta itemProp="url" content={_articleCanonical} />
            {_rawImgSource && <meta itemProp="image" content={_gOI(_rawImgSource, 1200)} />}

            <div className="flex justify-between items-start mb-6">
              <_L
                to="/articles"
                aria-label="Back to all articles"
                className="text-red-700 font-black uppercase text-[11px] md:text-[13px] tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all italic"
              >
                <_Al size={14} aria-hidden="true" /> Node_Explore
              </_L>

              {_isOff && (
                <span
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full"
                >
                  <_Wo size={12} aria-hidden="true" /> OFFLINE
                </span>
              )}
            </div>

            <h1
              className="text-[36px] sm:text-[45px] md:text-[92px] leading-[0.9] md:leading-[0.82] font-black uppercase tracking-tighter mb-8 md:mb-10 italic break-words"
              aria-hidden="true"
            >
              {_pD.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-end justify-between py-6 md:py-8 border-t-2 border-black dark:border-white gap-6">
              <div className="flex items-center gap-4 md:gap-5" itemScope itemType="https://schema.org/Person">
                <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden border-2 border-black grayscale shadow-lg bg-neutral-100">
                  <img
                    src={_gOI(_mA, 120)}
                    className="w-full h-full object-cover"
                    alt={`Author avatar — ${_art.author || "Brawnly"}`}
                    itemProp="image"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div>
                  <span className="block text-[13px] md:text-[15px] font-black uppercase italic" itemProp="name">
                    By {_art.author || "Brawnly"}
                  </span>
                  <time dateTime={_art.published_at} className="text-[10px] md:text-[12px] uppercase opacity-80" itemProp="birthDate">
                    <FormattedDate dateString={_art.published_at} />
                  </time>
                </div>
              </div>

              <div className="text-xl md:text-2xl font-black italic flex items-center gap-3">
                <span aria-label={`${_realtimeViews} kali dibaca`} itemProp="interactionStatistic">
                  {_realtimeViews.toLocaleString("en-US")}
                </span>{" "}
                <_Ey size={20} className="text-red-600" aria-hidden="true" />
              </div>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
            <article className="flex-1 relative min-w-0" itemProp="articleBody">
              <p
                className="text-[20px] md:text-[32px] leading-[1.2] md:leading-[1.1] font-extrabold mb-10 md:mb-14 tracking-tight text-neutral-900 dark:text-neutral-100 italic"
                aria-hidden="true"
                itemProp="description"
              >
                {_pD.excerpt}
              </p>

              <div className="relative mb-12 md:mb-20 px-4 md:px-12 lg:px-20">
                <div
                  className="absolute left-[-15px] sm:left-[-30px] md:left-[-60px] lg:left-[-80px] top-1/2 -translate-y-1/2 w-20 sm:w-32 md:w-48 lg:w-56 z-10 opacity-90 pointer-events-none"
                  aria-hidden="true"
                >
                  <img src={_muscleLeft} alt="" className="w-full drop-shadow-2xl" />
                </div>
                <figure
                  className="relative overflow-hidden group rounded-2xl md:rounded-3xl border-2 border-black dark:border-white shadow-2xl z-20 bg-black"
                  itemScope
                  itemType="https://schema.org/ImageObject"
                >
                  <meta itemProp="url" content={_rawImgSource ? _gOI(_rawImgSource, 1200) : ""} />
                  <meta itemProp="contentUrl" content={_rawImgSource ? _gOI(_rawImgSource, 1200) : ""} />
                  <meta itemProp="name" content={`Cover image — ${_pD.title}`} />
                  <meta itemProp="description" content={`Cover image for article: ${_pD.title}`} />
                  <meta itemProp="license" content={IMAGE_LICENSE_URL} />
                  <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
                  <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
                  <span itemScope itemType="https://schema.org/Person" itemProp="creator" style={{ display: "none" }}>
                    <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
                  </span>
                  <ArticleCoverImage
                    imageUrl={_blobUrl || _rawImgSource || ""}
                    title={_pD.title}
                    slug={_slV}
                    className="w-full aspect-video md:aspect-[21/9] object-cover"
                  />
                  <figcaption className="sr-only">{_pD.title} — cover image</figcaption>
                </figure>
                <div
                  className="absolute right-[-15px] sm:right-[-30px] md:right-[-60px] lg:right-[-80px] top-1/2 -translate-y-1/2 w-20 sm:w-32 md:w-48 lg:w-56 z-10 opacity-90 pointer-events-none"
                  aria-hidden="true"
                >
                  <img src={_muscleRight} alt="" className="w-full drop-shadow-2xl" />
                </div>
              </div>

              <Suspense fallback={<div className="lg:hidden flex flex-col gap-6 my-10 max-w-[840px] mx-auto"><SuspenseFallbackWidget /><SuspenseFallbackWidget /></div>}>
                <SocialWidgetsMobileTop />
              </Suspense>

              <div className="max-w-[840px] mx-auto">
                {_parsedParagraphs.map((block, i) => (
                  <ArticleContentBlock key={`block-${i}`} block={block} index={i} />
                ))}
              </div>

              {_allTweetUrls.length > 0 && (
                <section
                  className="my-16 max-w-[840px] mx-auto"
                  aria-label="Embedded tweets"
                  itemScope
                  itemType="https://schema.org/ItemList"
                >
                  <meta itemProp="name" content="Embedded Tweets" />
                  <div className="flex items-center gap-3 mb-10 opacity-60">
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current text-black dark:text-white">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="text-[10px] uppercase font-black tracking-[0.3em]">Embedded_Tweets</span>
                  </div>
                  <div className="flex flex-col gap-8">
                    {_allTweetUrls.map((url, idx) => (
                      <div key={`db-tweet-${idx}`} itemScope itemType="https://schema.org/SocialMediaPosting" itemProp="itemListElement">
                        <meta itemProp="position" content={String(idx + 1)} />
                        <meta itemProp="url" content={url} />
                        <Suspense fallback={<div className="h-32 w-full max-w-[550px] mx-auto bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-xl border border-neutral-200 dark:border-neutral-800" />}>
                          <TwitterEmbed url={url} align="center" />
                        </Suspense>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {_mp4Videos.length > 0 && (
                <section className="my-16 max-w-[840px] mx-auto" aria-label="Embedded videos" itemScope itemType="https://schema.org/ItemList">
                  <meta itemProp="name" content="Embedded Videos" />
                  <div className="flex items-center gap-3 mb-8 opacity-70">
                    <_Pc size={18} className="text-red-600" aria-hidden="true" />
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-black dark:text-white">
                      {_mp4Videos.length > 1 ? `Videos (${_mp4Videos.length})` : "Video"}
                    </span>
                  </div>
                  <VideoShortsGrid
                    videos={_mp4Videos}
                    title={_pD.title}
                    articleDate={_art.published_at}
                    description={_pD.excerpt || _pD.title}
                  />
                </section>
              )}

              {_allYoutubeShorts.length > 0 && (
                <section className="my-16 max-w-[840px] mx-auto" aria-label="Embedded YouTube Shorts" itemScope itemType="https://schema.org/ItemList">
                  <meta itemProp="name" content="Embedded YouTube Shorts" />
                  {_allYoutubeShorts.length > 1 && (
                    <div className="flex items-center gap-3 mb-8 opacity-70">
                      <_Pc size={18} className="text-red-600" aria-hidden="true" />
                      <span className="text-[10px] uppercase font-black tracking-[0.3em] text-black dark:text-white">
                        YouTube_Shorts ({_allYoutubeShorts.length})
                      </span>
                    </div>
                  )}
                  <YouTubeShortsGrid
                    shorts={_allYoutubeShorts}
                    title={_pD.title}
                    thumbUrl={_rawImgSource ? _gOI(_rawImgSource, 600) : undefined}
                    articleDate={_art.published_at}
                    description={_pD.excerpt || _pD.title}
                  />
                </section>
              )}

              {_animatedImages.length > 0 && (
                <section
                  className="my-20 max-w-[600px] mx-auto lg:hidden"
                  aria-label="Animated images"
                  itemScope
                  itemType="https://schema.org/ItemList"
                >
                  <meta itemProp="name" content="Motion Capture — Animated Images" />
                  <div className="flex items-center justify-center gap-3 mb-10 opacity-70">
                    <_Ap size={18} className="animate-spin-slow" aria-hidden="true" />
                    <span className="text-[10px] uppercase font-black tracking-[0.3em]">Motion_Capture</span>
                    {_animatedImages.length > 1 && <_MotionCaptureSign />}
                  </div>
                  <div className="flex flex-col gap-10 items-center">
                    {_animatedImages.map((img: string, idx: number) => (
                      <figure key={`gif-${idx}`} className="w-auto max-w-[80%] md:max-w-full relative group" itemScope itemType="https://schema.org/ImageObject" itemProp="itemListElement" style={{ contain: "layout" }}>
                        <meta itemProp="position" content={String(idx + 1)} />
                        <meta itemProp="url" content={_fC(img)} />
                        <meta itemProp="contentUrl" content={_fC(img)} />
                        <meta itemProp="name" content={`${_pD.title} — Animated image ${idx + 1}`} />
                        <meta itemProp="description" content={`Animated image ${idx + 1} from article: ${_pD.title}`} />
                        <meta itemProp="license" content={IMAGE_LICENSE_URL} />
                        <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
                        <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
                        <span itemScope itemType="https://schema.org/Person" itemProp="creator" style={{ display: "none" }}>
                          <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
                        </span>
                        <img
                          src={_fC(img)}
                          alt={`${_pD.title} — Animated image ${idx + 1}`}
                          className="w-full h-auto rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800"
                          style={{ objectFit: "contain" }}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="absolute -bottom-3 -right-3 bg-black text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest border border-white" aria-hidden="true">GIF</div>
                        <figcaption className="sr-only">{_pD.title} — Animated image {idx + 1}</figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              {_galleryImages.length > 0 && (
                <section className="mt-20 mb-12 border-t-2 border-neutral-100 dark:border-neutral-900 pt-16" aria-label="Image gallery" itemScope itemType="https://schema.org/ImageGallery">
                  <meta itemProp="name" content={`Gallery — ${_pD.title}`} />
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full" aria-hidden="true">
                      <_Ca size={18} />
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white">Gallery</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {_galleryImages.map((img: string, idx: number) => (
                      <figure key={idx} className="overflow-hidden border-2 border-black dark:border-white rounded-xl shadow-lg bg-neutral-100 relative" itemScope itemType="https://schema.org/ImageObject" itemProp="image" style={{ contain: "layout" }}>
                        <meta itemProp="url" content={_fC(img)} />
                        <meta itemProp="contentUrl" content={_fC(img)} />
                        <meta itemProp="name" content={`${_pD.title} — Gallery ${idx + 1}`} />
                        <meta itemProp="description" content={`Gallery image ${idx + 1} from article: ${_pD.title}`} />
                        <meta itemProp="license" content={IMAGE_LICENSE_URL} />
                        <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
                        <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
                        <span itemScope itemType="https://schema.org/Person" itemProp="creator" style={{ display: "none" }}>
                          <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
                        </span>
                        <img
                          src={_fC(img)}
                          alt={`${_pD.title} — Gallery image ${idx + 1}`}
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-200 aspect-square md:aspect-[4/5]"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                        />
                        <figcaption className="sr-only">{_pD.title} — Gallery image {idx + 1}</figcaption>
                      </figure>
                    ))}
                  </div>
                  <div className="mt-10">
                    <Suspense fallback={<div className="lg:hidden flex flex-col gap-6 mt-10 max-w-[840px] mx-auto"><SuspenseFallbackWidget /><SuspenseFallbackWidget /></div>}>
                      <SocialWidgetsMobileBottom />
                    </Suspense>
                  </div>
                </section>
              )}

              {_galleryImages.length === 0 && (
                <Suspense fallback={<div className="lg:hidden flex flex-col gap-6 mt-10 max-w-[840px] mx-auto"><SuspenseFallbackWidget /><SuspenseFallbackWidget /></div>}>
                  <SocialWidgetsMobileBottom />
                </Suspense>
              )}

              <div className="flex xl:hidden items-center gap-4 mb-16 border-t-2 border-neutral-100 dark:border-neutral-900 pt-8 mt-8">
                <button
                  onClick={_hSv}
                  aria-label={_iS ? "Remove from saved" : "Save this article"}
                  aria-pressed={_iS}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 font-black uppercase text-[12px] tracking-widest transition-all shadow-md active:scale-95 ${
                    _iS
                      ? "bg-emerald-500 border-black text-black"
                      : "bg-white dark:bg-black border-black dark:border-white text-black dark:text-white"
                  }`}
                >
                  {_iS ? <_Ck size={16} aria-hidden="true" /> : <_Bm size={16} aria-hidden="true" />}
                  {_iS ? "Saved" : "Save"}
                </button>

                <button
                  onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Node Link Copied");
                    }
                  }}
                  aria-label="Copy permalink for this article"
                  className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[12px] tracking-widest shadow-md hover:invert active:scale-95 transition-all"
                >
                  <_Sh size={16} aria-hidden="true" />
                  Permalink
                </button>
              </div>

              <CommentSection
                articleId={_art.id}
                articleTitle={_pD.title}
                articleDate={_art.published_at}
                authorName={_art.author || IMAGE_CREATOR_NAME}
                articleUrl={_articleCanonical}
                articleExcerpt={_pD.excerpt}
              />
            </article>

            <aside
              className="hidden lg:block w-[320px] xl:w-[350px] flex-shrink-0"
              aria-label="Sidebar — Trending articles and social links"
            >
              <div className="sticky top-32 space-y-8">
                <nav
                  className="p-8 bg-neutral-50 dark:bg-[#111] rounded-[2.5rem] border-2 border-black dark:border-white shadow-xl"
                  aria-label="Trending articles"
                  itemScope
                  itemType="https://schema.org/ItemList"
                >
                  <meta itemProp="name" content="Trending Articles on Brawnly" />
                  <h2 className="text-[12px] font-black uppercase tracking-widest text-emerald-600 mb-8 italic flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" aria-hidden="true" />{" "}
                    Trending
                  </h2>
                  <ol className="flex flex-col gap-10">
                    {_hC.map((it: any, i: number) => (
                      <li key={it.id} itemScope itemType="https://schema.org/Article" itemProp="itemListElement">
                        <meta itemProp="position" content={String(i + 1)} />
                        <meta itemProp="url" content={`https://www.brawnly.online/article/${it.slug}`} />
                        <meta itemProp="headline" content={it.title} />
                        <_L to={`/article/${it.slug}`} aria-label={`Read trending article: ${it.title}`} className="group block">
                          <div className="flex gap-4">
                            <span className="text-3xl font-black text-neutral-200 dark:text-neutral-800 group-hover:text-emerald-500 transition-colors" aria-hidden="true">
                              0{i + 1}
                            </span>
                            <div>
                              <p className="text-[14px] font-black leading-tight uppercase group-hover:underline line-clamp-2 text-black dark:text-white" itemProp="headline">
                                {it.title}
                              </p>
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">
                                {(it.views || 0).toLocaleString("en-US")} Identity_Reads
                              </span>
                            </div>
                          </div>
                        </_L>
                      </li>
                    ))}
                  </ol>
                </nav>

                <Suspense fallback={<div className="flex flex-col gap-6"><SuspenseFallbackWidget /><SuspenseFallbackWidget /><SuspenseFallbackWidget /><SuspenseFallbackWidget /></div>}>
                  <SocialWidgetsDesktop />
                </Suspense>

                {_animatedImages.length > 0 && _pD && (
                  <div
                    className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111]"
                    aria-label="Animated images"
                    itemScope
                    itemType="https://schema.org/ItemList"
                  >
                    <meta itemProp="name" content="Motion Capture — Animated Images" />
                    <div className="h-1.5 w-full bg-gradient-to-r from-neutral-300 via-neutral-500 to-neutral-300 dark:from-neutral-700 dark:via-neutral-500 dark:to-neutral-700" />
                    <div className="px-5 pt-5 pb-2 flex items-center gap-2">
                      <_Ap size={14} className="animate-spin-slow text-black dark:text-white flex-shrink-0" aria-hidden="true" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Motion_Capture</span>
                      {_animatedImages.length > 1 && <_MotionCaptureSign />}
                    </div>
                    <div className="px-4 pb-5 flex flex-col gap-5 items-center">
                      {_animatedImages.map((img: string, idx: number) => (
                        <figure key={`sidebar-gif-${idx}`} className="w-full relative group overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800" itemScope itemType="https://schema.org/ImageObject" itemProp="itemListElement" style={{ contain: "layout" }}>
                          <meta itemProp="position" content={String(idx + 1)} />
                          <meta itemProp="url" content={_fC(img)} />
                          <meta itemProp="contentUrl" content={_fC(img)} />
                          <meta itemProp="name" content={`${_pD.title} — Animated image ${idx + 1}`} />
                          <meta itemProp="description" content={`Animated image ${idx + 1} from article: ${_pD.title}`} />
                          <meta itemProp="license" content={IMAGE_LICENSE_URL} />
                          <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
                          <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
                          <span itemScope itemType="https://schema.org/Person" itemProp="creator" style={{ display: "none" }}>
                            <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
                          </span>
                          <img
                            src={_fC(img)}
                            alt={`${_pD.title} — Animated image ${idx + 1}`}
                            className="w-full h-auto object-contain rounded-xl"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border border-white rounded" aria-hidden="true">GIF</div>
                          <figcaption className="sr-only">{_pD.title} — Animated image {idx + 1}</figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        <ScrollToTopButton />
      </main>
    </Suspense>
  );
}