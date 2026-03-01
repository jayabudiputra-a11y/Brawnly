import React, { useState as _s, useEffect as _e, useMemo as _uM, useRef as _uR } from "react";
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
} from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import FormattedDate from "@/components/features/FormattedDate";
import _mA from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";
import TwitterEmbed from "@/components/features/TwitterEmbed";
import { isTweetUrl } from "@/lib/utils";
import _muscleLeft from "@/assets/119-1191125_muscle-arms-png-big-arm-muscles-transparent-png.png";
import _muscleRight from "@/assets/634-6343275_muscle-arm-png-background-images-barechested-transparent-png.png";

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

import type { CommentWithUser as _Cu } from "@/types";

const INSTAGRAM_USERNAME = "deul.umm";
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_USERNAME}/`;
const INSTAGRAM_POST_PERMALINK =
  "https://www.instagram.com/p/DVVb2ZbCdU7/?utm_source=ig_embed&utm_campaign=loading";

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@rudayaDIR";
const YOUTUBE_CHANNEL_HANDLE = "rudayaDIR";

const SUBSTACK_URL =
  "https://deulo.substack.com/p/wifi-densepose-melacak-tubuh-manusia";
const SUBSTACK_ROOT_URL = "https://deulo.substack.com";
const SUBSTACK_POST_TITLE =
  "WiFi DensePose: Melacak Tubuh Manusia Menembus Tembok, Tanpa Kamera";
const SUBSTACK_POST_DESC =
  "Proyek open-source ini menggunakan sinyal WiFi biasa untuk mengestimasi pose tubuh secara real-time — dan hasilnya mengubah cara kita memandang privasi dan keamanan selamanya.";

const TUMBLR_BLOG_URL = "https://deulo.tumblr.com/";
const TUMBLR_POST_URL =
  "https://www.tumblr.com/deulo/809804750475444224/blaze-deulo";
const TUMBLR_EMBED_HREF =
  "https://embed.tumblr.com/embed/post/t:N4M27bzOPUQnedC7_NFBnw/809804750475444224/v2";
const TUMBLR_EMBED_DID = "84c833a47ca0c43fb4a94649fd8f8e01ef8d192e";

const PINTEREST_PROFILE_URL =
  "https://ru.pinterest.com/mustbeloveonthebrain/";
const PINTEREST_PIN_URL = "https://pin.it/54og3CaPN";
const PINTEREST_PIN_URL_2 = "https://pin.it/4D4StcRSo";

type ParsedBlock =
  | { type: "text"; html: string }
  | { type: "tweet"; url: string };

function parseParagraphs(paragraphs: string[]): ParsedBlock[] {
  const result: ParsedBlock[] = [];

  const standaloneTweetRe =
    /^(?:<[^>]+>)*\s*(https?:\/\/(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/statuse?s?\/\d+[^\s<"]*)\s*(?:<\/[^>]+>)*$/i;

  const inlineTweetRe =
    /https?:\/\/(?:twitter\.com|x\.com)\/[A-Za-z0-9_]+\/statuse?s?\/\d+[^\s<"]*/gi;

  for (const raw of paragraphs) {
    const trimmed = raw.trim();

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

function fmtHtml(text: string): string {
  return text
    .replace(
      /\*\*(.*?)\*\*/g,
      `<strong class="font-black text-black dark:text-white">$1</strong>`
    )
    .replace(
      /\*(.*?)\*/g,
      `<em class="italic text-red-700">$1</em>`
    );
}

function InstagramWidget() {
  const _embedRef = _uR<HTMLDivElement>(null);
  const _scriptLoaded = _uR(false);
  const [isMounted, setIsMounted] = _s(false);

  _e(() => {
    setIsMounted(true);
  }, []);

  _e(() => {
    if (!isMounted || !_embedRef.current) return;

    _embedRef.current.innerHTML = `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${INSTAGRAM_POST_PERMALINK}" data-instgrm-version="14" style="background:#FFF;border:0;border-radius:3px;margin:1px;max-width:540px;min-width:280px;padding:0;width:calc(100% - 2px)"><div style="padding:16px"><a href="${INSTAGRAM_POST_PERMALINK}" target="_blank" rel="noopener noreferrer" style="background:#FFFFFF;line-height:0;padding:0 0;text-align:center;text-decoration:none;width:100%;display:block"><div style="display:flex;flex-direction:row;align-items:center"><div style="background-color:#F4F4F4;border-radius:50%;flex-grow:0;height:40px;margin-right:14px;width:40px"></div><div style="display:flex;flex-direction:column;flex-grow:1;justify-content:center"><div style="background-color:#F4F4F4;border-radius:4px;flex-grow:0;height:14px;margin-bottom:6px;width:100px"></div><div style="background-color:#F4F4F4;border-radius:4px;flex-grow:0;height:14px;width:60px"></div></div></div><div style="padding:19% 0"></div><div style="display:block;height:50px;margin:0 auto 12px;width:50px"><svg width="50px" height="50px" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top:8px"><div style="color:#3897f0;font-family:Arial,sans-serif;font-size:14px;font-style:normal;font-weight:550;line-height:18px">View this post on Instagram</div></div></a><p style="color:#c9c8cd;font-family:Arial,sans-serif;font-size:14px;line-height:17px;margin-bottom:0;margin-top:8;overflow:hidden;padding:8px 0 7px;text-align:center;text-overflow:ellipsis;white-space:nowrap"><a href="${INSTAGRAM_POST_PERMALINK}" target="_blank" rel="noopener noreferrer" style="color:#c9c8cd;font-family:Arial,sans-serif;font-size:14px;font-style:normal;font-weight:normal;line-height:17px;text-decoration:none">A post shared by &quot;Putra&quot; (@${INSTAGRAM_USERNAME})</a></p></div></blockquote>`;

    const _processEmbed = () => {
      try {
        (window as any).instgrm?.Embeds?.process(_embedRef.current);
      } catch (_) {}
    };

    if ((window as any).instgrm?.Embeds?.process) {
      _processEmbed();
      return;
    }

    if (_scriptLoaded.current || document.getElementById("ig-embed-script")) {
      const _waitTimer = setInterval(() => {
        if ((window as any).instgrm?.Embeds?.process) {
          clearInterval(_waitTimer);
          _processEmbed();
        }
      }, 200);
      return () => clearInterval(_waitTimer);
    }

    _scriptLoaded.current = true;
    const script = document.createElement("script");
    script.id = "ig-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => {
      setTimeout(_processEmbed, 100);
    };
    document.body.appendChild(script);
  }, [isMounted]);

  return (
    <div className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111]">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" />

      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-md flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 leading-none mb-0.5">
              Instagram
            </p>
            <p className="text-[13px] font-black uppercase italic tracking-tight text-black dark:text-white leading-none">
              @{INSTAGRAM_USERNAME}
            </p>
          </div>
        </div>

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ee2a7b] to-[#6228d7] text-white shadow-sm hover:from-[#6228d7] hover:to-[#ee2a7b] transition-all duration-300 flex-shrink-0"
        >
          Follow
        </a>
      </div>

      <div ref={_embedRef} className="px-3 pb-2 overflow-hidden min-h-[250px]">
        {!isMounted && <div className="animate-pulse bg-neutral-100 dark:bg-neutral-900 h-full w-full" />}
      </div>

      <div className="px-6 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ee2a7b] hover:text-[#6228d7] transition-colors duration-300"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          View all posts on Instagram
        </a>
      </div>
    </div>
  );
}

