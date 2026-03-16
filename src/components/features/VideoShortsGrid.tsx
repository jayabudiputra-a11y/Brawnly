import React from "react";
import VideoShortsPlayer from "@/components/features/VideoShortsPlayer";

interface VideoShortsGridProps {
  videos: string[];
  title: string;
  articleDate?: string;
  description?: string;
}

export default function VideoShortsGrid({
  videos,
  title,
  articleDate,
  description,
}: VideoShortsGridProps) {
  if (videos.length === 0) return null;

  if (videos.length === 1) {
    return (
      <VideoShortsPlayer
        videoUrl={videos[0]}
        title={title}
        index={0}
        articleDate={articleDate}
        description={description}
      />
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full"
      aria-label={`${videos.length} videos`}
    >
      {videos.map((url, idx) => (
        <VideoShortsPlayer
          key={`mp4-grid-${idx}`}
          videoUrl={url}
          title={title}
          index={idx}
          articleDate={articleDate}
          description={description}
          compact
        />
      ))}
    </div>
  );
}