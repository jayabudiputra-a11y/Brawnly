import React, { useEffect, useState, startTransition } from "react";
import ArticleList from "@/components/features/ArticleList";
import { supabase } from "@/lib/supabase";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

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

const SITE_URL = "https://www.brawnly.online";
const SITE_NAME = "Brawnly";
const AUTHOR_NAME = "Budi Putra Jaya";
const PAGE_DESCRIPTION =
  "Brawnly — LGBTQ+ Fitness Inspiration, Muscle Worship, Mindset & Wellness. Exclusive editorial content curated for the Brawnly community.";
const HERO_HEADLINE = "The Sexiest Men — Photos Handpicked.";
const HERO_SUBLINE =
  "An exclusive editorial look at the aesthetic standards of 2026, curated specifically for the Brawnly community by this gay man.";

// ─── Image License Constants (Budi Putra Jaya) ─────────────────────────────
const IMAGE_LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
const IMAGE_COPYRIGHT_NOTICE = "© 2026 Budi Putra Jaya. All rights reserved.";
const IMAGE_ACQUIRE_LICENSE_URL = `${SITE_URL}/license`;
const IMAGE_CREATOR_NAME = AUTHOR_NAME;

// ─── Absolute asset URLs ────────────────────────────────────────────────────
// Vite resolves these as relative hashed paths; prepend SITE_URL for schema.org
const _centralGifAbs = `${SITE_URL}${centralGif}`;
const _leftGifAbs    = `${SITE_URL}${leftGif}`;
const _rightGifAbs   = `${SITE_URL}${rightGif}`;

const _jLdWebSite = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  "url": SITE_URL,
  "name": SITE_NAME,
  "description": PAGE_DESCRIPTION,
  "inLanguage": "id",
  "publisher": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/masculineLogo.svg`,
      "contentUrl": `${SITE_URL}/masculineLogo.svg`,
      "name": `${SITE_NAME} logo`,
      "license": IMAGE_LICENSE_URL,
      "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
      "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
      "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
    },
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${SITE_URL}/articles?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

const _jLdOrganization = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": SITE_NAME,
  "url": SITE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${SITE_URL}/masculineLogo.svg`,
    "contentUrl": `${SITE_URL}/masculineLogo.svg`,
    "name": `${SITE_NAME} logo`,
    "width": 32,
    "height": 32,
    "license": IMAGE_LICENSE_URL,
    "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
    "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
    "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
  },
  "description": PAGE_DESCRIPTION,
  "foundingDate": "2026",
  "foundingLocation": {
    "@type": "Place",
    "name": "Medan, Indonesia",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Medan",
      "addressCountry": "ID",
    },
  },
  "sameAs": [SITE_URL],
  "knowsAbout": [
    "LGBTQ+",
    "Fitness",
    "Muscle Worship",
    "Mindset",
    "Wellness",
    "Physical Performance",
  ],
});

const _jLdPerson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": AUTHOR_NAME,
  "url": SITE_URL,
  "jobTitle": "Editor & Founder",
  "worksFor": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Medan",
    "addressCountry": "ID",
  },
  "knowsAbout": ["LGBTQ+", "Fitness", "Muscle Worship", "Mindset", "Wellness"],
  "sameAs": [SITE_URL],
});

const _jLdWebPage = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": SITE_URL,
  "url": SITE_URL,
  "name": `${SITE_NAME} — LGBTQ+ Fitness & Editorial`,
  "description": PAGE_DESCRIPTION,
  "inLanguage": "id",
  "isPartOf": {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "name": SITE_NAME,
    "url": SITE_URL,
  },
  "about": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
  },
  "author": {
    "@type": "Person",
    "name": AUTHOR_NAME,
    "url": SITE_URL,
  },
  "publisher": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", "h2", ".hero-subline"],
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
    ],
  },
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "url": _centralGifAbs,
    "contentUrl": _centralGifAbs,
    "name": `${SITE_NAME} — Cover Story hero image`,
    "description": "Hero editorial visual — Brawnly Cover Story 2026",
    "encodingFormat": "image/gif",
    "license": IMAGE_LICENSE_URL,
    "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
    "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
    "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
  },
});

const _jLdBreadcrumb = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
  ],
});

