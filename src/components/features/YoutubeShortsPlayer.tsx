import React, { useState, useEffect, useRef, useMemo } from "react";
import { PlayCircle, VolumeX, Volume2 } from "lucide-react";

const _CREATOR_NAME = "Budi Putra Jaya";

function _safeDate(d: string | null | undefined): string {
  if (!d) return new Date().toISOString();
  try {
    const p = new Date(d);
    if (isNaN(p.getTime())) return new Date().toISOString();
    return p.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function _safeDesc(description: string | undefined, title: string): string {
  const d = (description || title || "YouTube Short").trim();
  return d.length > 0 ? d : "YouTube Short";
}

interface YouTubeShortsPlayerProps {
  videoUrl: string;
  title: string;
  index: number;
  thumbUrl?: string;
  articleDate?: string;
  description?: string;
  compact?: boolean;
}

export default function YouTubeShortsPlayer({
  videoUrl,
  title,
  index,
  thumbUrl,
  articleDate,
  description,
  compact = false,
}: YouTubeShortsPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [muted, setMuted] = useState(true);
  const [_playerReady, _setPlayerReady] = useState(false);

  const videoId = useMemo(() => {
    try {
      return (
        videoUrl.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1] || null
      );
    } catch {
      return null;
    }
  }, [videoUrl]);

  const embedBase = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : null;

  const ytThumbnailUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    : thumbUrl;

  const iframeSrc = useMemo(() => {
    if (!embedBase) return "";
    const params = new URLSearchParams({
      autoplay: "1",
      mute: muted ? "1" : "0",
      loop: "1",
      playlist: videoId || "",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      enablejsapi: "1",
      origin: typeof window !== "undefined" ? window.location.origin : "",
    });
    return `${embedBase}?${params.toString()}`;
  }, [embedBase, videoId, muted]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data) return;
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (d?.event === "onReady") _setPlayerReady(true);
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleUnmute = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "unMute", args: [] }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "setVolume", args: [100] }),
          "*"
        );
        setMuted(false);
        return;
      } catch {}
    }
    setMuted(false);
  };

  if (!embedBase || !videoId) return null;

  const playerWidth = compact ? "min(280px, 90vw)" : "min(340px, 80vw)";
  const safeDate = _safeDate(articleDate);
  const safeDescValue = _safeDesc(description, title);

  return (
    <div
      className={`flex flex-col items-center justify-center ${compact ? "mb-6" : "mb-16"}`}
      itemScope
      itemType="https://schema.org/VideoObject"
    >
      <meta itemProp="position" content={String(index + 1)} />
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={safeDescValue} />
      <meta itemProp="embedUrl" content={embedBase} />
      <meta itemProp="contentUrl" content={videoUrl} />
      <meta itemProp="uploadDate" content={safeDate} />
      {ytThumbnailUrl && (
        <meta itemProp="thumbnailUrl" content={ytThumbnailUrl} />
      )}
      <span
        itemScope
        itemType="https://schema.org/Person"
        itemProp="author"
        style={{ display: "none" }}
      >
        <meta itemProp="name" content={_CREATOR_NAME} />
      </span>

      <div className="relative w-full flex justify-center">
        <div
          className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full transform scale-75 opacity-50 pointer-events-none"
          aria-hidden="true"
        />

        <div
          className="relative z-10 overflow-hidden rounded-2xl border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] bg-black"
          style={{ width: playerWidth, aspectRatio: "9 / 16" }}
        >
          <div
            style={{
              position: "absolute",
              top: "-58px",
              left: "-2px",
              right: "-2px",
              bottom: "-64px",
            }}
          >
            <iframe
              ref={iframeRef}
              key={`yt-shorts-${videoId}-${muted ? "m" : "u"}`}
              src={iframeSrc}
              title={`${title} — Video ${index + 1}`}
              style={{ width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>

          {muted && (
            <button
              onClick={handleUnmute}
              aria-label="Tap to unmute video"
              className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm transition-all duration-200 border border-white/20"
            >
              <VolumeX size={12} aria-hidden="true" />
              Unmute
            </button>
          )}

          {!muted && (
            <div
              className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-green-600/80 text-white rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider pointer-events-none backdrop-blur-sm animate-pulse"
              aria-hidden="true"
            >
              <Volume2 size={12} />
              Live
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-red-600 dark:text-red-500 font-bold uppercase tracking-widest text-[11px]">
        <PlayCircle size={16} aria-hidden="true" /> Watch Short
      </div>
    </div>
  );
}