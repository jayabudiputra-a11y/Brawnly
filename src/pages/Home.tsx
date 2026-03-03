import React, { useEffect, useState } from "react";
import ArticleList from "@/components/features/ArticleList";
import { supabase } from "@/lib/supabase";
import { useLocation } from "react-router-dom";

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

/* ============================================================
   CONSTANTS
   ============================================================ */
const SITE_URL = "https://www.brawnly.online";
const SITE_NAME = "Brawnly";
const AUTHOR_NAME = "Budi Putra Jaya";
const PAGE_DESCRIPTION =
  "Brawnly — LGBTQ+ Fitness Inspiration, Muscle Worship, Mindset & Wellness. Exclusive editorial content curated for the Brawnly community.";
const HERO_HEADLINE = "The Sexiest Men — Photos Handpicked.";
const HERO_SUBLINE =
  "An exclusive editorial look at the aesthetic standards of 2026, curated specifically for the Brawnly community by this gay man.";

/* ============================================================
   STATIC JSON-LD — serialised once outside component
   ============================================================ */

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
      "name": `${SITE_NAME} logo`,
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
    "name": `${SITE_NAME} logo`,
    "width": 32,
    "height": 32,
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
});

const _jLdBreadcrumb = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
  ],
});

// Hero editorial cover story
const _jLdCoverStory = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": HERO_HEADLINE,
  "description": HERO_SUBLINE,
  "url": SITE_URL,
  "articleSection": "Cover Story",
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

