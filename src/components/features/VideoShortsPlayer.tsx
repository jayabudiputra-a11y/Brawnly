import React, { useState, useEffect, useRef } from "react";
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
  const d = (description || title || "Video content").trim();
  return d.length > 0 ? d : "Video content";
}

interface VideoShortsPlayerProps {
  videoUrl: string;
  title: string;
  index: number;
  articleDate?: string;
  description?: string;
  compact?: boolean;
}

export default function VideoShortsPlayer({
  videoUrl,
  title,
  index,
  articleDate,
  description,
  compact = false,
}: VideoShortsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        if (entry.isIntersecting) {
          videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          videoRef.current.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleUnmute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = false;
    setMuted(false);
  };

  const playerWidth = compact ? "min(280px, 90vw)" : "min(360px, 82vw)";
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
      <meta itemProp="contentUrl" content={videoUrl} />
      <meta itemProp="uploadDate" content={safeDate} />
      <span
        itemScope
        itemType="https://schema.org/Person"
        itemProp="author"
        style={{ display: "none" }}
      >
        <meta itemProp="name" content={_CREATOR_NAME} />
      </span>

      <div ref={wrapRef} className="relative w-full flex justify-center">
        <div
          className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full transform scale-75 opacity-40 pointer-events-none"
          aria-hidden="true"
        />

        <div
          className="relative z-10 overflow-hidden rounded-2xl border-[4px] border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)] bg-black cursor-pointer"
          style={{ width: playerWidth, aspectRatio: "9 / 16" }}
          onClick={handleTogglePlay}
          role="button"
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        >
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 animate-pulse z-10">
              <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
            </div>
          )}

          <video
            ref={videoRef}
            src={videoUrl}
            muted={muted}
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            aria-label={`${title} — Video ${index + 1}`}
            onCanPlay={() => setLoaded(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />

          {!playing && loaded && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl">
                <PlayCircle size={28} className="text-white ml-1" aria-hidden="true" />
              </div>
            </div>
          )}

          {muted && playing && (
            <button
              onClick={handleUnmute}
              aria-label="Tap to unmute video"
              className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm transition-all duration-200 border border-white/20"
            >
              <VolumeX size={12} aria-hidden="true" />
              Unmute
            </button>
          )}

          {!muted && playing && (
            <div
              className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-green-600/80 text-white rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider pointer-events-none backdrop-blur-sm animate-pulse"
              aria-hidden="true"
            >
              <Volume2 size={12} />
              Live
            </div>
          )}

          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-red-600 dark:text-red-500 font-bold uppercase tracking-widest text-[11px]">
        <PlayCircle size={16} aria-hidden="true" />
        Watch Video
      </div>
    </div>
  );
}