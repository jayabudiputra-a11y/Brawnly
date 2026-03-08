import React, { useEffect, useState, startTransition, useRef } from "react";
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

// ─── Constants ──────────────────────────────────────────────────────────────
const _sU = "https://www.brawnly.online";
const _sN = "Brawnly";
const _aN = "Budi Putra Jaya";
const _pD =
  "Brawnly — LGBTQ+ Fitness Inspiration, Muscle Worship, Mindset & Wellness. Exclusive editorial content curated for the Brawnly community.";
const _hH = "The Sexiest Men — Photos Handpicked.";
const _hSl =
  "An exclusive editorial look at the aesthetic standards of 2026, curated specifically for the Brawnly community by this gay man.";

// ─── Image License (Budi Putra Jaya) ─────────────────────────────────────
const _iLU = "https://creativecommons.org/licenses/by/4.0/";
const _iCN = "© 2026 Budi Putra Jaya. All rights reserved.";
const _iAL = `${_sU}/license`;
const _iCr = _aN;

// ─── Absolute asset URLs ─────────────────────────────────────────────────
const _cGA = `${_sU}${centralGif}`;
const _lGA = `${_sU}${leftGif}`;
const _rGA = `${_sU}${rightGif}`;

// ─── BG GIF (hemat memori: lazy via CSS background-image, bukan <img>) ──
// Menggunakan URL Giphy CDN langsung — tidak memerlukan fetch/blob/download tambahan.
// Dimuat hanya pada desktop (lg breakpoint) via CSS class, bukan JS.
const _BG_GIF =
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MzB4YTAxc213MWVxdTAzb2gwd2phMjd5b3hvYzZvMTdndHZtODkzNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/0jJdXc6Q6O1nkfhjHA/giphy.gif";

// ─── JSON-LD ─────────────────────────────────────────────────────────────

const _jLdWebSite = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${_sU}/#website`,
  url: _sU,
  name: _sN,
  description: _pD,
  inLanguage: "id",
  publisher: {
    "@type": "Organization",
    name: _sN,
    url: _sU,
    logo: {
      "@type": "ImageObject",
      url: `${_sU}/masculineLogo.svg`,
      contentUrl: `${_sU}/masculineLogo.svg`,
      name: `${_sN} logo`,
      license: _iLU,
      creator: { "@type": "Person", name: _iCr },
      copyrightNotice: _iCN,
      acquireLicensePage: _iAL,
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${_sU}/articles?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

const _jLdOrg = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: _sN,
  url: _sU,
  logo: {
    "@type": "ImageObject",
    url: `${_sU}/masculineLogo.svg`,
    contentUrl: `${_sU}/masculineLogo.svg`,
    name: `${_sN} logo`,
    width: 32,
    height: 32,
    license: _iLU,
    creator: { "@type": "Person", name: _iCr },
    copyrightNotice: _iCN,
    acquireLicensePage: _iAL,
  },
  description: _pD,
  foundingDate: "2026",
  foundingLocation: {
    "@type": "Place",
    name: "Medan, Indonesia",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Medan",
      addressCountry: "ID",
    },
  },
  sameAs: [_sU],
  knowsAbout: ["LGBTQ+", "Fitness", "Muscle Worship", "Mindset", "Wellness", "Physical Performance"],
});

const _jLdPerson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: _aN,
  url: _sU,
  jobTitle: "Editor & Founder",
  worksFor: { "@type": "Organization", name: _sN, url: _sU },
  address: { "@type": "PostalAddress", addressLocality: "Medan", addressCountry: "ID" },
  knowsAbout: ["LGBTQ+", "Fitness", "Muscle Worship", "Mindset", "Wellness"],
  sameAs: [_sU],
});

const _jLdWebPage = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": _sU,
  url: _sU,
  name: `${_sN} — LGBTQ+ Fitness & Editorial`,
  description: _pD,
  inLanguage: "id",
  isPartOf: { "@type": "WebSite", "@id": `${_sU}/#website`, name: _sN, url: _sU },
  about: { "@type": "Organization", name: _sN, url: _sU },
  author: { "@type": "Person", name: _aN, url: _sU },
  publisher: { "@type": "Organization", name: _sN, url: _sU },
  speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2", ".hero-subline"] },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: _sU }],
  },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: _cGA,
    contentUrl: _cGA,
    name: `${_sN} — Cover Story hero image`,
    description: "Hero editorial visual — Brawnly Cover Story 2026",
    encodingFormat: "image/gif",
    license: _iLU,
    creator: { "@type": "Person", name: _iCr },
    copyrightNotice: _iCN,
    acquireLicensePage: _iAL,
  },
});

