import { useEffect, useState } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import { getOptimizedImage } from "@/lib/utils";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const texts = [
  "I am Budi Putra Jaya",
  "I am here for you babe",
  "I am gay like you",
];

const photos = [
  `${SUPABASE_URL}/storage/v1/object/public/Shawty/bbUBA8bbYBjuh8Bb8BBgb8GVrrv.jpg`,
  `https://res.cloudinary.com/dtkiwn8i4/image/upload/v1770883490/c8ixfb8zot9ncrt2n63m.png`,
  `${SUPABASE_URL}/storage/v1/object/public/Shawty/Hguba8b1u19hb.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/Shawty/hb81V78BNjubBUHBBUB.jpg`,
];

const videoSrc = `${SUPABASE_URL}/storage/v1/object/public/Shawty/Bbu8h19BiuJJnG.mp4`;

export default function Splash() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 1400);

    const script = document.createElement("script");
    script.src = "https://pl28680659.effectivegatecpm.com/c57d71c78e6c823d7af356008a2e25b5/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);

    return () => {
      clearInterval(timer);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex flex-col items-center z-50 overflow-y-auto py-12">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12 px-4 min-h-[128px]">
        <div className="relative h-20 flex items-center justify-center min-w-[300px]">
          <h1
            key={textIndex}
            className="text-4xl md:text-6xl font-black tracking-tighter text-emerald-600 text-center animate-slide-in"
          >
            {texts[textIndex]}
          </h1>
        </div>

        <div className="video-card shadow-xl transform rotate-3 border-4 border-white dark:border-neutral-900 rounded-2xl overflow-hidden bg-black w-48 h-32">
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="w-full max-w-[320px] mb-10 flex flex-col items-center justify-center">
        <div 
          className="w-[300px] h-[300px] bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200 flex items-center justify-center overflow-hidden"
          style={{ fontSize: "17px", color: "#0c0202" }}
        >
          <div id="container-c57d71c78e6c823d7af356008a2e25b5" className="w-full h-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-40 min-h-[300px]">
        <div className="rounded-full border-4 border-emerald-500 p-1 w-32 h-32 overflow-hidden shadow-md animate-from-top bg-neutral-100">
          <img 
            src={getOptimizedImage(photos[0], 250)} 
            alt="Avatar" 
            width="128"
            height="128"
            className="w-full h-full object-cover rounded-full" 
            {...{ fetchpriority: "high" }} 
          />
        </div>

        <div className="w-32 h-32 relative overflow-hidden animate-from-right bg-neutral-100">
          <div className="absolute inset-0 clip-hexagon shadow-lg">
            <img 
              src={getOptimizedImage(photos[1], 250)} 
              alt="Hex" 
              width="128"
              height="128"
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          </div>
        </div>

        <div className="w-32 h-32 rounded-[30%] overflow-hidden shadow-lg animate-from-bottom bg-neutral-100">
          <img 
            src={getOptimizedImage(photos[2], 250)} 
            alt="Squircle" 
            width="128"
            height="128"
            className="w-full h-full object-cover" 
            loading="lazy"
          />
        </div>

        <div className="w-32 h-32 overflow-hidden transform rotate-3 shadow-xl rounded-lg animate-from-left bg-neutral-100">
          <img 
            src={getOptimizedImage(photos[3], 250)} 
            alt="Tilted" 
            width="128"
            height="128"
            className="w-full h-full object-cover" 
            loading="lazy"
          />
        </div>
      </div>

      <ScrollToTopButton />
    </section>
  );
}