function YouTubeWidget() {
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
    <a
      href={YOUTUBE_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111] transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
        <div className="h-1.5 w-full bg-[#FF0000]" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF0000] flex items-center justify-center shadow-md flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
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

          <p className="text-[12px] font-serif italic text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">
            Watch videos & shorts on{" "}
            <span className="font-black not-italic text-black dark:text-white">
              @{YOUTUBE_CHANNEL_HANDLE}
            </span>{" "}
            ✦
          </p>

          <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF0000] group-hover:text-red-700 transition-colors duration-300">
            <_Pc size={13} />
            Visit channel on YouTube
          </div>
        </div>
      </div>
    </a>
  );
}

function TumblrWidget() {
  const _iframeRef = _uR<HTMLIFrameElement>(null);
  const [_iframeHeight, _setIframeHeight] = _s(350);
  const [isMounted, setIsMounted] = _s(false);

  _e(() => {
    setIsMounted(true);
    const _handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://embed.tumblr.com") return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.height && typeof data.height === "number") {
          _setIframeHeight(data.height + 20);
        }
      } catch (_) {}
    };
    window.addEventListener("message", _handleMessage);
    return () => window.removeEventListener("message", _handleMessage);
  }, []);

  return (
    <div className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111]">
      <div className="h-1.5 w-full bg-[#35465D]" />

      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#35465D] flex items-center justify-center shadow-md flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.306 1.406z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 leading-none mb-0.5">
              Tumblr
            </p>
            <p className="text-[13px] font-black uppercase italic tracking-tight text-black dark:text-white leading-none">
              deulo
            </p>
          </div>
        </div>

        <a
          href={TUMBLR_BLOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#35465D] text-white shadow-sm hover:opacity-80 transition-opacity flex-shrink-0"
        >
          Follow
        </a>
      </div>

      <div className="px-3 pb-2 overflow-hidden" data-embed-type="tumblr">
        {isMounted ? (
          <iframe
            ref={_iframeRef}
            src={TUMBLR_EMBED_HREF}
            className="w-full border-0 rounded-lg"
            style={{ height: _iframeHeight, maxHeight: 600 }}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Tumblr post embed"
          />
        ) : (
          <div style={{ height: 350 }} className="w-full bg-neutral-100 dark:bg-neutral-900 animate-pulse rounded-lg" />
        )}
      </div>

      <div className="px-6 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <a
          href={TUMBLR_BLOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#35465D] dark:text-[#6fa3d8] hover:opacity-70 transition-opacity duration-300"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          View all posts on Tumblr
        </a>
      </div>
    </div>
  );
}