const Home = () => {
  const location = useLocation();
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
        }, 100);
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

  // Dynamic JSON-LD: feed article list (live articles state)
  const _jLdFeedList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${SITE_NAME} Latest Articles`,
    "description": "Latest published articles and editorial content from Brawnly.",
    "url": `${SITE_URL}/#feed-section`,
    "numberOfItems": articles.length,
    "itemListElement": articles.slice(0, 15).map((a: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${SITE_URL}/article/${a.slug}`,
      "name": a.title,
      "item": {
        "@type": "BlogPosting",
        "url": `${SITE_URL}/article/${a.slug}`,
        "headline": a.title,
        "description": a.excerpt || a.description || undefined,
        "image": a.featured_image || a.featured_image_url || undefined,
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
    })),
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
    gifCentral: "w-full max-w-[480px] h-auto object-cover rounded-none mb-4 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.02)] border border-neutral-200 dark:border-neutral-800",
    gifSide: "w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300 mb-2 grayscale hover:grayscale-0",
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
      {/* ── JSON-LD: WebSite + SearchAction ── */}
      <script type="application/ld+json">{_jLdWebSite}</script>

      {/* ── JSON-LD: Organization ── */}
      <script type="application/ld+json">{_jLdOrganization}</script>

      {/* ── JSON-LD: Person (author) ── */}
      <script type="application/ld+json">{_jLdPerson}</script>

      {/* ── JSON-LD: WebPage ── */}
      <script type="application/ld+json">{_jLdWebPage}</script>

      {/* ── JSON-LD: BreadcrumbList ── */}
      <script type="application/ld+json">{_jLdBreadcrumb}</script>

      {/* ── JSON-LD: Cover Story Article ── */}
      <script type="application/ld+json">{_jLdCoverStory}</script>

      {/* ── JSON-LD: Feed ItemList (dynamic, live articles) ── */}
      <script type="application/ld+json">{JSON.stringify(_jLdFeedList)}</script>

      {/* ── Microdata: page-level ── */}
      <meta itemProp="url" content={SITE_URL} />
      <meta itemProp="name" content={`${SITE_NAME} — LGBTQ+ Fitness & Editorial`} />
      <meta itemProp="description" content={PAGE_DESCRIPTION} />
      <meta itemProp="inLanguage" content="id" />

      {/* ── SEO HIDDEN: full site identity + hero + feed for crawlers ── */}
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
        {/* Organization */}
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
            <meta itemProp="name" content={`${SITE_NAME} logo`} />
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

        {/* Person / author */}
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

        {/* WebSite */}
        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {SITE_NAME}
          </a>
          <span itemProp="name">{SITE_NAME}</span>
          <span itemProp="description">{PAGE_DESCRIPTION}</span>
        </span>

        {/* Hero cover story — described for crawlers */}
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
          {/* Hero GIFs as ImageObjects */}
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
            <meta itemProp="name" content={`${SITE_NAME} — Central hero image`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="description" content="Hero editorial visual — Brawnly Cover Story 2026" />
          </span>
        </article>

        {/* Sidebar: Trending Now */}
        <aside aria-label="Trending Now">
          <span itemProp="keywords" content="Trending" />
          <p>How Brawnly is Redefining Wellness in 2026.</p>
          <span itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="name" content={`${SITE_NAME} — Trending sidebar visual`} />
            <meta itemProp="encodingFormat" content="image/gif" />
          </span>
        </aside>

        {/* Sidebar: Must Read */}
        <aside aria-label="Must Read">
          <p>Exclusive: The Art of Fitness and Masculinity.</p>
          <span itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="name" content={`${SITE_NAME} — Must Read sidebar visual`} />
            <meta itemProp="encodingFormat" content="image/gif" />
          </span>
        </aside>

        {/* BreadcrumbList */}
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

        {/* Feed section — hidden article list for crawlers */}
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
                {(a.featured_image || a.featured_image_url) && (
                  <meta itemProp="image" content={a.featured_image || a.featured_image_url} />
                )}
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

      {/* ══════════════════════════════════════════════
          HERO SECTION (all existing logic preserved)
          ══════════════════════════════════════════════ */}
      <section
        className={_s.hero}
        aria-label="Brawnly Cover Story hero"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* Hero article microdata */}
        <meta itemProp="headline" content={HERO_HEADLINE} />
        <meta itemProp="description" content={HERO_SUBLINE} />
        <meta itemProp="articleSection" content="Cover Story" />
        <meta itemProp="url" content={SITE_URL} />
        <span itemScope itemType="https://schema.org/Person" itemProp="author" style={{ display: "none" }}>
          <meta itemProp="name" content={AUTHOR_NAME} />
        </span>

        <div className={_s.inner}>
          <div className={_s.topGrid}>

            {/* ── Left sidebar: Trending Now ── */}
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
              <img
                src={leftGif}
                alt={`${SITE_NAME} — trending visual (animated)`}
                className={_s.gifSide}
                {...pProps}
                itemScope
                itemType="https://schema.org/ImageObject"
              />
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

            {/* ── Main center: Cover Story ── */}
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
                <div
                  className="relative"
                  itemScope
                  itemType="https://schema.org/ImageObject"
                  itemProp="image"
                >
                  <meta itemProp="name" content={`${SITE_NAME} — Cover Story hero image`} />
                  <meta itemProp="description" content="Hero editorial visual — Brawnly Cover Story 2026" />
                  <meta itemProp="encodingFormat" content="image/gif" />
                  <img
                    src={centralGif}
                    alt={`${SITE_NAME} — Cover Story hero image (animated)`}
                    className={_s.gifCentral}
                    {...pProps}
                    itemProp="contentUrl"
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

            {/* ── Right sidebar: Must Read ── */}
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
              <img
                src={rightGif}
                alt={`${SITE_NAME} — must read visual (animated)`}
                className={_s.gifSide}
                {...pProps}
                itemScope
                itemType="https://schema.org/ImageObject"
              />
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

      {/* ══════════════════════════════════════════════
          FEED SECTION (all existing logic preserved)
          ══════════════════════════════════════════════ */}
      <section
        id="feed-section"
        className="py-12"
        aria-label="Latest articles feed"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        {/* Feed section microdata */}
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
            <ArticleList selectedTag={null} searchTerm="" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;