const _jLdCoverStory = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": HERO_HEADLINE,
  "description": HERO_SUBLINE,
  "url": SITE_URL,
  "articleSection": "Cover Story",
  "image": {
    "@type": "ImageObject",
    "url": _centralGifAbs,
    "contentUrl": _centralGifAbs,
    "name": `${SITE_NAME} — Cover Story hero image`,
    "description": "Hero editorial visual — Brawnly Cover Story 2026",
    "encodingFormat": "image/gif",
    "license": IMAGE_LICENSE_URL,
    "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
    "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
    "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
  },
  "author": {
    "@type": "Person",
    "name": AUTHOR_NAME,
    "url": SITE_URL,
  },
  "publisher": {
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/masculineLogo.svg`,
      "contentUrl": `${SITE_URL}/masculineLogo.svg`,
      "license": IMAGE_LICENSE_URL,
      "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
      "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
      "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
    },
  },
  "datePublished": "2026-01-01",
  "isPartOf": {
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
  },
  "keywords": "LGBTQ+, Fitness, Muscle Worship, Mindset, Wellness, Brawnly",
});

// ─── JSON-LD Hero Image Metadata (standalone ImageObject) ───────────────────
const _jLdHeroImageCentral = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "url": _centralGifAbs,
  "contentUrl": _centralGifAbs,
  "name": `${SITE_NAME} — Cover Story hero image`,
  "description": "Hero editorial visual — Brawnly Cover Story 2026",
  "encodingFormat": "image/gif",
  "license": IMAGE_LICENSE_URL,
  "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
  "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
  "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
  "creditText": IMAGE_CREATOR_NAME,
});

const _jLdHeroImageLeft = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "url": _leftGifAbs,
  "contentUrl": _leftGifAbs,
  "name": `${SITE_NAME} — Trending sidebar visual`,
  "description": "Trending sidebar animated visual — Brawnly 2026",
  "encodingFormat": "image/gif",
  "license": IMAGE_LICENSE_URL,
  "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
  "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
  "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
  "creditText": IMAGE_CREATOR_NAME,
});

const _jLdHeroImageRight = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "url": _rightGifAbs,
  "contentUrl": _rightGifAbs,
  "name": `${SITE_NAME} — Must Read sidebar visual`,
  "description": "Must Read sidebar animated visual — Brawnly 2026",
  "encodingFormat": "image/gif",
  "license": IMAGE_LICENSE_URL,
  "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
  "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
  "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
  "creditText": IMAGE_CREATOR_NAME,
});

const Home = () => {
  const location = useLocation();
  const [articles, setArticles] = useState<any[]>(() => {
    const localData = getArticlesSnap();
    return localData.length > 0 ? localData : loadSnap();
  });
  const [isSyncing, setSyncing] = useState(false);
  const [shouldRenderFeed, setShouldRenderFeed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setShouldRenderFeed(true);
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.hash === "#feed-section" && shouldRenderFeed) {
      const element = document.getElementById("feed-section");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location, shouldRenderFeed]);

  useEffect(() => {
    let _mounted = true;

    const _initEnterpriseNode = async () => {
      try {
        const snap = getArticlesSnap();
        if (snap && snap.length > 0 && _mounted) {
          setArticles(snap);
        }

        setTimeout(async () => {
          if (!_mounted) return;
          try {
            await Promise.all([
              registerSW(),
              openDB(),
              warmupEnterpriseStorage(),
              import("@/lib/imageFormat").then(m => m.detectBestFormat())
            ]);
            
            setCookieHash("brawnly_session");
            mirrorQuery({ type: "HOME_FEED_INIT", ts: Date.now() });

            if (navigator.onLine) {
              setSyncing(true);
              const { data, error } = await supabase
                .from("articles")
                .select("*, author:profiles(username, avatar_url)")
                .eq("published", true)
                .order("published_at", { ascending: false })
                .limit(20);

              if (error) throw error;
              const freshData = data || [];

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
          } catch (e) {
            console.error("[NODE_INIT_DEFERRED_FAIL]", e);
          } finally {
            if (_mounted) setSyncing(false);
          }
        }, 3000);
      } catch (err) {
        console.error("[NODE_INIT_FAIL]", err);
      }
    };

    _initEnterpriseNode();
    return () => { _mounted = false; };
  }, []);

  const _jLdFeedList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${SITE_NAME} Latest Articles`,
    "description": "Latest published articles and editorial content from Brawnly.",
    "url": `${SITE_URL}/#feed-section`,
    "numberOfItems": articles.length,
    "itemListElement": articles.slice(0, 15).map((a: any, i: number) => {
      const imgUrl = a.featured_image || a.featured_image_url || undefined;
      return {
        "@type": "ListItem",
        "position": i + 1,
        "url": `${SITE_URL}/article/${a.slug}`,
        "name": a.title,
        "item": {
          "@type": "BlogPosting",
          "url": `${SITE_URL}/article/${a.slug}`,
          "headline": a.title,
          "description": a.excerpt || a.description || undefined,
          "image": imgUrl
            ? {
                "@type": "ImageObject",
                "url": imgUrl,
                "contentUrl": imgUrl,
                "name": a.title,
                "license": IMAGE_LICENSE_URL,
                "creator": { "@type": "Person", "name": IMAGE_CREATOR_NAME },
                "copyrightNotice": IMAGE_COPYRIGHT_NOTICE,
                "acquireLicensePage": IMAGE_ACQUIRE_LICENSE_URL,
              }
            : undefined,
          "datePublished": a.published_at || a.created_at || undefined,
          "dateModified": a.updated_at || a.published_at || undefined,
          "articleSection": a.category || "Brawnly Selection",
          "author": {
            "@type": "Person",
            "name": a.author?.username || AUTHOR_NAME,
          },
          "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/ReadAction",
            "userInteractionCount": a.views ?? 0,
          },
        },
      };
    }),
  };

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
    gifCentral: "w-full max-w-[480px] h-auto object-cover rounded-none mb-4 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.02)] border border-neutral-200 dark:border-neutral-800 content-visibility-auto",
    gifSide: "w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300 mb-2 grayscale hover:grayscale-0 content-visibility-auto",
    mustache: "h-5 w-auto object-contain mt-2 opacity-30"
  };

  const pProps = { fetchpriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>;

  return (
    <main
      className={_s.main}
      itemScope
      itemType="https://schema.org/WebPage"
      aria-label={`${SITE_NAME} homepage`}
    >
      <Helmet>
        {/* FIX: canonical tanpa trailing slash → cegah Pages with redirect */}
        <link rel="canonical" href={SITE_URL} />
      </Helmet>

      <script type="application/ld+json">{_jLdWebSite}</script>
      <script type="application/ld+json">{_jLdOrganization}</script>
      <script type="application/ld+json">{_jLdPerson}</script>
      <script type="application/ld+json">{_jLdWebPage}</script>
      <script type="application/ld+json">{_jLdBreadcrumb}</script>
      <script type="application/ld+json">{_jLdCoverStory}</script>
      <script type="application/ld+json">{JSON.stringify(_jLdFeedList)}</script>
      {/* Standalone ImageObject JSON-LD untuk setiap hero GIF */}
      <script type="application/ld+json">{_jLdHeroImageCentral}</script>
      <script type="application/ld+json">{_jLdHeroImageLeft}</script>
      <script type="application/ld+json">{_jLdHeroImageRight}</script>

      <meta itemProp="url" content={SITE_URL} />
      <meta itemProp="name" content={`${SITE_NAME} — LGBTQ+ Fitness & Editorial`} />
      <meta itemProp="description" content={PAGE_DESCRIPTION} />
      <meta itemProp="inLanguage" content="id" />

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
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <span itemProp="name">{SITE_NAME}</span>
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {SITE_NAME}
          </a>
          <span itemProp="description">{PAGE_DESCRIPTION}</span>
          <span itemProp="foundingDate">2026</span>
          <span
            itemScope
            itemType="https://schema.org/ImageObject"
            itemProp="logo"
          >
            <meta itemProp="url" content={`${SITE_URL}/masculineLogo.svg`} />
            <meta itemProp="contentUrl" content={`${SITE_URL}/masculineLogo.svg`} />
            <meta itemProp="name" content={`${SITE_NAME} logo`} />
            <meta itemProp="license" content={IMAGE_LICENSE_URL} />
            <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
            <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
            </span>
          </span>
          <span
            itemScope
            itemType="https://schema.org/PostalAddress"
            itemProp="address"
          >
            <span itemProp="addressLocality">Medan</span>
            <span itemProp="addressCountry">ID</span>
          </span>
          <meta itemProp="knowsAbout" content="LGBTQ+" />
          <meta itemProp="knowsAbout" content="Fitness" />
          <meta itemProp="knowsAbout" content="Muscle Worship" />
          <meta itemProp="knowsAbout" content="Mindset" />
          <meta itemProp="knowsAbout" content="Wellness" />
        </span>

        <span itemScope itemType="https://schema.org/Person" itemProp="author">
          <span itemProp="name">{AUTHOR_NAME}</span>
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {AUTHOR_NAME}
          </a>
          <meta itemProp="jobTitle" content="Editor & Founder" />
          <span
            itemScope
            itemType="https://schema.org/PostalAddress"
            itemProp="address"
          >
            <span itemProp="addressLocality">Medan</span>
            <span itemProp="addressCountry">ID</span>
          </span>
        </span>

        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {SITE_NAME}
          </a>
          <span itemProp="name">{SITE_NAME}</span>
          <span itemProp="description">{PAGE_DESCRIPTION}</span>
        </span>

        <article itemScope itemType="https://schema.org/Article">
          <h1 itemProp="headline">{HERO_HEADLINE}</h1>
          <p itemProp="description">{HERO_SUBLINE}</p>
          <meta itemProp="articleSection" content="Cover Story" />
          <meta itemProp="keywords" content="LGBTQ+, Fitness, Muscle Worship, Mindset, Wellness, Brawnly" />
          <span itemScope itemType="https://schema.org/Person" itemProp="author">
            <span itemProp="name">{AUTHOR_NAME}</span>
          </span>
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            Cover Story — {SITE_NAME}
          </a>
          {/* FIX: ImageObject dengan url, contentUrl, license, creator, copyrightNotice, acquireLicensePage */}
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
            <meta itemProp="url" content={_centralGifAbs} />
            <meta itemProp="contentUrl" content={_centralGifAbs} />
            <meta itemProp="name" content={`${SITE_NAME} — Central hero image`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="description" content="Hero editorial visual — Brawnly Cover Story 2026" />
            <meta itemProp="license" content={IMAGE_LICENSE_URL} />
            <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
            <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
            </span>
          </span>
        </article>

        <aside aria-label="Trending Now">
          <span itemProp="keywords" content="Trending" />
          <p>How Brawnly is Redefining Wellness in 2026.</p>
          {/* FIX: Trending sidebar ImageObject */}
          <span itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="url" content={_leftGifAbs} />
            <meta itemProp="contentUrl" content={_leftGifAbs} />
            <meta itemProp="name" content={`${SITE_NAME} — Trending sidebar visual`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="description" content="Trending sidebar animated visual — Brawnly 2026" />
            <meta itemProp="license" content={IMAGE_LICENSE_URL} />
            <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
            <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
            </span>
          </span>
        </aside>

        <aside aria-label="Must Read">
          <p>Exclusive: The Art of Fitness and Masculinity.</p>
          {/* FIX: Must Read sidebar ImageObject */}
          <span itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="url" content={_rightGifAbs} />
            <meta itemProp="contentUrl" content={_rightGifAbs} />
            <meta itemProp="name" content={`${SITE_NAME} — Must Read sidebar visual`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="description" content="Must Read sidebar animated visual — Brawnly 2026" />
            <meta itemProp="license" content={IMAGE_LICENSE_URL} />
            <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
            <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
            </span>
          </span>
        </aside>

        <span itemScope itemType="https://schema.org/BreadcrumbList">
          <span
            itemScope
            itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
          >
            <meta itemProp="position" content="1" />
            <a href={SITE_URL} itemProp="item" tabIndex={-1} rel="noopener noreferrer">
              <span itemProp="name">Home</span>
            </a>
          </span>
        </span>

        <section aria-label="Hidden SEO article feed">
          <h2>Latest Articles</h2>
          <ol itemScope itemType="https://schema.org/ItemList">
            <meta itemProp="name" content={`${SITE_NAME} Latest Articles`} />
            <meta itemProp="numberOfItems" content={String(articles.length)} />
            {articles.map((a: any, i: number) => (
              <li
                key={`seo-home-${a.id || a.slug || i}`}
                itemScope
                itemType="https://schema.org/BlogPosting"
                itemProp="itemListElement"
              >
                <meta itemProp="position" content={String(i + 1)} />
                <a
                  href={`${SITE_URL}/article/${a.slug}`}
                  itemProp="url"
                  tabIndex={-1}
                  rel="noopener noreferrer"
                >
                  {a.title}
                </a>
                <meta itemProp="headline" content={a.title} />
                {(a.excerpt || a.description) && (
                  <meta itemProp="description" content={a.excerpt || a.description} />
                )}
                {/* FIX: ImageObject dengan url & contentUrl absolut + metadata */}
                {(a.featured_image || a.featured_image_url) && (() => {
                  const imgUrl = a.featured_image || a.featured_image_url;
                  return (
                    <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
                      <meta itemProp="url" content={imgUrl} />
                      <meta itemProp="contentUrl" content={imgUrl} />
                      <meta itemProp="name" content={a.title} />
                      <meta itemProp="license" content={IMAGE_LICENSE_URL} />
                      <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
                      <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
                      <span itemScope itemType="https://schema.org/Person" itemProp="creator">
                        <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
                      </span>
                    </span>
                  );
                })()}
                {(a.published_at || a.created_at) && (
                  <meta itemProp="datePublished" content={a.published_at || a.created_at} />
                )}
                {a.category && (
                  <meta itemProp="articleSection" content={a.category} />
                )}
                <span
                  itemScope
                  itemType="https://schema.org/Person"
                  itemProp="author"
                >
                  <span itemProp="name">{a.author?.username || AUTHOR_NAME}</span>
                </span>
                <span
                  itemScope
                  itemType="https://schema.org/InteractionCounter"
                  itemProp="interactionStatistic"
                >
                  <meta itemProp="interactionType" content="https://schema.org/ReadAction" />
                  <meta itemProp="userInteractionCount" content={String(a.views ?? 0)} />
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section
        className={_s.hero}
        aria-label="Brawnly Cover Story hero"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content={HERO_HEADLINE} />
        <meta itemProp="description" content={HERO_SUBLINE} />
        <meta itemProp="articleSection" content="Cover Story" />
        <meta itemProp="url" content={SITE_URL} />
        <span itemScope itemType="https://schema.org/Person" itemProp="author" style={{ display: "none" }}>
          <meta itemProp="name" content={AUTHOR_NAME} />
        </span>

        <div className={_s.inner}>
          <div className={_s.topGrid}>

            <aside
              className={_s.sideArt}
              aria-label="Trending Now"
              itemScope
              itemType="https://schema.org/WPSideBar"
            >
              <span
                className={_s.category}
                aria-label="Category: Trending Now"
              >
                Trending Now
              </span>
              {/* FIX: Trending sidebar img — microdata ImageObject lengkap */}
              <div
                itemScope
                itemType="https://schema.org/ImageObject"
              >
                <meta itemProp="url" content={_leftGifAbs} />
                <meta itemProp="contentUrl" content={_leftGifAbs} />
                <meta itemProp="name" content={`${SITE_NAME} — trending visual`} />
                <meta itemProp="encodingFormat" content="image/gif" />
                <meta itemProp="description" content="Trending sidebar animated visual — Brawnly 2026" />
                <meta itemProp="license" content={IMAGE_LICENSE_URL} />
                <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
                <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
                <span itemScope itemType="https://schema.org/Person" itemProp="creator">
                  <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
                </span>
                <img
                  src={leftGif}
                  alt={`${SITE_NAME} — trending visual (animated)`}
                  className={_s.gifSide}
                  {...pProps}
                />
              </div>
              <img
                src={prideMustache}
                alt={`${SITE_NAME} pride mustache icon`}
                className={_s.mustache}
              />
              <p
                className="text-xs font-bold mt-4 leading-snug"
                itemProp="description"
              >
                How Brawnly is Redefining Wellness in 2026.
              </p>
            </aside>

            <div
              className={_s.mainCenter}
              itemScope
              itemType="https://schema.org/Article"
            >
              <meta itemProp="articleSection" content="Cover Story" />
              <meta itemProp="headline" content={HERO_HEADLINE} />

              <span
                className={_s.category}
                aria-label="Category: Cover Story"
              >
                Cover Story
              </span>

              <h1
                className={_s.headline}
                itemProp="headline"
              >
                The Sexiest Men <br />
                <span className="text-neutral-300 dark:text-neutral-700">
                  Photos Handpicked.
                </span>
              </h1>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* FIX: Cover ImageObject dengan semua field wajib + opsional */}
                <div
                  className="relative"
                  itemScope
                  itemType="https://schema.org/ImageObject"
                  itemProp="image"
                >
                  <meta itemProp="url" content={_centralGifAbs} />
                  <meta itemProp="contentUrl" content={_centralGifAbs} />
                  <meta itemProp="name" content={`${SITE_NAME} — Cover Story hero image`} />
                  <meta itemProp="description" content="Hero editorial visual — Brawnly Cover Story 2026" />
                  <meta itemProp="encodingFormat" content="image/gif" />
                  <meta itemProp="license" content={IMAGE_LICENSE_URL} />
                  <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
                  <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
                  <span itemScope itemType="https://schema.org/Person" itemProp="creator" style={{ display: "none" }}>
                    <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
                  </span>
                  <img
                    src={centralGif}
                    alt={`${SITE_NAME} — Cover Story hero image (animated)`}
                    className={_s.gifCentral}
                    {...pProps}
                  />
                  <img
                    src={prideMustache}
                    alt={`${SITE_NAME} pride icon`}
                    className="h-8 w-auto mt-4 mx-auto md:mx-0"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex-1">
                  <p
                    className={`${_s.subline} hero-subline`}
                    itemProp="description"
                  >
                    An exclusive editorial look at the aesthetic standards of 2026,
                    curated specifically for the Brawnly community by this gay man.
                  </p>
                  <span
                    className={_s.author}
                    itemProp="author"
                  >
                    By Brawnly Owner
                  </span>
                </div>
              </div>
            </div>

            <aside
              className={_s.sideArt}
              aria-label="Must Read"
              itemScope
              itemType="https://schema.org/WPSideBar"
            >
              <span
                className={_s.category}
                aria-label="Category: Must Read"
              >
                Must Read
              </span>
              {/* FIX: Must Read sidebar img — microdata ImageObject lengkap */}
              <div
                itemScope
                itemType="https://schema.org/ImageObject"
              >
                <meta itemProp="url" content={_rightGifAbs} />
                <meta itemProp="contentUrl" content={_rightGifAbs} />
                <meta itemProp="name" content={`${SITE_NAME} — must read visual`} />
                <meta itemProp="encodingFormat" content="image/gif" />
                <meta itemProp="description" content="Must Read sidebar animated visual — Brawnly 2026" />
                <meta itemProp="license" content={IMAGE_LICENSE_URL} />
                <meta itemProp="copyrightNotice" content={IMAGE_COPYRIGHT_NOTICE} />
                <meta itemProp="acquireLicensePage" content={IMAGE_ACQUIRE_LICENSE_URL} />
                <span itemScope itemType="https://schema.org/Person" itemProp="creator">
                  <meta itemProp="name" content={IMAGE_CREATOR_NAME} />
                </span>
                <img
                  src={rightGif}
                  alt={`${SITE_NAME} — must read visual (animated)`}
                  className={_s.gifSide}
                  {...pProps}
                />
              </div>
              <img
                src={prideMustache}
                alt={`${SITE_NAME} pride mustache icon`}
                className={_s.mustache}
              />
              <p
                className="text-xs font-bold mt-4 leading-snug"
                itemProp="description"
              >
                Exclusive: The Art of Fitness and Masculinity.
              </p>
            </aside>

          </div>
        </div>
      </section>

      <section
        id="feed-section"
        className="py-12"
        aria-label="Latest articles feed"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <meta itemProp="name" content={`${SITE_NAME} Latest Articles`} />
        <meta itemProp="description" content="Latest published articles and editorial content from Brawnly." />
        <meta itemProp="numberOfItems" content={String(articles.length)} />
        <meta itemProp="url" content={`${SITE_URL}/#feed-section`} />

        <div className={_s.inner}>
          <header
            className="flex items-baseline justify-between border-b-8 border-black dark:border-white mb-10 pb-2"
            aria-label="Feed section header"
          >
            <h2
              className="text-4xl font-black uppercase tracking-tighter italic"
              itemProp="name"
            >
              Feed
            </h2>
            <span
              className="text-xs font-black uppercase tracking-widest text-neutral-400"
              aria-label="Section subtitle: Latest Updates"
            >
              Latest Updates
            </span>
          </header>

          <div
            className="min-h-[1000px]"
            role="region"
            aria-label="Article feed"
            aria-live="polite"
          >
            {shouldRenderFeed ? (
              <ArticleList selectedTag={null} searchTerm="" />
            ) : (
              <div className="w-full h-96 flex items-center justify-center">
                <div className="w-20 h-1 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;