function SubstackWidget() {
  const _embedRef = _uR<HTMLDivElement>(null);
  const _scriptLoaded = _uR(false);
  const [isMounted, setIsMounted] = _s(false);

  _e(() => {
    setIsMounted(true);
  }, []);

  _e(() => {
    if (!isMounted || !_embedRef.current) return;

    _embedRef.current.innerHTML = `<div class="substack-post-embed" style="min-height:80px"><p lang="en">${SUBSTACK_POST_TITLE} by deulo</p><p>${SUBSTACK_POST_DESC}</p><a data-post-link href="${SUBSTACK_URL}">Read on Substack</a></div>`;

    if (_scriptLoaded.current || document.getElementById("substack-embed-script")) return;

    _scriptLoaded.current = true;
    const script = document.createElement("script");
    script.id = "substack-embed-script";
    script.src = "https://substack.com/embedjs/embed.js";
    script.async = true;
    script.setAttribute("charset", "utf-8");
    document.body.appendChild(script);
  }, [isMounted]);

  return (
    <div className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111]">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF6719] to-[#FF8C00]" />

      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6719] to-[#FF8C00] flex items-center justify-center shadow-md flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
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
          className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF6719] to-[#FF8C00] text-white shadow-sm hover:opacity-80 transition-opacity flex-shrink-0"
        >
          Subscribe
        </a>
      </div>

      <div ref={_embedRef} className="px-4 pb-2 min-h-[80px]">
         {!isMounted && <div className="animate-pulse bg-neutral-100 dark:bg-neutral-900 h-20 w-full" />}
      </div>

      <div className="px-6 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <a
          href={SUBSTACK_ROOT_URL}
          target="_blank"
          rel="noopener noreferrer"
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
    <div className="rounded-[2rem] border-2 border-black dark:border-white overflow-hidden shadow-xl bg-white dark:bg-[#111] transition-all duration-300 hover:shadow-2xl">
      <div className="h-1.5 w-full bg-[#E60023]" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E60023] flex items-center justify-center shadow-md flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
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
            className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-[#E60023] text-white shadow-sm hover:bg-red-800 transition-colors duration-300 flex-shrink-0"
          >
            Follow
          </a>
        </div>

        <p className="text-[12px] font-serif italic text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">
          Discover pins & boards on{" "}
          <span className="font-black not-italic text-black dark:text-white">
            Pinterest
          </span>{" "}
          ✦
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <a
            href={PINTEREST_PIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-bold text-[#E60023] hover:underline truncate"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            Pinned — View Pin ①
          </a>
          <a
            href={PINTEREST_PIN_URL_2}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-bold text-[#E60023] hover:underline truncate"
          >
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            Pinned — View Pin ②
          </a>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E60023] hover:text-red-800 transition-colors duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          <a
            href={PINTEREST_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View profile on Pinterest
          </a>
        </div>
      </div>
    </div>
  );
}

function SocialWidgetsDesktop() {
  return (
    <div className="flex flex-col gap-6">
      <InstagramWidget />
      <YouTubeWidget />
      <TumblrWidget />
      <SubstackWidget />
      <PinterestWidget />
    </div>
  );
}

function SocialWidgetsMobileTop() {
  return (
    <div className="lg:hidden flex flex-col gap-6 my-10 max-w-[840px] mx-auto">
      <InstagramWidget />
      <YouTubeWidget />
      <TumblrWidget />
    </div>
  );
}

function SocialWidgetsMobileBottom() {
  return (
    <div className="lg:hidden flex flex-col gap-6 mt-10 max-w-[840px] mx-auto">
      <SubstackWidget />
      <PinterestWidget />
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
  return (
    <div
      className={`flex gap-4 md:gap-6 relative ${
        isReply ? "ml-10 md:ml-16 mt-6" : ""
      }`}
    >
      {isReply && (
        <_Cr
          className="absolute -left-10 top-2 text-neutral-300 dark:text-neutral-800"
          size={20}
        />
      )}

      <div className="flex-shrink-0">
        <div
          className={`${
            isReply ? "w-10 h-10" : "w-14 h-14"
          } border-2 border-black dark:border-white overflow-hidden bg-neutral-100 dark:bg-neutral-900 shadow-sm`}
        >
          {avatar ? (
            <img
              src={avatar}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              alt=""
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 font-black tracking-tighter italic">
              <_Us size={isReply ? 16 : 24} />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2">
          <h4
            className={`font-black uppercase italic ${
              isReply ? "text-[11px]" : "text-[13px]"
            } flex items-center gap-2 text-black dark:text-white`}
          >
            {comment.user_name}
            {comment.id.toString().startsWith("temp-") && (
              <span className="text-[9px] not-italic text-emerald-500 animate-pulse tracking-widest">
                SYNCING...
              </span>
            )}
          </h4>
          <span className="text-[10px] font-bold opacity-40 uppercase">
            <FormattedDate dateString={comment.created_at} />
          </span>
        </div>

        <div
          className={`${
            isReply ? "text-[15px]" : "text-[18px]"
          } leading-relaxed font-serif text-neutral-800 dark:text-neutral-200 break-words mb-3`}
        >
          {comment.content}
        </div>

        {!isReply && onReply && (
          <button
            onClick={onReply}
            className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-emerald-600 hover:text-emerald-400 transition-colors"
          >
            <_Rp size={12} /> Reply
          </button>
        )}
      </div>
    </div>
  );
}

function CommentSection({ articleId }: { articleId: string }) {
  const { user: _u } = useAuth();
  const _nav = _uN();
  const _qC = useQueryClient();

  const [_txt, _sTxt] = _s<string>("");
  const [_sub, _sSub] = _s<boolean>(false);
  const [_replyTo, _sReplyTo] = _s<string | null>(null);
  const [_localComments, _setLocalComments] = _s<_Cu[]>([]);
  const [_blobCache, _sBlobCache] = _s<Record<string, string>>({});

  const _hydrateAvatar = async (
    url: string | null | undefined,
    userId: string
  ) => {
    if (!url || url.startsWith("blob:") || _blobCache[userId]) return;
    try {
      const _fmt = await _dBF();
      const response = await fetch(url);
      const blob = await response.blob();
      const optimized = await _wTI(blob, _fmt, 0.4);
      const blobUrl = URL.createObjectURL(optimized);
      _sBlobCache((prev) => ({ ...prev, [userId]: blobUrl }));
    } catch (e) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
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

  const _onAddComment = async (
    content: string,
    parentId: string | null = null
  ) => {
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
      mirrorQuery({
        type: "COMMENT_POST",
        articleId,
        ts: Date.now(),
      });

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

  const _getRenderAvatar = (
    url: string | null | undefined,
    uid: string
  ): string | null => {
    const result =
      uid === _u?.id
        ? _blobCache["me"] || url
        : _blobCache[uid] || url;
    return result || null;
  };

  return (
    <section className="max-w-[840px] mx-auto py-16 border-t-2 border-neutral-100 dark:border-neutral-900 px-4 md:px-0">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-red-600 text-white rounded-full">
          <_Ms size={20} />
        </div>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white">
          Discussion ({_localComments.length})
        </h3>
      </div>

      {_u ? (
        <form
          id="comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            _onAddComment(_txt, _replyTo);
          }}
          className="mb-16"
        >
          <div className="relative overflow-hidden border-2 border-black dark:border-white rounded-xl shadow-2xl">
            {_replyTo && (
              <div className="bg-emerald-500 text-black px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                  <_Rp size={12} /> Replying_To: {_replyTo.slice(0, 8)}
                </span>
                <button
                  type="button"
                  onClick={() => _sReplyTo(null)}
                  className="hover:scale-110 transition-transform"
                >
                  <_X size={14} />
                </button>
              </div>
            )}

            <label htmlFor="comment-textarea" className="sr-only">
              Write your perspective
            </label>
            <textarea
              id="comment-textarea"
              name="comment_content"
              value={_txt}
              onChange={(e) => _sTxt(e.target.value)}
              placeholder={
                _replyTo
                  ? "Transmitting reply..."
                  : "Write your perspective..."
              }
              className="w-full bg-neutral-50 dark:bg-neutral-950 p-6 font-serif text-lg min-h-[140px] focus:outline-none resize-none text-black dark:text-white placeholder:opacity-20"
            />

            <div className="flex justify-between items-center p-4 bg-white dark:bg-black border-t-2 border-black dark:border-white">
              <span className="text-[10px] font-black uppercase opacity-50 tracking-widest text-black dark:text-white">
                ID_NODE: {_u.user_metadata?.full_name || "Member"}
              </span>
              <button
                type="submit"
                disabled={_sub || !_txt.trim()}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 hover:invert active:scale-95 transition-all disabled:opacity-30"
              >
                {_sub ? (
                  <_L2 className="animate-spin" size={14} />
                ) : (
                  <_Sd size={14} />
                )}{" "}
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
            className="px-10 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg"
          >
            Sign Up Now
          </button>
        </div>
      )}

      <div className="space-y-12">
        <_AP mode="popLayout">
          {_rootComments.map((_c) => (
            <_m.div
              key={_c.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group"
            >
              <CommentItem
                comment={_c}
                avatar={_getRenderAvatar(_c.user_avatar_url, _c.user_id)}
                onReply={() => {
                  _sReplyTo(_c.id);
                }}
              />

              <div className="space-y-6">
                {_replies
                  .filter((r) => r.parent_id === _c.id)
                  .map((r) => (
                    <CommentItem
                      key={r.id}
                      comment={r}
                      isReply
                      avatar={_getRenderAvatar(
                        r.user_avatar_url,
                        r.user_id
                      )}
                    />
                  ))}
              </div>
            </_m.div>
          ))}
        </_AP>
      </div>
    </section>
  );
}

export default function ArticleDetail() {
  const { slug: _sl } = _uP<{ slug: string }>();
  const _slV = _sl ?? "unknown";

  const [_blobUrl, _setBlobUrl] = _s<string | null>(null);
  const [_blurUrl, _setBlurUrl] = _s<string | null>(null);

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

  const _allMedia = _uM(() => {
    const sourceStr = _art?.featured_image_url || _art?.featured_image;
    if (!sourceStr) return [];
    return sourceStr.split(/[\r\n]+/).filter(Boolean);
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
        typeof u === "string" &&
        u.trim().length > 0 &&
        isTweetUrl(u.trim())
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

  const _animatedImages = _uM(
    () =>
      _extraMedia.filter(
        (url: string) =>
          !isTweetUrl(url) && url.match(/\.(gif|gifv|webp)$/i)
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
          !url.match(/\.(gif|gifv|webp)$/i)
      ),
    [_extraMedia]
  );

  const _getEmbedUrl = (url: string) => {
    try {
      const match = url.match(/(?:shorts\/|v=|youtu\.be\/)([\w-]{11})/);
      const videoId = match ? match[1] : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (e) {
      return null;
    }
  };

  const _parsedParagraphs = _uM<ParsedBlock[]>(
    () => (_pD ? parseParagraphs(_pD.paragraphs) : []),
    [_pD]
  );

  _e(() => {
    setIsHydrated(true);
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(`brawnly_saved_${_slV}`);
      _siS(saved === "true");
    }
    if (typeof navigator !== "undefined") {
      _sOff(!navigator.onLine);
    }
  }, [_slV]);

  _e(() => {
    warmupEnterpriseStorage();
    registerSW();
    detectBestFormat();

    const oN = () => _sOff(false);
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
    (async () => {
      try {
        const cached = await getAssetFromShared(`cover_${_slV}`);
        if (cached && _active) {
          _setBlobUrl(URL.createObjectURL(cached));
          return;
        }

        const res = await fetch(_rawImgSource);
        const b = await res.blob();

        const placeholder = await _wCP(b);
        if (_active) _setBlurUrl(placeholder);

        const _fmt = await _dBF();
        let final: string;

        if (_rawImgSource.match(/\.(mp4|webm|ogg|mov)$/i)) {
          const vThumb = await _wVT(b, 0.25);
          final = URL.createObjectURL(vThumb);
          await saveAssetToShared(`cover_${_slV}`, vThumb);
        } else {
          const opt = await _wTI(b, _fmt, 0.75);
          final = URL.createObjectURL(opt);
          await saveAssetToShared(`cover_${_slV}`, opt);
        }

        if (_active) _setBlobUrl(final);
      } catch (e) {
        if (_active) _setBlobUrl(_rawImgSource);
      }
    })();

    return () => {
      _active = false;
    };
  }, [_rawImgSource, _slV]);

  _e(() => {
    if (_art?.id && !_hasTracked) {
      setCookieHash(_slV);
      mirrorQuery({
        type: "ARTICLE_VIEW",
        id: _art.id,
        slug: _slV,
        ts: Date.now(),
      });
      _sHasTracked(true);
    }
  }, [_art?.id, _hasTracked, _slV]);

  const { data: _allA } = _uAs();
  const _hC = _uM(
    () =>
      _allA
        ? [..._allA]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3)
        : [],
    [_allA]
  );

  const _hSv = () => {
    const _nS = !_iS;
    _siS(_nS);
    if (_nS) {
      localStorage.setItem(`brawnly_saved_${_slV}`, "true");
      toast.success("Identity Saved");
    } else {
      localStorage.removeItem(`brawnly_saved_${_slV}`);
      toast.info("Removed");
    }
  };

  const { viewCount: _realtimeViews } = _uAV({
    id: _art?.id ?? "",
    slug: _slV,
    initialViews: _art?.views ?? 0,
  });

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
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pb-24 text-black dark:text-white transition-all duration-500 relative overflow-x-hidden">
      <_Hm>
        <title>{_pD.title} | Brawnly</title>
        <meta
          property="og:image"
          content={_gOI(_rawImgSource || "", 1200)}
        />
      </_Hm>

      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
        <button
          onClick={_hSv}
          className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-500 border-2 ${
            _iS
              ? "bg-emerald-500 border-black text-black scale-110"
              : "bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 shadow-xl"
          }`}
        >
          {_iS ? <_Ck size={20} /> : <_Bm size={20} />}
        </button>

        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
               navigator.clipboard.writeText(window.location.href);
               toast.success("Node Link Copied");
            }
          }}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 hover:border-red-600 transition-all duration-500"
        >
          <_Sh size={20} />
        </button>
      </aside>

      <div className="max-w-[1320px] mx-auto px-4 md:px-10">
        <header className="pt-12 md:pt-16 pb-8 md:pb-10 border-b-[8px] md:border-b-[12px] border-black dark:border-white mb-8 md:mb-10 relative text-black dark:text-white">
          <div className="flex justify-between items-start mb-6">
            <_L
              to="/articles"
              className="text-red-700 font-black uppercase text-[11px] md:text-[13px] tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all italic"
            >
              <_Al size={14} /> Node_Explore
            </_L>

            {_isOff && (
              <span className="flex items-center gap-2 text-red-500 text-[9px] font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full">
                <_Wo size={12} /> OFFLINE
              </span>
            )}
          </div>

          <h1 className="text-[36px] sm:text-[45px] md:text-[92px] leading-[0.9] md:leading-[0.82] font-black uppercase tracking-tighter mb-8 md:mb-10 italic break-words">
            {_pD.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-end justify-between py-6 md:py-8 border-t-2 border-black dark:border-white gap-6">
            <div className="flex items-center gap-4 md:gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden border-2 border-black grayscale shadow-lg bg-neutral-100">
                <img
                  src={_gOI(_mA, 120)}
                  className="w-full h-full object-cover"
                  alt="B"
                />
              </div>
              <div>
                <span className="block text-[13px] md:text-[15px] font-black uppercase italic">
                  By {_art.author || "Brawnly"}
                </span>
                <span className="text-[10px] md:text-[12px] uppercase opacity-80">
                  <FormattedDate dateString={_art.published_at} />
                </span>
              </div>
            </div>
            
            <div className="text-xl md:text-2xl font-black italic flex items-center gap-3">
              {_realtimeViews.toLocaleString('en-US')}{" "}
              <_Ey size={20} className="text-red-600" />
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
          <article className="flex-1 relative min-w-0">
            <p className="text-[20px] md:text-[32px] leading-[1.2] md:leading-[1.1] font-extrabold mb-10 md:mb-14 tracking-tight text-neutral-900 dark:text-neutral-100 italic">
              {_pD.excerpt}
            </p>

            <div className="relative mb-12 md:mb-20 px-4 md:px-12 lg:px-20">
              <div className="absolute left-[-15px] sm:left-[-30px] md:left-[-60px] lg:left-[-80px] top-1/2 -translate-y-1/2 w-20 sm:w-32 md:w-48 lg:w-56 z-10 opacity-90 pointer-events-none">
                <img
                  src={_muscleLeft}
                  alt="Decorative Arm Left"
                  className="w-full drop-shadow-2xl"
                />
              </div>
              <div className="relative overflow-hidden group rounded-2xl md:rounded-3xl border-2 border-black dark:border-white shadow-2xl z-20 bg-black">
                <ArticleCoverImage
                  imageUrl={_blobUrl || _rawImgSource || ""}
                  title={_pD.title}
                  slug={_slV}
                  className="w-full aspect-video md:aspect-[21/9] object-cover"
                />
              </div>
              <div className="absolute right-[-15px] sm:right-[-30px] md:right-[-60px] lg:right-[-80px] top-1/2 -translate-y-1/2 w-20 sm:w-32 md:w-48 lg:w-56 z-10 opacity-90 pointer-events-none">
                <img
                  src={_muscleRight}
                  alt="Decorative Arm Right"
                  className="w-full drop-shadow-2xl"
                />
              </div>
            </div>

            <SocialWidgetsMobileTop />

            <div className="max-w-[840px] mx-auto">
              {_parsedParagraphs.map((block, i) => {
                if (block.type === "tweet") {
                  return (
                    <div key={`para-tweet-${i}`} className="my-10 md:my-14">
                      <TwitterEmbed url={block.url} align="center" />
                    </div>
                  );
                }
                return (
                  <div
                    key={`para-text-${i}`}
                    className="text-[18px] md:text-[22px] leading-[1.8] md:leading-[1.85] mb-8 md:mb-10 font-serif text-neutral-800 dark:text-neutral-300"
                    dangerouslySetInnerHTML={{ __html: block.html }}
                  />
                );
              })}
            </div>

            {_allTweetUrls.length > 0 && (
              <section className="my-16 max-w-[840px] mx-auto">
                <div className="flex items-center gap-3 mb-10 opacity-60">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-5 h-5 fill-current text-black dark:text-white"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[10px] uppercase font-black tracking-[0.3em]">
                    Embedded_Tweets
                  </span>
                </div>
                <div className="flex flex-col gap-8">
                  {_allTweetUrls.map((url, idx) => (
                    <TwitterEmbed
                      key={`db-tweet-${idx}`}
                      url={url}
                      align="center"
                    />
                  ))}
                </div>
              </section>
            )}

            {_youtubeShorts.length > 0 && (
              <div className="my-16 max-w-[840px] mx-auto">
                {_youtubeShorts.map((videoUrl: string, idx: number) => {
                  const embedUrl = _getEmbedUrl(videoUrl);
                  if (!embedUrl) return null;

                  const autoplayUrl = `${embedUrl}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;

                  return (
                    <div
                      key={`yt-${idx}`}
                      className="flex flex-col items-center justify-center mb-16"
                    >
                      <div className="relative w-full flex justify-center">
                        <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full transform scale-75 opacity-50 pointer-events-none" />

                        <iframe
                          width="459"
                          height="816"
                          src={autoplayUrl}
                          title={`Shorts video ${idx + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          className="relative z-10 max-w-full rounded-2xl border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] bg-black"
                        />
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-red-600 dark:text-red-500 font-bold uppercase tracking-widest text-[11px]">
                        <_Pc size={16} /> Watch Short
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {_animatedImages.length > 0 && (
              <section className="my-20 max-w-[600px] mx-auto">
                <div className="flex items-center justify-center gap-3 mb-10 opacity-70">
                  <_Ap size={18} className="animate-spin-slow" />
                  <span className="text-[10px] uppercase font-black tracking-[0.3em]">
                    Motion_Capture
                  </span>
                </div>
                <div className="flex flex-col gap-10 items-center">
                  {_animatedImages.map((img: string, idx: number) => (
                    <div
                      key={`gif-${idx}`}
                      className="w-auto max-w-[80%] md:max-w-full relative group"
                    >
                      <img
                        src={_fC(img)}
                        alt={`Motion ${idx}`}
                        className="w-full h-auto rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800"
                        style={{ objectFit: "contain" }}
                        loading="lazy"
                      />
                      <div className="absolute -bottom-3 -right-3 bg-black text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest border border-white">
                        GIF
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {_galleryImages.length > 0 && (
              <section className="mt-20 mb-12 border-t-2 border-neutral-100 dark:border-neutral-900 pt-16">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-full">
                    <_Ca size={18} />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-black dark:text-white">
                    Gallery
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {_galleryImages.map((img: string, idx: number) => (
                    <div
                      key={idx}
                      className="overflow-hidden border-2 border-black dark:border-white rounded-xl group shadow-lg bg-neutral-100 relative"
                    >
                      <img
                        src={_fC(img)}
                        alt={`Gallery node ${idx}`}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 aspect-square md:aspect-[4/5]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <SocialWidgetsMobileBottom />
                </div>
              </section>
            )}

            {_galleryImages.length === 0 && <SocialWidgetsMobileBottom />}

            <div className="flex xl:hidden items-center gap-4 mb-16 border-t-2 border-neutral-100 dark:border-neutral-900 pt-8 mt-8">
              <button
                onClick={_hSv}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 font-black uppercase text-[12px] tracking-widest transition-all shadow-md active:scale-95 ${
                  _iS
                    ? "bg-emerald-500 border-black text-black"
                    : "bg-white dark:bg-black border-black dark:border-white text-black dark:text-white"
                }`}
              >
                {_iS ? <_Ck size={16} /> : <_Bm size={16} />}
                {_iS ? "Saved" : "Save"}
              </button>

              <button
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Node Link Copied");
                  }
                }}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[12px] tracking-widest shadow-md hover:invert active:scale-95 transition-all"
              >
                <_Sh size={16} />
                Permalink
              </button>
            </div>

            <CommentSection articleId={_art.id} />
          </article>

          <aside className="hidden lg:block w-[320px] xl:w-[350px] flex-shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="p-8 bg-neutral-50 dark:bg-[#111] rounded-[2.5rem] border-2 border-black dark:border-white shadow-xl">
                <h3 className="text-[12px] font-black uppercase tracking-widest text-emerald-600 mb-8 italic flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping" />{" "}
                  Trending
                </h3>
                <div className="flex flex-col gap-10">
                  {_hC.map((it: any, i: number) => (
                    <_L
                      to={`/article/${it.slug}`}
                      key={it.id}
                      className="group block"
                    >
                      <div className="flex gap-4">
                        <span className="text-3xl font-black text-neutral-200 dark:text-neutral-800 group-hover:text-emerald-500 transition-colors">
                          0{i + 1}
                        </span>
                        <div>
                          <p className="text-[14px] font-black leading-tight uppercase group-hover:underline line-clamp-2 text-black dark:text-white">
                            {it.title}
                          </p>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">
                            {(it.views || 0).toLocaleString('en-US')} Identity_Reads
                          </span>
                        </div>
                      </div>
                    </_L>
                  ))}
                </div>
              </div>

              <SocialWidgetsDesktop />
            </div>
          </aside>
        </div>
      </div>

      <ScrollToTopButton />
    </main>
  );
}