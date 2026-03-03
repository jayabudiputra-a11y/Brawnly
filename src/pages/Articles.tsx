import { useState as _s, useEffect as _e } from "react";
import { motion as _m } from "framer-motion";
import TagFilter from "@/components/features/TagFilter";
import ArticleList from "@/components/features/ArticleList";
import { useArticles as _uAs } from "@/hooks/useArticles";
import { loadSnap as _lS, saveSnap as _sS, type SnapArticle as _SA } from "@/lib/storageSnap";
import { registerSW as _rSW } from "@/pwa/swRegister";
import {
  warmupEnterpriseStorage as _wES,
  saveArticlesSnap as _sAS,
  setCookieHash as _sCH,
  mirrorQuery as _mQ
} from "@/lib/enterpriseStorage";
import { syncArticles as _sA } from "@/lib/supabaseSync";
import { detectBestFormat as _dBF } from "@/lib/imageFormat";

/* ============================================================
   CONSTANTS
   ============================================================ */
const SITE_URL = "https://www.brawnly.online";
const PAGE_URL = `${SITE_URL}/articles`;
const SITE_NAME = "Brawnly";
const PAGE_TITLE = "All Articles — Brawnly Editorial";
const PAGE_DESCRIPTION =
  "Explore the latest smart fitness, wellness tracker intelligence, and sonic waves archived for Brawnly users. LGBTQ+ • Muscle Worship • Mindset • Wellness.";
const AUTHOR_NAME = "Budi Putra Jaya";

/* ============================================================
   STATIC JSON-LD — serialised once outside component
   ============================================================ */

// BreadcrumbList
const _jLdBreadcrumb = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": SITE_URL,
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Articles",
      "item": PAGE_URL,
    },
  ],
});

// WebPage
const _jLdWebPage = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": PAGE_URL,
  "url": PAGE_URL,
  "name": PAGE_TITLE,
  "description": PAGE_DESCRIPTION,
  "inLanguage": "id",
  "isPartOf": {
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Articles", "item": PAGE_URL },
    ],
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
  "author": {
    "@type": "Person",
    "name": AUTHOR_NAME,
    "url": SITE_URL,
  },
});

