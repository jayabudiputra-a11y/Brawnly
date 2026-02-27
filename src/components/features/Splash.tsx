import { useEffect, useState } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import { setCookieHash, mirrorQuery } from "@/lib/enterpriseStorage";
import { detectBestFormat } from "@/lib/imageFormat";
import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";
import { saveAssetToShared, getAssetFromShared } from "@/lib/sharedStorage";
import "@/styles/splash.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const texts = [
  "I am Budi Putra Jaya",
  "I am here for you babe",
  "I am gay like you",
];

const photos = [
  `https://res.cloudinary.com/dtkiwn8i4/image/upload/v1772196867/qeb5419ze2ok240tufnz.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/self/putra-self.jpeg`,
  `${SUPABASE_URL}/storage/v1/object/public/self/putra-self%20(2).jpeg`,
  `${SUPABASE_URL}/storage/v1/object/public/self/putra-selfk.jpeg`,
];

const videoSrc = `${SUPABASE_URL}/storage/v1/object/public/self/putra-self.mp4`;

const mediaItems = [...photos, videoSrc];

const rotations = [
  "rotate-6",
  "-rotate-12",
  "rotate-6",
  "-rotate-12",
  "rotate-3",
];

export default function Splash() {
  const [textIndex, setTextIndex] = useState(0);
  const [blobs, setBlobs] = useState<Record<string, string>>({});

  useEffect(() => {
    const textTimer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 1400);

    const script = document.createElement("script");
    script.src =
      "https://pl28680659.effectivegatecpm.com/c57d71c78e6c823d7af356008a2e25b5/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);

    setCookieHash("splash_session");
    mirrorQuery({ event: "splash_view", ts: Date.now() });

    const processImages = async () => {
      const fmt = await detectBestFormat();
      const newBlobs: Record<string, string> = {};

      for (let i = 0; i < photos.length; i++) {
        const id = `splash_img_${i}`;
        const cached = await getAssetFromShared(id);

        if (cached) {
          newBlobs[i] = URL.createObjectURL(cached);
        } else if (navigator.onLine) {
          try {
            const res = await fetch(photos[i]);
            const blob = await res.blob();
            const optimized = await wasmTranscodeImage(blob, fmt, 0.85);
            await saveAssetToShared(id, optimized);
            newBlobs[i] = URL.createObjectURL(optimized);
          } catch {
            newBlobs[i] = photos[i];
          }
        } else {
          newBlobs[i] = photos[i];
        }
      }

      setBlobs(newBlobs);
    };

    processImages();

    return () => {
      clearInterval(textTimer);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      Object.values(blobs).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  return (
    <section className="splash-section">
      <div className="splash-header">
        <h1 key={textIndex} className="splash-title">
          {texts[textIndex]}
        </h1>
      </div>

      <div className="splash-media-wrapper">
        {mediaItems.map((item, index) => {
          const isVideo = item === videoSrc;
          const imgSrc =
            index < photos.length ? blobs[index] || photos[index] : "";
          const isMainPhoto =
            !isVideo && photos[index]?.includes("putra-self.jpeg");

          return (
            <div
              key={index}
              className={`splash-card ${
                isVideo
                  ? "video-card"
                  : isMainPhoto
                  ? "main-photo"
                  : "frame-photo"
              } ${rotations[index]}`}
            >
              {isVideo ? (
                <video
                  src={item}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="splash-media"
                />
              ) : (
                <img
                  src={imgSrc}
                  alt={`Media ${index}`}
                  className="splash-media"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="splash-ad-wrapper">
        <div className="splash-ad-box">
          <div
            id="container-c57d71c78e6c823d7af356008a2e25b5"
            className="splash-ad-container"
          ></div>
        </div>
      </div>

      <ScrollToTopButton />
    </section>
  );
}