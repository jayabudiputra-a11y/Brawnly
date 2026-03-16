const _CREATOR_NAME = "Budi Putra Jaya";
const _CREATOR_URL = "https://www.brawnly.online";

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

function _extractYtId(url: string): string | null {
  return url.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{11})/)?.[1] ?? null;
}

function _safeDesc(description: string | undefined, name: string): string {
  const d = (description || name || "Video content").trim();
  return d.length > 0 ? d : "Video content";
}

export function buildYouTubeVideoJsonLd(params: {
  videoUrl: string;
  name: string;
  description: string;
  uploadDate?: string | null;
}): string {
  const { videoUrl, name, description, uploadDate } = params;
  const videoId = _extractYtId(videoUrl);
  const safeDate = _safeDate(uploadDate);
  const safeDescStr = _safeDesc(description, name);

  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description: safeDescStr,
    uploadDate: safeDate,
    contentUrl: videoUrl,
    author: {
      "@type": "Person",
      name: _CREATOR_NAME,
      url: _CREATOR_URL,
    },
  };

  if (videoId) {
    obj.embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    obj.thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  }

  return JSON.stringify(obj);
}

export function buildMp4VideoJsonLd(params: {
  videoUrl: string;
  name: string;
  description: string;
  uploadDate?: string | null;
  thumbnailUrl?: string;
}): string {
  const { videoUrl, name, description, uploadDate, thumbnailUrl } = params;
  const safeDate = _safeDate(uploadDate);
  const safeDescStr = _safeDesc(description, name);

  const obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description: safeDescStr,
    uploadDate: safeDate,
    contentUrl: videoUrl,
    author: {
      "@type": "Person",
      name: _CREATOR_NAME,
      url: _CREATOR_URL,
    },
  };

  if (thumbnailUrl) obj.thumbnailUrl = thumbnailUrl;

  return JSON.stringify(obj);
}

export function buildVideoJsonLdList(params: {
  youtubeShortsUrls: string[];
  mp4VideoUrls: string[];
  name: string;
  description: string;
  uploadDate?: string | null;
  thumbnailUrl?: string;
}): string[] {
  const {
    youtubeShortsUrls,
    mp4VideoUrls,
    name,
    description,
    uploadDate,
    thumbnailUrl,
  } = params;

  return [
    ...youtubeShortsUrls.map((videoUrl) =>
      buildYouTubeVideoJsonLd({ videoUrl, name, description, uploadDate })
    ),
    ...mp4VideoUrls.map((videoUrl) =>
      buildMp4VideoJsonLd({ videoUrl, name, description, uploadDate, thumbnailUrl })
    ),
  ];
}