const Articles = () => {
  const [_sT, _ssT] = _s<string | null>(null);
  const [_sTm] = _s<string>("");
  const [_arts, _sArts] = _s<any[]>(() => _lS());

  const { data: _dF } = _uAs();

  _e(() => {
    _rSW();
    _wES();
    _dBF();
  }, []);

  _e(() => {
    if (_dF) {
      _sArts(_dF);

      const _sD: _SA[] = _dF.slice(0, 10).map((a: any) => ({
        title: a.title,
        slug: a.slug,
        image: a.featured_image_url
      }));

      _sS(_sD);
      _sAS(_dF);
      _sA(async () => _dF);

      _dF.forEach((a: any) => {
        if (a.slug) {
          _sCH(a.slug);
          _mQ({ type: "ARTICLE_SNAP", id: a.id, slug: a.slug, ts: Date.now() });
        }
      });
    }
  }, [_dF]);

  /* ============================================================
     DYNAMIC JSON-LD — CollectionPage + ItemList (existing, extended)
     uses live _arts for itemListElement
     ============================================================ */
  const _jLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": PAGE_TITLE,
    "description": PAGE_DESCRIPTION,
    "url": PAGE_URL,
    "@id": PAGE_URL,
    "inLanguage": "id",
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
    "isPartOf": {
      "@type": "WebSite",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "Articles", "item": PAGE_URL },
      ],
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Brawnly Articles",
      "description": PAGE_DESCRIPTION,
      "numberOfItems": _arts.length,
      "itemListElement": _arts.slice(0, 15).map((a: any, i: number) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `${SITE_URL}/article/${a.slug}`,
        "name": a.title,
        "item": {
          "@type": "BlogPosting",
          "url": `${SITE_URL}/article/${a.slug}`,
          "headline": a.title,
          "name": a.title,
          "description": a.excerpt || a.description || undefined,
          "image": a.featured_image_url || a.featured_image || undefined,
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
    },
    // Active tag filter as keywords when selected
    ...(_sT ? { "keywords": _sT } : {}),
  };

  return (
    <main
      className="bg-white dark:bg-black min-h-screen pb-20 text-black dark:text-white transition-colors duration-500"
      itemScope
      itemType="https://schema.org/CollectionPage"
      aria-label="Articles listing page"
    >
      {/* ── JSON-LD: CollectionPage + ItemList (dynamic, with live articles) ── */}
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>

      {/* ── JSON-LD: BreadcrumbList (static) ── */}
      <script type="application/ld+json">{_jLdBreadcrumb}</script>

      {/* ── JSON-LD: WebPage (static) ── */}
      <script type="application/ld+json">{_jLdWebPage}</script>

      {/* ── Microdata: page-level ── */}
      <meta itemProp="url" content={PAGE_URL} />
      <meta itemProp="name" content={PAGE_TITLE} />
      <meta itemProp="description" content={PAGE_DESCRIPTION} />
      <meta itemProp="inLanguage" content="id" />
      {_sT && <meta itemProp="keywords" content={_sT} />}

      {/* ── SEO HIDDEN: full page identity + article list for crawlers ── */}
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
        {/* Page canonical */}
        <a href={PAGE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
          {PAGE_TITLE}
        </a>

        {/* Author */}
        <span itemScope itemType="https://schema.org/Person" itemProp="author">
          <span itemProp="name">{AUTHOR_NAME}</span>
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {AUTHOR_NAME} on {SITE_NAME}
          </a>
        </span>

        {/* Publisher */}
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <span itemProp="name">{SITE_NAME}</span>
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {SITE_NAME}
          </a>
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
            <meta itemProp="url" content={`${SITE_URL}/masculineLogo.svg`} />
          </span>
        </span>

        {/* WebSite isPartOf */}
        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {SITE_NAME}
          </a>
          <span itemProp="name">{SITE_NAME}</span>
        </span>

        {/* Active tag filter */}
        {_sT && (
          <span itemProp="keywords">{_sT}</span>
        )}

        {/* Hidden article list — all snapped articles for crawlers */}
        <ol
          itemScope
          itemType="https://schema.org/ItemList"
          itemProp="mainEntity"
          aria-label="Hidden article list for SEO"
        >
          <meta itemProp="name" content="Brawnly Articles" />
          <meta itemProp="numberOfItems" content={String(_arts.length)} />
          {_arts.map((a: any, i: number) => (
            <li
              key={`seo-art-${a.id || a.slug || i}`}
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
              <meta itemProp="name" content={a.title} />
              {(a.excerpt || a.description) && (
                <meta itemProp="description" content={a.excerpt || a.description} />
              )}
              {(a.featured_image_url || a.featured_image) && (
                <meta itemProp="image" content={a.featured_image_url || a.featured_image} />
              )}
              {(a.published_at || a.created_at) && (
                <meta itemProp="datePublished" content={a.published_at || a.created_at} />
              )}
              {(a.updated_at || a.published_at) && (
                <meta itemProp="dateModified" content={a.updated_at || a.published_at} />
              )}
              {a.category && (
                <meta itemProp="articleSection" content={a.category} />
              )}
              <span
                itemScope
                itemType="https://schema.org/Person"
                itemProp="author"
              >
                <span itemProp="name">
                  {a.author?.username || AUTHOR_NAME}
                </span>
              </span>
              <span
                itemScope
                itemType="https://schema.org/InteractionCounter"
                itemProp="interactionStatistic"
              >
                <meta
                  itemProp="interactionType"
                  content="https://schema.org/ReadAction"
                />
                <meta
                  itemProp="userInteractionCount"
                  content={String(a.views ?? 0)}
                />
              </span>
            </li>
          ))}
        </ol>

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
          <span
            itemScope
            itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
          >
            <meta itemProp="position" content="2" />
            <a href={PAGE_URL} itemProp="item" tabIndex={-1} rel="noopener noreferrer">
              <span itemProp="name">Articles</span>
            </a>
          </span>
          {_sT && (
            <span
              itemScope
              itemType="https://schema.org/ListItem"
              itemProp="itemListElement"
            >
              <meta itemProp="position" content="3" />
              <a
                href={`${PAGE_URL}?tag=${encodeURIComponent(_sT)}`}
                itemProp="item"
                tabIndex={-1}
                rel="noopener noreferrer"
              >
                <span itemProp="name">{_sT}</span>
              </a>
            </span>
          )}
        </span>
      </div>

      {/* ── Visible page content (all existing logic preserved) ── */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-10">
        <header
          className="mb-6 border-b border-gray-100 dark:border-neutral-900 pb-4 text-center md:text-left"
          itemScope
          itemType="https://schema.org/WPHeader"
          aria-label="Articles page header"
        >
          {/* Header microdata */}
          <meta itemProp="url" content={PAGE_URL} />

          <_m.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="mb-2 text-[40px] md:text-[64px] font-black uppercase tracking-tighter bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent cursor-default select-none active:scale-95 transition-transform duration-150"
            itemProp="name"
            aria-label={`${_sT ? `Articles tagged: ${_sT}` : "All Articles"} — ${SITE_NAME}`}
          >
            All Articles
          </_m.h1>

          <div
            className="flex justify-center md:justify-start"
            role="navigation"
            aria-label={`Filter articles by tag${_sT ? ` — active: ${_sT}` : ""}`}
          >
            <TagFilter selected={_sT} onSelect={_ssT} />
          </div>
        </header>

        <div
          className="article-feed-container active:opacity-90 transition-opacity duration-200"
          role="region"
          aria-label={
            _sT
              ? `Articles filtered by tag: ${_sT}`
              : "All Brawnly articles"
          }
          aria-live="polite"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          <meta
            itemProp="name"
            content={
              _sT
                ? `Brawnly Articles — ${_sT}`
                : "Brawnly Articles"
            }
          />
          <meta itemProp="numberOfItems" content={String(_arts.length)} />
          <ArticleList selectedTag={_sT} searchTerm={_sTm} />
        </div>
      </div>

      {/* Bottom gradient bar — decorative */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 opacity-30 pointer-events-none"
        aria-hidden="true"
      />
    </main>
  );
};

export default Articles;