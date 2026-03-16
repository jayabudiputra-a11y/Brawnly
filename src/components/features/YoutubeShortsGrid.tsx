import React from "react";
import YouTubeShortsPlayer from "@/components/features/YoutubeShortsPlayer";

interface YouTubeShortsGridProps {
  shorts: string[];
  title: string;
  thumbUrl?: string;
  articleDate?: string;
  description?: string;
}

export default function YouTubeShortsGrid({
  shorts,
  title,
  thumbUrl,
  articleDate,
  description,
}: YouTubeShortsGridProps) {
  if (shorts.length === 0) return null;

  if (shorts.length === 1) {
    return (
      <YouTubeShortsPlayer
        videoUrl={shorts[0]}
        title={title}
        index={0}
        thumbUrl={thumbUrl}
        articleDate={articleDate}
        description={description}
      />
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full"
      aria-label={`${shorts.length} YouTube Shorts`}
    >
      {shorts.map((videoUrl, idx) => (
        <YouTubeShortsPlayer
          key={`yt-grid-${idx}`}
          videoUrl={videoUrl}
          title={title}
          index={idx}
          thumbUrl={thumbUrl}
          articleDate={articleDate}
          description={description}
          compact
        />
      ))}
    </div>
  );
}