import React, { useEffect, useState } from "react";
import ArticleList from "@/components/features/ArticleList";
import { supabase } from "@/lib/supabase";
import { useLocation } from "react-router-dom"; // Import useLocation untuk deteksi hash

import centralGif from "@/assets/Brawnly-17aDfvayqUvay.gif";
import leftGif from "@/assets/Brawnly-17VaIyauwVGvanab8Vf.gif";
import rightGif from "@/assets/Brawnly.gif";
import prideMustache from "@/assets/myPride.gif";

import {
  getArticlesSnap,
  mirrorQuery,
  setCookieHash,
  warmupEnterpriseStorage
} from "@/lib/enterpriseStorage";
import { loadSnap, saveSnap, type SnapArticle } from "@/lib/storageSnap";

import { syncArticles } from "@/lib/supabaseSync";

import { registerSW } from "@/pwa/swRegister";
import { openDB } from "@/lib/idbQueue";
import { detectBestFormat } from "@/lib/imageFormat";

const Home = () => {
  const location = useLocation(); // Hook lokasi
  const [articles, setArticles] = useState<any[]>(() => {
    const localData = getArticlesSnap();
    return localData.length > 0 ? localData : loadSnap();
  });
  const [isSyncing, setSyncing] = useState(false);

  // Logic Scroll Otomatis ke Feed Section
  useEffect(() => {
    if (location.hash === "#feed-section") {
      const element = document.getElementById("feed-section");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100); // Delay sedikit agar render selesai
      }
    }
  }, [location]);

  useEffect(() => {
    let _mounted = true;

    const _initEnterpriseNode = async () => {
      try {
        await Promise.all([
          registerSW(),
          openDB(),
          warmupEnterpriseStorage(),
          detectBestFormat()
        ]);

        const snap = getArticlesSnap();
        if (snap && snap.length > 0 && _mounted) {
          setArticles(snap);
        }

        setCookieHash("brawnly_session");
        mirrorQuery({ type: "HOME_FEED_INIT", ts: Date.now() });

        if (navigator.onLine) {
          setSyncing(true);
          const _fetcher = async () => {
            const { data, error } = await supabase
              .from("articles")
              .select("*, author:profiles(username, avatar_url)")
              .eq("published", true)
              .order("published_at", { ascending: false })
              .limit(20);
            
            if (error) throw error;
            return data || [];
          };

          const freshData = await syncArticles(_fetcher);

          if (freshData && Array.isArray(freshData) && _mounted) {
            setArticles(freshData);
            window.__BRAWNLY_SNAP__ = freshData;

            const snapData: SnapArticle[] = freshData.slice(0, 10).map(a => ({
              title: a.title,
              slug: a.slug,
              image: a.featured_image
            }));
            saveSnap(snapData);
          }
        }

        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg.sync) {
            try {
              await reg.sync.register("sync-articles");
            } catch {}
          }
        }
      } catch (err) {
        console.error("[NODE_INIT_FAIL]", err);
      } finally {
        if (_mounted) setSyncing(false);
      }
    };

    _initEnterpriseNode();
    return () => { _mounted = false; };
  }, []);

  const _s = {
    main: "min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans transition-colors duration-500",
    hero: "pt-12 pb-6 border-b-4 border-black dark:border-white mb-2",
    inner: "max-w-[1280px] mx-auto px-4 md:px-8",
    topGrid: "flex flex-col md:flex-row gap-8 items-start mb-12",
    sideArt: "hidden lg:block w-1/4 pt-4 border-t border-gray-200 dark:border-neutral-800",
    mainCenter: "flex-1 border-t-2 border-black dark:border-white pt-4",
    category: "text-[12px] font-black uppercase tracking-wider text-red-600 mb-2 block",
    headline: "text-[42px] md:text-[84px] leading-[0.9] font-black uppercase tracking-tighter mb-6",
    subline: "text-lg md:text-xl font-medium leading-tight text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl font-serif",
    author: "text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 border-black dark:border-white pb-1 inline-block mb-10",
    gifCentral: "w-full max-w-[480px] h-auto object-cover rounded-none mb-4 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.02)] border border-neutral-200 dark:border-neutral-800",
    gifSide: "w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300 mb-2 grayscale hover:grayscale-0",
    mustache: "h-5 w-auto object-contain mt-2 opacity-30"
  };

  const pProps = { fetchpriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>;

   return (
    <main className={_s.main}>
      <section className={_s.hero}>
        <div className={_s.inner}>
          <div className={_s.topGrid}>
            <div className={_s.sideArt}>
              <span className={_s.category}>Trending Now</span>
              <img src={leftGif} alt="L" className={_s.gifSide} {...pProps} />
              <img src={prideMustache} alt="m" className={_s.mustache} />
              <p className="text-xs font-bold mt-4 leading-snug">
                How Brawnly is Redefining Wellness in 2026.
              </p>
            </div>

            <div className={_s.mainCenter}>
              <span className={_s.category}>Cover Story</span>
              <h1 className={_s.headline}>
                The Sexiest Men <br/>
                <span className="text-neutral-300 dark:text-neutral-700">
                  Photos Handpicked.
                </span>
              </h1>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="relative">
                  <img src={centralGif} alt="Main" className={_s.gifCentral} {...pProps} />
                  <img src={prideMustache} alt="m" className="h-8 w-auto mt-4 mx-auto md:mx-0" />
                </div>

                <div className="flex-1">
                  <p className={_s.subline}>
                    An exclusive editorial look at the aesthetic standards of 2026,
                    curated specifically for the Brawnly community by this gay man.
                  </p>
                  <span className={_s.author}>
                    By Brawnly Owner
                  </span>
                </div>
              </div>
            </div>

            <div className={_s.sideArt}>
              <span className={_s.category}>Must Read</span>
              <img src={rightGif} alt="R" className={_s.gifSide} {...pProps} />
              <img src={prideMustache} alt="m" className={_s.mustache} />
              <p className="text-xs font-bold mt-4 leading-snug">
                Exclusive: The Art of Fitness and Masculinity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FIX: ID ditambahkan di sini */}
      <section id="feed-section" className="py-12">
        <div className={_s.inner}>
          <div className="flex items-baseline justify-between border-b-8 border-black dark:border-white mb-10 pb-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">
              Feed
            </h2>
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
              Latest Updates
            </span>
          </div>

          <div className="min-h-[1000px]">
            {/* Logic: Mengirim data snapshot ke list jika list mendukung initialData */}
            <ArticleList selectedTag={null} searchTerm="" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;