import { useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import logo from "@/assets/masculineLogo.svg";
import MobileMenu from "./MobileMenu";
import Navigation from "./Navigation";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/common/ThemeToggle";

const SITE_URL         = "https://www.brawnly.online";
const SITE_NAME        = "Brawnly";
const SITE_TAGLINE     = "LGBTQ+ • Muscle Worship • Kings Only";
const SITE_DESCRIPTION =
  "Brawnly — editorial content, articles, and visual media. LGBTQ+, Muscle Worship, Kings Only.";

// ─── Own content copyright (semua asset header adalah milik Budi Putra Jaya) ─
const AUTHOR_NAME     = "Budi Putra Jaya";
const OWN_LICENSE     = "https://creativecommons.org/licenses/by/4.0/";
const OWN_COPYRIGHT   = `© 2026 ${AUTHOR_NAME}. All rights reserved.`;
const OWN_ACQUIRE_URL = `${SITE_URL}/license`;

// ─── Logo ImageObject penuh — dipakai di JSON-LD dan microdata ───────────────
// Logo, favicon, dan semua aset brand Brawnly adalah own content.
const _LOGO_IMAGE_OBJECT = {
  "@type":               "ImageObject",
  "url":                 `${SITE_URL}/masculineLogo.svg`,
  "contentUrl":          `${SITE_URL}/masculineLogo.svg`,
  "name":                `${SITE_NAME} logo`,
  "width":               32,
  "height":              32,
  // FIX: copyright fields — wajib untuk Google Image Metadata rich results
  "license":             OWN_LICENSE,
  "creator": {
    "@type": "Person",
    "name":  AUTHOR_NAME,
    "url":   SITE_URL,
  },
  "copyrightNotice":     OWN_COPYRIGHT,
  "acquireLicensePage":  OWN_ACQUIRE_URL,
  "creditText":          AUTHOR_NAME,
};

// ─── Static JSON-LD strings — serialised once outside component ──────────────
const _jLdOrganization = JSON.stringify({
  "@context": "https://schema.org",
  "@type":    "Organization",
  "name":        SITE_NAME,
  "url":         SITE_URL,
  // FIX: logo sebagai ImageObject penuh dengan copyright own content
  "logo":        _LOGO_IMAGE_OBJECT,
  "description": SITE_DESCRIPTION,
  "slogan":      SITE_TAGLINE,
  "sameAs":      [SITE_URL],
  "founder": {
    "@type": "Person",
    "name":  AUTHOR_NAME,
    "url":   SITE_URL,
  },
});

const _jLdWebSite = JSON.stringify({
  "@context": "https://schema.org",
  "@type":    "WebSite",
  "@id":      `${SITE_URL}/#website`,
  "url":         SITE_URL,
  "name":        SITE_NAME,
  "description": SITE_DESCRIPTION,
  "publisher": {
    "@type": "Organization",
    "name":  SITE_NAME,
    "url":   SITE_URL,
    // FIX: logo publisher dengan copyright own content
    "logo":  _LOGO_IMAGE_OBJECT,
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type":       "EntryPoint",
      "urlTemplate": `${SITE_URL}/articles?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

const _jLdSiteNav = JSON.stringify({
  "@context": "https://schema.org",
  "@type":    "SiteNavigationElement",
  "name":     `${SITE_NAME} Main Navigation`,
  "url":      SITE_URL,
  "hasPart": [
    { "@type": "SiteNavigationElement", "name": "Home",     "url": SITE_URL },
    { "@type": "SiteNavigationElement", "name": "Articles", "url": `${SITE_URL}/articles` },
  ],
});

const _imgPriority = { fetchpriority: "high" } as React.ImgHTMLAttributes<HTMLImageElement>;

const _RainbowBar = memo(() => (
  <div className="absolute inset-x-0 top-0 h-1 flex" aria-hidden="true">
    <div className="flex-1 bg-red-500" />
    <div className="flex-1 bg-orange-500" />
    <div className="flex-1 bg-yellow-400" />
    <div className="flex-1 bg-green-500" />
    <div className="flex-1 bg-blue-500" />
    <div className="flex-1 bg-purple-600" />
  </div>
));
_RainbowBar.displayName = "_RainbowBar";

const _SeoHidden = memo(() => (
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
      <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
        {SITE_NAME}
      </a>
      <span itemProp="name">{SITE_NAME}</span>
      <span itemProp="description">{SITE_DESCRIPTION}</span>
      <span itemProp="slogan">{SITE_TAGLINE}</span>
      {/* FIX: logo ImageObject dengan copyright own content */}
      <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
        <meta itemProp="url"                content={`${SITE_URL}/masculineLogo.svg`} />
        <meta itemProp="contentUrl"         content={`${SITE_URL}/masculineLogo.svg`} />
        <meta itemProp="name"               content={`${SITE_NAME} logo`} />
        <meta itemProp="width"              content="32" />
        <meta itemProp="height"             content="32" />
        {/* FIX: copyright fields wajib GSC */}
        <meta itemProp="license"            content={OWN_LICENSE} />
        <meta itemProp="copyrightNotice"    content={OWN_COPYRIGHT} />
        <meta itemProp="acquireLicensePage" content={OWN_ACQUIRE_URL} />
        <meta itemProp="creditText"         content={AUTHOR_NAME} />
        <span itemScope itemType="https://schema.org/Person" itemProp="creator">
          <meta itemProp="name" content={AUTHOR_NAME} />
          <meta itemProp="url"  content={SITE_URL} />
        </span>
      </span>
      {/* FIX: founder / author */}
      <span itemScope itemType="https://schema.org/Person" itemProp="founder">
        <meta itemProp="name" content={AUTHOR_NAME} />
        <meta itemProp="url"  content={SITE_URL} />
      </span>
    </span>

    <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
      <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
        {SITE_NAME}
      </a>
      <span itemProp="name">{SITE_NAME}</span>
      <span itemProp="description">{SITE_DESCRIPTION}</span>
    </span>

    <nav aria-label="Hidden SEO navigation">
      <a
        href={SITE_URL}
        tabIndex={-1}
        rel="noopener noreferrer"
        itemScope
        itemType="https://schema.org/SiteNavigationElement"
      >
        <span itemProp="name">Home</span>
        <meta itemProp="url" content={SITE_URL} />
      </a>
      <a
        href={`${SITE_URL}/articles`}
        tabIndex={-1}
        rel="noopener noreferrer"
        itemScope
        itemType="https://schema.org/SiteNavigationElement"
      >
        <span itemProp="name">Articles</span>
        <meta itemProp="url" content={`${SITE_URL}/articles`} />
      </a>
    </nav>

    <span itemScope itemType="https://schema.org/BreadcrumbList">
      <span itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
        <meta itemProp="position" content="1" />
        <a href={SITE_URL} itemProp="item" tabIndex={-1} rel="noopener noreferrer">
          <span itemProp="name">{SITE_NAME}</span>
        </a>
      </span>
    </span>
  </div>
));
_SeoHidden.displayName = "_SeoHidden";

export default memo(function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const toggleMenu = useCallback(() => setIsOpen((v) => !v), []);
  const closeMenu  = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <header
        className="relative overflow-hidden transition-colors duration-300 bg-white dark:bg-black border-b border-gray-100 dark:border-neutral-900"
        itemScope
        itemType="https://schema.org/WPHeader"
        role="banner"
        aria-label={`${SITE_NAME} site header`}
        style={{ contain: "style", minHeight: 73 }}
      >
        <script type="application/ld+json">{_jLdOrganization}</script>
        <script type="application/ld+json">{_jLdWebSite}</script>
        <script type="application/ld+json">{_jLdSiteNav}</script>

        <meta itemProp="url"         content={SITE_URL} />
        <meta itemProp="name"        content={SITE_NAME} />
        <meta itemProp="description" content={SITE_DESCRIPTION} />

        <_SeoHidden />
        <_RainbowBar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-3 group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
              aria-label={`${SITE_NAME} — go to homepage`}
              itemScope
              itemType="https://schema.org/Organization"
              itemProp="publisher"
            >
              {/* FIX: logo ImageObject dengan copyright own content */}
              <span
                itemScope
                itemType="https://schema.org/ImageObject"
                itemProp="logo"
                style={{ display: "contents" }}
              >
                <img
                  src={logo}
                  alt={`${SITE_NAME} logo`}
                  width="32"
                  height="32"
                  itemProp="url"
                  className="h-8 w-8 dark:brightness-125 transition-transform group-hover:scale-110"
                  decoding="async"
                  style={{ aspectRatio: "1/1" }}
                  {..._imgPriority}
                />
                <meta itemProp="contentUrl"         content={`${SITE_URL}/masculineLogo.svg`} />
                <meta itemProp="name"               content={`${SITE_NAME} logo`} />
                <meta itemProp="width"              content="32" />
                <meta itemProp="height"             content="32" />
                {/* FIX: copyright fields wajib GSC */}
                <meta itemProp="license"            content={OWN_LICENSE} />
                <meta itemProp="copyrightNotice"    content={OWN_COPYRIGHT} />
                <meta itemProp="acquireLicensePage" content={OWN_ACQUIRE_URL} />
                <meta itemProp="creditText"         content={AUTHOR_NAME} />
                <span
                  itemScope
                  itemType="https://schema.org/Person"
                  itemProp="creator"
                  style={{ display: "none" }}
                >
                  <meta itemProp="name" content={AUTHOR_NAME} />
                  <meta itemProp="url"  content={SITE_URL} />
                </span>
              </span>

              <div style={{ minWidth: 120 }}>
                <h1
                  className="text-2xl md:text-3xl font-black tracking-tighter text-black dark:text-white uppercase leading-none"
                  itemProp="name"
                >
                  {SITE_NAME}
                </h1>
                <p
                  className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 tracking-widest uppercase mt-0.5"
                  itemProp="description"
                >
                  {SITE_TAGLINE}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4 md:gap-8">
              <nav
                className="hidden md:block"
                aria-label="Main navigation"
                itemScope
                itemType="https://schema.org/SiteNavigationElement"
              >
                <meta itemProp="name" content="Main navigation" />
                <meta itemProp="url"  content={SITE_URL} />
                <Navigation />
              </nav>

              <div className="border-l border-gray-200 dark:border-neutral-800 pl-4 flex items-center h-8">
                <ThemeToggle />
              </div>

              <button
                onClick={toggleMenu}
                className="md:hidden text-black dark:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                style={{ touchAction: "manipulation" }}
              >
                <span className="text-2xl" aria-hidden="true">
                  {isOpen ? "✕" : "☰"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isOpen &&
        createPortal(
          <div id="mobile-menu">
            <MobileMenu onClose={closeMenu} />
          </div>,
          document.body
        )}
    </>
  );
});