const _jLdBreadcrumb = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: _sU }],
});

const _jLdCoverStory = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: _hH,
  description: _hSl,
  url: _sU,
  articleSection: "Cover Story",
  image: {
    "@type": "ImageObject",
    url: _cGA,
    contentUrl: _cGA,
    name: `${_sN} — Cover Story hero image`,
    description: "Hero editorial visual — Brawnly Cover Story 2026",
    encodingFormat: "image/gif",
    license: _iLU,
    creator: { "@type": "Person", name: _iCr },
    copyrightNotice: _iCN,
    acquireLicensePage: _iAL,
  },
  author: { "@type": "Person", name: _aN, url: _sU },
  publisher: {
    "@type": "Organization",
    name: _sN,
    url: _sU,
    logo: {
      "@type": "ImageObject",
      url: `${_sU}/masculineLogo.svg`,
      contentUrl: `${_sU}/masculineLogo.svg`,
      license: _iLU,
      creator: { "@type": "Person", name: _iCr },
      copyrightNotice: _iCN,
      acquireLicensePage: _iAL,
    },
  },
  datePublished: "2026-01-01",
  isPartOf: { "@type": "WebSite", name: _sN, url: _sU },
  keywords: "LGBTQ+, Fitness, Muscle Worship, Mindset, Wellness, Brawnly",
});

const _jLdImgC = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  url: _cGA,
  contentUrl: _cGA,
  name: `${_sN} — Cover Story hero image`,
  description: "Hero editorial visual — Brawnly Cover Story 2026",
  encodingFormat: "image/gif",
  license: _iLU,
  creator: { "@type": "Person", name: _iCr },
  copyrightNotice: _iCN,
  acquireLicensePage: _iAL,
  creditText: _iCr,
});

const _jLdImgL = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  url: _lGA,
  contentUrl: _lGA,
  name: `${_sN} — Trending sidebar visual`,
  description: "Trending sidebar animated visual — Brawnly 2026",
  encodingFormat: "image/gif",
  license: _iLU,
  creator: { "@type": "Person", name: _iCr },
  copyrightNotice: _iCN,
  acquireLicensePage: _iAL,
  creditText: _iCr,
});

const _jLdImgR = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  url: _rGA,
  contentUrl: _rGA,
  name: `${_sN} — Must Read sidebar visual`,
  description: "Must Read sidebar animated visual — Brawnly 2026",
  encodingFormat: "image/gif",
  license: _iLU,
  creator: { "@type": "Person", name: _iCr },
  copyrightNotice: _iCN,
  acquireLicensePage: _iAL,
  creditText: _iCr,
});

// ─── Main Component ───────────────────────────────────────────────────────

const Home = () => {
  const _loc = useLocation();
  const [_arts, _setArts] = useState<any[]>(() => {
    const _snap = getArticlesSnap();
    return _snap.length > 0 ? _snap : loadSnap();
  });
  const [_syncing, _setSyncing] = useState(false);
  const [_feedReady, _setFeedReady] = useState(false);

  // ── FIX BG GIF: Diload hanya di desktop, lazy via IntersectionObserver ──
  // Tidak pakai <img> agar tidak memblokir LCP. Background-image dimuat
  // secara deferred setelah feed section masuk viewport (IO).
  // Memori: URL string statis, tidak ada blob/fetch tambahan.
  const _feedRef = useRef<HTMLElement>(null);
  const [_bgLoaded, _setBgLoaded] = useState(false);

  useEffect(() => {
    // Hanya load bg gif di desktop (lebar >= 1024px)
    const _mq = window.matchMedia("(min-width: 1024px)");
    if (!_mq.matches) return; // skip mobile sepenuhnya

    const _el = _feedRef.current;
    if (!_el) return;

    // Lazy load via IntersectionObserver — load hanya saat section masuk viewport
    const _io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          _setBgLoaded(true);
          _io.disconnect();
        }
      },
      { rootMargin: "200px" } // preload 200px sebelum masuk viewport
    );

    _io.observe(_el);
    return () => _io.disconnect();
  }, []);

  useEffect(() => {
    const _t = setTimeout(() => {
      startTransition(() => { _setFeedReady(true); });
    }, 1500);
    return () => clearTimeout(_t);
  }, []);

  useEffect(() => {
    if (_loc.hash === "#feed-section" && _feedReady) {
      const _el = document.getElementById("feed-section");
      if (_el) {
        setTimeout(() => { _el.scrollIntoView({ behavior: "smooth" }); }, 100);
      }
    }
  }, [_loc, _feedReady]);

  useEffect(() => {
    let _m = true;

    const _init = async () => {
      try {
        const _snap = getArticlesSnap();
        if (_snap && _snap.length > 0 && _m) { _setArts(_snap); }

        setTimeout(async () => {
          if (!_m) return;
          try {
            await Promise.all([
              registerSW(),
              openDB(),
              warmupEnterpriseStorage(),
              import("@/lib/imageFormat").then(x => x.detectBestFormat()),
            ]);

            setCookieHash("brawnly_session");
            mirrorQuery({ type: "HOME_FEED_INIT", ts: Date.now() });

            if (navigator.onLine) {
              _setSyncing(true);
              const { data, error } = await supabase
                .from("articles")
                .select("*, author:profiles(username, avatar_url)")
                .eq("published", true)
                .order("published_at", { ascending: false })
                .limit(20);

              if (error) throw error;
              const _fd = data || [];

              if (_fd && Array.isArray(_fd) && _m) {
                _setArts(_fd);
                (window as any).__BRAWNLY_SNAP__ = _fd;

                const _sd: SnapArticle[] = _fd.slice(0, 10).map((a: any) => ({
                  title: a.title,
                  slug: a.slug,
                  image: a.featured_image,
                }));
                saveSnap(_sd);
              }
            }

            if ("serviceWorker" in navigator) {
              const _reg = await navigator.serviceWorker.ready;
              if ((_reg as any).sync) {
                try { await (_reg as any).sync.register("sync-articles"); } catch {}
              }
            }
          } catch (e) {
            console.error("[NODE_INIT_DEFERRED_FAIL]", e);
          } finally {
            if (_m) _setSyncing(false);
          }
        }, 3000);
      } catch (err) {
        console.error("[NODE_INIT_FAIL]", err);
      }
    };

    _init();
    return () => { _m = false; };
  }, []);

  // ── Dynamic JSON-LD feed list ─────────────────────────────────────────
  const _jLdFeed = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${_sN} Latest Articles`,
    description: "Latest published articles and editorial content from Brawnly.",
    url: `${_sU}/#feed-section`,
    numberOfItems: _arts.length,
    itemListElement: _arts.slice(0, 15).map((a: any, i: number) => {
      const _img = a.featured_image || a.featured_image_url || undefined;
      return {
        "@type": "ListItem",
        position: i + 1,
        url: `${_sU}/article/${a.slug}`,
        name: a.title,
        item: {
          "@type": "BlogPosting",
          url: `${_sU}/article/${a.slug}`,
          headline: a.title,
          description: a.excerpt || a.description || undefined,
          image: _img
            ? {
                "@type": "ImageObject",
                url: _img,
                contentUrl: _img,
                name: a.title,
                license: _iLU,
                creator: { "@type": "Person", name: _iCr },
                copyrightNotice: _iCN,
                acquireLicensePage: _iAL,
              }
            : undefined,
          datePublished: a.published_at || a.created_at || undefined,
          dateModified: a.updated_at || a.published_at || undefined,
          articleSection: a.category || "Brawnly Selection",
          author: { "@type": "Person", name: a.author?.username || _aN },
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/ReadAction",
            userInteractionCount: a.views ?? 0,
          },
        },
      };
    }),
  };

  // ── Styles ────────────────────────────────────────────────────────────
  const _st = {
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
    mustache: "h-5 w-auto object-contain mt-2 opacity-30",
  };

  const _pp = { fetchpriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>;

  return (
    <main
      className={_st.main}
      itemScope
      itemType="https://schema.org/WebPage"
      aria-label={`${_sN} homepage`}
    >
      <Helmet>
        <link rel="canonical" href={_sU} />
      </Helmet>

      <script type="application/ld+json">{_jLdWebSite}</script>
      <script type="application/ld+json">{_jLdOrg}</script>
      <script type="application/ld+json">{_jLdPerson}</script>
      <script type="application/ld+json">{_jLdWebPage}</script>
      <script type="application/ld+json">{_jLdBreadcrumb}</script>
      <script type="application/ld+json">{_jLdCoverStory}</script>
      <script type="application/ld+json">{JSON.stringify(_jLdFeed)}</script>
      <script type="application/ld+json">{_jLdImgC}</script>
      <script type="application/ld+json">{_jLdImgL}</script>
      <script type="application/ld+json">{_jLdImgR}</script>

      <meta itemProp="url" content={_sU} />
      <meta itemProp="name" content={`${_sN} — LGBTQ+ Fitness & Editorial`} />
      <meta itemProp="description" content={_pD} />
      <meta itemProp="inLanguage" content="id" />

      {/* ── Hidden SEO microdata ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <span itemProp="name">{_sN}</span>
          <a href={_sU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_sN}</a>
          <span itemProp="description">{_pD}</span>
          <span itemProp="foundingDate">2026</span>
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
            <meta itemProp="url" content={`${_sU}/masculineLogo.svg`} />
            <meta itemProp="contentUrl" content={`${_sU}/masculineLogo.svg`} />
            <meta itemProp="name" content={`${_sN} logo`} />
            <meta itemProp="license" content={_iLU} />
            <meta itemProp="copyrightNotice" content={_iCN} />
            <meta itemProp="acquireLicensePage" content={_iAL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_iCr} />
            </span>
          </span>
          <span itemScope itemType="https://schema.org/PostalAddress" itemProp="address">
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
          <span itemProp="name">{_aN}</span>
          <a href={_sU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_aN}</a>
          <meta itemProp="jobTitle" content="Editor & Founder" />
          <span itemScope itemType="https://schema.org/PostalAddress" itemProp="address">
            <span itemProp="addressLocality">Medan</span>
            <span itemProp="addressCountry">ID</span>
          </span>
        </span>

        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a href={_sU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{_sN}</a>
          <span itemProp="name">{_sN}</span>
          <span itemProp="description">{_pD}</span>
        </span>

        <article itemScope itemType="https://schema.org/Article">
          <h1 itemProp="headline">{_hH}</h1>
          <p itemProp="description">{_hSl}</p>
          <meta itemProp="articleSection" content="Cover Story" />
          <meta itemProp="keywords" content="LGBTQ+, Fitness, Muscle Worship, Mindset, Wellness, Brawnly" />
          <span itemScope itemType="https://schema.org/Person" itemProp="author">
            <span itemProp="name">{_aN}</span>
          </span>
          <a href={_sU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">Cover Story — {_sN}</a>
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
            <meta itemProp="url" content={_cGA} />
            <meta itemProp="contentUrl" content={_cGA} />
            <meta itemProp="name" content={`${_sN} — Central hero image`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="description" content="Hero editorial visual — Brawnly Cover Story 2026" />
            <meta itemProp="license" content={_iLU} />
            <meta itemProp="copyrightNotice" content={_iCN} />
            <meta itemProp="acquireLicensePage" content={_iAL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_iCr} />
            </span>
          </span>
        </article>

        <aside aria-label="Trending Now">
          <span itemProp="keywords" content="Trending" />
          <p>How Brawnly is Redefining Wellness in 2026.</p>
          <span itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="url" content={_lGA} />
            <meta itemProp="contentUrl" content={_lGA} />
            <meta itemProp="name" content={`${_sN} — Trending sidebar visual`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="description" content="Trending sidebar animated visual — Brawnly 2026" />
            <meta itemProp="license" content={_iLU} />
            <meta itemProp="copyrightNotice" content={_iCN} />
            <meta itemProp="acquireLicensePage" content={_iAL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_iCr} />
            </span>
          </span>
        </aside>

        <aside aria-label="Must Read">
          <p>Exclusive: The Art of Fitness and Masculinity.</p>
          <span itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="url" content={_rGA} />
            <meta itemProp="contentUrl" content={_rGA} />
            <meta itemProp="name" content={`${_sN} — Must Read sidebar visual`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="description" content="Must Read sidebar animated visual — Brawnly 2026" />
            <meta itemProp="license" content={_iLU} />
            <meta itemProp="copyrightNotice" content={_iCN} />
            <meta itemProp="acquireLicensePage" content={_iAL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_iCr} />
            </span>
          </span>
        </aside>

        <span itemScope itemType="https://schema.org/BreadcrumbList">
          <span itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
            <meta itemProp="position" content="1" />
            <a href={_sU} itemProp="item" tabIndex={-1} rel="noopener noreferrer">
              <span itemProp="name">Home</span>
            </a>
          </span>
        </span>

        <section aria-label="Hidden SEO article feed">
          <h2>Latest Articles</h2>
          <ol itemScope itemType="https://schema.org/ItemList">
            <meta itemProp="name" content={`${_sN} Latest Articles`} />
            <meta itemProp="numberOfItems" content={String(_arts.length)} />
            {_arts.map((a: any, i: number) => (
              <li
                key={`seo-home-${a.id || a.slug || i}`}
                itemScope
                itemType="https://schema.org/BlogPosting"
                itemProp="itemListElement"
              >
                <meta itemProp="position" content={String(i + 1)} />
                <a href={`${_sU}/article/${a.slug}`} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
                  {a.title}
                </a>
                <meta itemProp="headline" content={a.title} />
                {(a.excerpt || a.description) && (
                  <meta itemProp="description" content={a.excerpt || a.description} />
                )}
                {(a.featured_image || a.featured_image_url) && (() => {
                  const _ig = a.featured_image || a.featured_image_url;
                  return (
                    <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
                      <meta itemProp="url" content={_ig} />
                      <meta itemProp="contentUrl" content={_ig} />
                      <meta itemProp="name" content={a.title} />
                      <meta itemProp="license" content={_iLU} />
                      <meta itemProp="copyrightNotice" content={_iCN} />
                      <meta itemProp="acquireLicensePage" content={_iAL} />
                      <span itemScope itemType="https://schema.org/Person" itemProp="creator">
                        <meta itemProp="name" content={_iCr} />
                      </span>
                    </span>
                  );
                })()}
                {(a.published_at || a.created_at) && (
                  <meta itemProp="datePublished" content={a.published_at || a.created_at} />
                )}
                {a.category && <meta itemProp="articleSection" content={a.category} />}
                <span itemScope itemType="https://schema.org/Person" itemProp="author">
                  <span itemProp="name">{a.author?.username || _aN}</span>
                </span>
                <span itemScope itemType="https://schema.org/InteractionCounter" itemProp="interactionStatistic">
                  <meta itemProp="interactionType" content="https://schema.org/ReadAction" />
                  <meta itemProp="userInteractionCount" content={String(a.views ?? 0)} />
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      {/* ── End hidden SEO ──────────────────────────────────────────────── */}

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        className={_st.hero}
        aria-label="Brawnly Cover Story hero"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content={_hH} />
        <meta itemProp="description" content={_hSl} />
        <meta itemProp="articleSection" content="Cover Story" />
        <meta itemProp="url" content={_sU} />
        <span itemScope itemType="https://schema.org/Person" itemProp="author" style={{ display: "none" }}>
          <meta itemProp="name" content={_aN} />
        </span>

        <div className={_st.inner}>
          <div className={_st.topGrid}>

            {/* Left sidebar — Trending Now */}
            <aside
              className={_st.sideArt}
              aria-label="Trending Now"
              itemScope
              itemType="https://schema.org/WPSideBar"
            >
              <span className={_st.category} aria-label="Category: Trending Now">
                Trending Now
              </span>
              <div itemScope itemType="https://schema.org/ImageObject">
                <meta itemProp="url" content={_lGA} />
                <meta itemProp="contentUrl" content={_lGA} />
                <meta itemProp="name" content={`${_sN} — trending visual`} />
                <meta itemProp="encodingFormat" content="image/gif" />
                <meta itemProp="description" content="Trending sidebar animated visual — Brawnly 2026" />
                <meta itemProp="license" content={_iLU} />
                <meta itemProp="copyrightNotice" content={_iCN} />
                <meta itemProp="acquireLicensePage" content={_iAL} />
                <span itemScope itemType="https://schema.org/Person" itemProp="creator">
                  <meta itemProp="name" content={_iCr} />
                </span>
                <img
                  src={leftGif}
                  alt={`${_sN} — trending visual (animated)`}
                  className={_st.gifSide}
                  {..._pp}
                />
              </div>
              <img src={prideMustache} alt={`${_sN} pride mustache icon`} className={_st.mustache} />
              <p className="text-xs font-bold mt-4 leading-snug" itemProp="description">
                How Brawnly is Redefining Wellness in 2026.
              </p>
            </aside>

            {/* Center — Cover Story */}
            <div className={_st.mainCenter} itemScope itemType="https://schema.org/Article">
              <meta itemProp="articleSection" content="Cover Story" />
              <meta itemProp="headline" content={_hH} />

              <span className={_st.category} aria-label="Category: Cover Story">
                Cover Story
              </span>

              <h1 className={_st.headline} itemProp="headline">
                The Sexiest Men <br />
                <span className="text-neutral-300 dark:text-neutral-700">Photos Handpicked.</span>
              </h1>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div
                  className="relative"
                  itemScope
                  itemType="https://schema.org/ImageObject"
                  itemProp="image"
                >
                  <meta itemProp="url" content={_cGA} />
                  <meta itemProp="contentUrl" content={_cGA} />
                  <meta itemProp="name" content={`${_sN} — Cover Story hero image`} />
                  <meta itemProp="description" content="Hero editorial visual — Brawnly Cover Story 2026" />
                  <meta itemProp="encodingFormat" content="image/gif" />
                  <meta itemProp="license" content={_iLU} />
                  <meta itemProp="copyrightNotice" content={_iCN} />
                  <meta itemProp="acquireLicensePage" content={_iAL} />
                  <span itemScope itemType="https://schema.org/Person" itemProp="creator" style={{ display: "none" }}>
                    <meta itemProp="name" content={_iCr} />
                  </span>
                  <img
                    src={centralGif}
                    alt={`${_sN} — Cover Story hero image (animated)`}
                    className={_st.gifCentral}
                    {..._pp}
                  />
                  <img
                    src={prideMustache}
                    alt={`${_sN} pride icon`}
                    className="h-8 w-auto mt-4 mx-auto md:mx-0"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex-1">
                  <p className={`${_st.subline} hero-subline`} itemProp="description">
                    An exclusive editorial look at the aesthetic standards of 2026,
                    curated specifically for the Brawnly community by this gay man.
                  </p>
                  <span className={_st.author} itemProp="author">
                    By Brawnly Owner
                  </span>
                </div>
              </div>
            </div>

            {/* Right sidebar — Must Read */}
            <aside
              className={_st.sideArt}
              aria-label="Must Read"
              itemScope
              itemType="https://schema.org/WPSideBar"
            >
              <span className={_st.category} aria-label="Category: Must Read">
                Must Read
              </span>
              <div itemScope itemType="https://schema.org/ImageObject">
                <meta itemProp="url" content={_rGA} />
                <meta itemProp="contentUrl" content={_rGA} />
                <meta itemProp="name" content={`${_sN} — must read visual`} />
                <meta itemProp="encodingFormat" content="image/gif" />
                <meta itemProp="description" content="Must Read sidebar animated visual — Brawnly 2026" />
                <meta itemProp="license" content={_iLU} />
                <meta itemProp="copyrightNotice" content={_iCN} />
                <meta itemProp="acquireLicensePage" content={_iAL} />
                <span itemScope itemType="https://schema.org/Person" itemProp="creator">
                  <meta itemProp="name" content={_iCr} />
                </span>
                <img
                  src={rightGif}
                  alt={`${_sN} — must read visual (animated)`}
                  className={_st.gifSide}
                  {..._pp}
                />
              </div>
              <img src={prideMustache} alt={`${_sN} pride mustache icon`} className={_st.mustache} />
              <p className="text-xs font-bold mt-4 leading-snug" itemProp="description">
                Exclusive: The Art of Fitness and Masculinity.
              </p>
            </aside>

          </div>
        </div>
      </section>

      {/* ── Feed Section — BG GIF hanya desktop, lazy via IO ─────────────── */}
      {/*
        STRATEGI MEMORI HEMAT:
        - Tidak pakai <img> untuk bg gif → tidak ada decode frame di main thread
        - backgroundImage di-set via inline style hanya setelah IO trigger (_bgLoaded)
        - Di mobile: _bgLoaded selalu false (skip IO), tidak ada request sama sekali
        - backgroundSize: cover + backgroundAttachment: fixed → parallax efek ringan
        - opacity overlay hitam/putih menjaga keterbacaan konten artikel
      */}
      <section
        id="feed-section"
        ref={_feedRef}
        className="py-12 relative"
        aria-label="Latest articles feed"
        itemScope
        itemType="https://schema.org/ItemList"
        style={
          _bgLoaded
            ? {
                backgroundImage: `url("${_BG_GIF}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
              }
            : undefined
        }
      >
        {/* Overlay untuk menjaga keterbacaan artikel di atas bg gif */}
        {_bgLoaded && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 pointer-events-none bg-white/85 dark:bg-black/85 backdrop-blur-[2px]"
          />
        )}

        <meta itemProp="name" content={`${_sN} Latest Articles`} />
        <meta itemProp="description" content="Latest published articles and editorial content from Brawnly." />
        <meta itemProp="numberOfItems" content={String(_arts.length)} />
        <meta itemProp="url" content={`${_sU}/#feed-section`} />

        <div className={`${_st.inner} relative z-10`}>
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
            {_feedReady ? (
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