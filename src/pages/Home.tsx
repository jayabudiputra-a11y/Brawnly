import React, { useEffect, useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";

import centralGif from "@/assets/Brawnly-17aDfvayqUvay.gif";
import leftGif from "@/assets/Brawnly-17VaIyauwVGvanab8Vf.gif";
import rightGif from "@/assets/Brawnly.gif";
import prideMustache from "@/assets/myPride.gif";

import {
  mirrorQuery,
  setCookieHash,
  warmupEnterpriseStorage,
} from "@/lib/enterpriseStorage";
import { registerSW } from "@/pwa/swRegister";
import { openDB } from "@/lib/idbQueue";
import { moviesApi, type MovieItem } from "@/lib/api";

// ─── Constants ───────────────────────────────────────────────────────────────
const _sU = "https://www.brawnly.online";
const _sN = "Brawnly";
const _aN = "Budi Putra Jaya";
const _pD = "Brawnly — LGBTQ+ Fitness Inspiration, Muscle Worship, Mindset & Wellness. Exclusive editorial content curated for the Brawnly community.";
const _hH = "The Sexiest Men — Photos Handpicked.";
const _hSl = "An exclusive editorial look at the aesthetic standards of 2026, curated specifically for the Brawnly community by this gay man.";
const _iLU = "https://creativecommons.org/licenses/by/4.0/";
const _iCN = "© 2026 Budi Putra Jaya. All rights reserved.";
const _iAL = `${_sU}/license`;
const _iCr = _aN;

// ─── Absolute-URL helper ─────────────────────────────────────────────────────
// Vite imported assets resolve to paths like "/assets/Brawnly-HASH.gif".
// We always prepend the origin so every JSON-LD "url"/"contentUrl" field is a
// fully-qualified absolute URL — required by Google's image-license validator.
const _abs = (p: string): string =>
  p.startsWith("http") ? p : `${_sU}${p.startsWith("/") ? p : `/${p}`}`;

const _cGA = _abs(centralGif as string);
const _lGA = _abs(leftGif as string);
const _rGA = _abs(rightGif as string);

// ─── Shared ImageObject factory ───────────────────────────────────────────────
// Every ImageObject in every JSON-LD block is built through this helper so that
// "url", "contentUrl", "creator", and "license" are always present — fixing all
// four Google Search Console structured-data errors at once.
const _imgObj = (url: string, name: string, description: string, extraFormat?: string) => ({
  "@type": "ImageObject",
  url,
  contentUrl: url,
  name,
  description,
  encodingFormat: extraFormat ?? "image/gif",
  license: _iLU,
  acquireLicensePage: _iAL,
  copyrightNotice: _iCN,
  creditText: _iCr,
  creator: { "@type": "Person", name: _iCr, url: _sU },
});

const _logoObj = () => ({
  ..._imgObj(`${_sU}/masculineLogo.svg`, `${_sN} logo`, `${_sN} official logo`, "image/svg+xml"),
  width: 32,
  height: 32,
});

// ─── URL validator ────────────────────────────────────────────────────────────
// Used both in JSON-LD construction and in microdata to skip empty / malformed
// URLs that would trigger "Invalid URL in field url/contentUrl" in Google.
const _isValidUrl = (u?: string | null): boolean => {
  if (!u) return false;
  try { new URL(u); return true; } catch { return false; }
};

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
const _jLdWebSite = JSON.stringify({
  "@context": "https://schema.org", "@type": "WebSite", "@id": `${_sU}/#website`,
  url: _sU, name: _sN, description: _pD, inLanguage: "id",
  publisher: { "@type": "Organization", name: _sN, url: _sU, logo: _logoObj() },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${_sU}/articles?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
});

const _jLdOrg = JSON.stringify({
  "@context": "https://schema.org", "@type": "Organization", name: _sN, url: _sU,
  logo: _logoObj(),
  description: _pD, foundingDate: "2026",
  foundingLocation: {
    "@type": "Place", name: "Medan, Indonesia",
    address: { "@type": "PostalAddress", addressLocality: "Medan", addressCountry: "ID" },
  },
  sameAs: [_sU],
  knowsAbout: ["LGBTQ+", "Fitness", "Muscle Worship", "Mindset", "Wellness", "Physical Performance"],
});

const _jLdPerson = JSON.stringify({
  "@context": "https://schema.org", "@type": "Person", name: _aN, url: _sU,
  jobTitle: "Editor & Founder", worksFor: { "@type": "Organization", name: _sN, url: _sU },
  address: { "@type": "PostalAddress", addressLocality: "Medan", addressCountry: "ID" },
  knowsAbout: ["LGBTQ+", "Fitness", "Muscle Worship", "Mindset", "Wellness"], sameAs: [_sU],
});

const _jLdWebPage = JSON.stringify({
  "@context": "https://schema.org", "@type": "WebPage", "@id": _sU, url: _sU,
  name: `${_sN} — LGBTQ+ Fitness & Editorial`, description: _pD, inLanguage: "id",
  isPartOf: { "@type": "WebSite", "@id": `${_sU}/#website`, name: _sN, url: _sU },
  about: { "@type": "Organization", name: _sN, url: _sU },
  author: { "@type": "Person", name: _aN, url: _sU },
  publisher: { "@type": "Organization", name: _sN, url: _sU },
  speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2", ".hero-subline"] },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: _sU }],
  },
  primaryImageOfPage: _imgObj(_cGA, `${_sN} — Cover Story hero image`, "Hero editorial visual — Brawnly Cover Story 2026"),
});

const _jLdBreadcrumb = JSON.stringify({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: _sU }],
});

const _jLdCoverStory = JSON.stringify({
  "@context": "https://schema.org", "@type": "Article", headline: _hH, description: _hSl,
  url: _sU, articleSection: "Cover Story",
  image: _imgObj(_cGA, `${_sN} — Cover Story hero image`, "Hero editorial visual — Brawnly Cover Story 2026"),
  author: { "@type": "Person", name: _aN, url: _sU },
  publisher: { "@type": "Organization", name: _sN, url: _sU, logo: _logoObj() },
  datePublished: "2026-01-01",
  isPartOf: { "@type": "WebSite", name: _sN, url: _sU },
  keywords: "LGBTQ+, Fitness, Muscle Worship, Mindset, Wellness, Brawnly",
});

// Individual ImageObject blocks — fully annotated with creator + license
const _jLdImgC = JSON.stringify({ "@context": "https://schema.org", ..._imgObj(_cGA, `${_sN} — Cover Story hero image`, "Hero editorial visual — Brawnly Cover Story 2026") });
const _jLdImgL = JSON.stringify({ "@context": "https://schema.org", ..._imgObj(_lGA, `${_sN} — Trending sidebar visual`, "Trending sidebar animated visual — Brawnly 2026") });
const _jLdImgR = JSON.stringify({ "@context": "https://schema.org", ..._imgObj(_rGA, `${_sN} — Must Read sidebar visual`, "Must Read sidebar animated visual — Brawnly 2026") });

// ─── Ad-pattern filter (obfuscated) ──────────────────────────────────────────
// Blocks: v2006.com, hatcheskoeri.shop, doubleclick, googlesyndication, popads, trafficjunkie, adcash, exosrv
const _0xAD = ["djYyMDA2LmNvbQ==","aGF0Y2hlc2tvZXJpLnNob3A=","ZG91YmxlY2xpY2submV0","cG9wYWRz","dHJhZmZpY2p1bmtpZQ==","YWRjYXNoLmNvbQ==","ZXhvc3JlLmNvbQ=="] as const;
const _isAdUrl = (_u: string): boolean => _0xAD.some(e => { try { return _u.includes(atob(e)); } catch { return false; } });

// ─── OPEN IN NEW TAB (X-Frame-Options: sameorigin workaround) ────────────────
// m4uhd.com.co sets X-Frame-Options: sameorigin → iframe is blocked by all browsers.
// Solution: open in new tab with noopener + noreferrer (blocks ad referrer tracking).
const _openExternal = (_url: string) => {
  if (!_url || _isAdUrl(_url)) return;
  window.open(_url, "_blank", "noopener,noreferrer");
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] bg-neutral-200 dark:bg-neutral-800 rounded-sm mb-1.5" />
    <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-1" />
    <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded w-1/2" />
  </div>
);

// ─── Movie Card ───────────────────────────────────────────────────────────────
const MovieCard = React.memo(({ movie, onWatch }: { movie: MovieItem; onWatch: (m: MovieItem) => void }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  return (
    <article
      className="group relative cursor-pointer select-none"
      onClick={() => onWatch(movie)}
      itemScope itemType="https://schema.org/Movie"
      role="button" tabIndex={0}
      aria-label={`Watch ${movie.title}${movie.release_year ? ` (${movie.release_year})` : ""}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onWatch(movie); }}
    >
      <meta itemProp="name" content={movie.title} />
      {/* Only emit itemProp="url" when the URL is valid — prevents "Invalid URL" GSC errors */}
      {_isValidUrl(movie.m4uhd_url) && <meta itemProp="url" content={movie.m4uhd_url} />}

      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800 rounded-sm border border-neutral-200 dark:border-neutral-800 group-hover:border-black dark:group-hover:border-white transition-colors duration-150">
        {!imgLoaded && !imgErr && (
          <div className="absolute inset-0 animate-pulse bg-neutral-300 dark:bg-neutral-700" />
        )}
        {movie.poster_url && !imgErr ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            loading="lazy"
            decoding="async"
            width={200}
            height={300}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgErr(true)}
            itemProp="image"
          />
        ) : imgErr ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
            <span className="text-3xl opacity-20">🎬</span>
          </div>
        ) : null}

        {/* Quality */}
        <span className="absolute top-1.5 left-1.5 text-[8px] font-black uppercase tracking-wide bg-black/90 text-white px-1 py-0.5 leading-none pointer-events-none">
          {movie.quality || "HD"}
        </span>

        {/* Series badge */}
        {movie.type === "series" && (
          <span className="absolute top-1.5 right-1.5 text-[8px] font-black uppercase bg-red-600 text-white px-1 py-0.5 leading-none pointer-events-none">
            {movie.total_seasons ? `S${movie.total_seasons}` : "TV"}
          </span>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title + genre */}
      <div className="pt-1.5 px-0.5">
        <h3 className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-1 mb-0.5 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors" itemProp="name">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1">
          {movie.genre?.[0] && (
            <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 truncate">
              {movie.genre[0]}
            </span>
          )}
          {movie.release_year && (
            <span className="text-[8px] font-bold text-neutral-400 ml-auto flex-shrink-0">{movie.release_year}</span>
          )}
        </div>
      </div>
    </article>
  );
});
MovieCard.displayName = "MovieCard";

// ─── Movie Detail Panel ───────────────────────────────────────────────────────
// X-Frame-Options: sameorigin means we cannot embed m4uhd in an iframe.
// We show a full detail sheet and open the source in a new tab.
const MovieDetailModal = React.memo(({ movie, onClose }: { movie: MovieItem; onClose: () => void }) => {
  useEffect(() => {
    if (movie.id) void moviesApi.trackView(movie.id);
    document.body.style.overflow = "hidden";
    const _k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", _k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", _k); };
  }, [movie.id, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/75 backdrop-blur-sm p-0 md:p-4"
      role="dialog" aria-modal="true" aria-label={`Details: ${movie.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full md:max-w-2xl bg-white dark:bg-[#111] border-t-4 md:border-4 border-black dark:border-white rounded-none overflow-hidden max-h-[92vh] flex flex-col">

        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-400 hover:text-black dark:hover:text-white transition-colors bg-white dark:bg-[#111]"
          aria-label="Close"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row overflow-y-auto">
          {/* Poster col */}
          <div className="flex-shrink-0 w-full md:w-44 bg-neutral-100 dark:bg-neutral-900">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full md:w-44 aspect-[2/3] object-cover"
                loading="lazy" decoding="async" width={176} height={264}
              />
            ) : (
              <div className="w-full md:w-44 aspect-[2/3] flex items-center justify-center text-5xl opacity-10">🎬</div>
            )}
          </div>

          {/* Info col */}
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="mb-3">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600 block mb-1">
                {movie.type === "series" ? "TV Series" : "Movie"} · {movie.quality || "HD"}
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight leading-tight pr-8">{movie.title}</h2>
              {movie.release_year && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{movie.release_year}</span>
              )}
            </div>

            {/* Genres */}
            {movie.genre?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {movie.genre.map((g) => (
                  <span key={g} className="text-[9px] font-black uppercase tracking-wider border border-black dark:border-white px-1.5 py-0.5">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {movie.description && (
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 mb-4 font-serif">
                {movie.description}
              </p>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5 text-[10px]">
              {movie.director && (
                <div>
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Director</span>
                  <p className="font-medium truncate">{movie.director}</p>
                </div>
              )}
              {movie.creators && (
                <div>
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Creator</span>
                  <p className="font-medium truncate">{movie.creators}</p>
                </div>
              )}
              {movie.starring?.length > 0 && (
                <div className="col-span-2">
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Starring</span>
                  <p className="font-medium line-clamp-2">{movie.starring.slice(0, 4).join(", ")}</p>
                </div>
              )}
              {movie.writers && (
                <div className="col-span-2">
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Writers</span>
                  <p className="font-medium line-clamp-1">{movie.writers}</p>
                </div>
              )}
              {movie.runtime && (
                <div>
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Runtime</span>
                  <p className="font-medium">{movie.runtime}</p>
                </div>
              )}
              {movie.language && (
                <div>
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Language</span>
                  <p className="font-medium">{movie.language}</p>
                </div>
              )}
              {movie.country && (
                <div>
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Country</span>
                  <p className="font-medium">{movie.country}</p>
                </div>
              )}
              {movie.release_date && (
                <div>
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Released</span>
                  <p className="font-medium">{movie.release_date}</p>
                </div>
              )}
              {movie.type === "series" && movie.total_seasons && (
                <div>
                  <span className="font-black uppercase tracking-wider text-neutral-400 block">Seasons</span>
                  <p className="font-medium">{movie.total_seasons}</p>
                </div>
              )}
            </div>

            {/* Note about X-Frame-Options */}
            <p className="text-[9px] text-neutral-400 mb-3 leading-snug">
              Opens in a new tab — ad popups are blocked via <code className="font-mono">noopener,noreferrer</code>.
            </p>

            {/* Watch CTA */}
            <button
              onClick={() => _openExternal(movie.m4uhd_url)}
              className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs py-3 hover:bg-red-600 dark:hover:bg-red-500 dark:hover:text-white transition-colors duration-150"
              aria-label={`Watch ${movie.title} — opens in new tab`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              Watch Now
              <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
MovieDetailModal.displayName = "MovieDetailModal";

// ─── Home ─────────────────────────────────────────────────────────────────────
const Home = () => {
  const [_movies, _setMovies] = useState<MovieItem[]>([]);
  const [_moviesReady, _setMoviesReady] = useState(false);
  const [_activeMovie, _setActiveMovie] = useState<MovieItem | null>(null);
  const [_movieFilter, _setMovieFilter] = useState<"all" | "movie" | "series">("all");
  const [_searchQ, _setSearchQ] = useState("");
  const _moviesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let _m = true;
    const _boot = async () => {
      try {
        warmupEnterpriseStorage();
        await Promise.all([registerSW(), openDB()]);
        setCookieHash("brawnly_session");
        mirrorQuery({ type: "HOME_MOVIES_INIT", ts: Date.now() });
      } catch {}
      try {
        const _data = await moviesApi.getAll();
        if (_m) _setMovies(_data);
      } catch (e) {
        if (import.meta.env.DEV) console.error("[MOVIES_LOAD_FAIL]", e);
      } finally {
        if (_m) _setMoviesReady(true);
      }
    };
    _boot();
    return () => { _m = false; };
  }, []);

  const _handleClose = useCallback(() => _setActiveMovie(null), []);

  const _filteredMovies = _movies.filter((m) => {
    if (_movieFilter !== "all" && m.type !== _movieFilter) return false;
    if (!_searchQ.trim()) return true;
    const _q = _searchQ.toLowerCase();
    return (
      m.title.toLowerCase().includes(_q) ||
      m.genre?.some(g => g.toLowerCase().includes(_q)) ||
      m.starring?.some(s => s.toLowerCase().includes(_q)) ||
      m.director?.toLowerCase().includes(_q) ||
      String(m.release_year).includes(_q)
    );
  });

  // ── _jLdMovies ────────────────────────────────────────────────────────────
  // • Only items with a valid absolute m4uhd_url are included (fixes "Invalid URL" errors).
  // • Each poster ImageObject now carries url, contentUrl, creator, and license
  //   (fixes "Missing field creator/license" non-critical warnings).
  const _jLdMovies = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Matchflik — Brawnly Movies & Series",
    description: "Watch curated movies and series on Brawnly Matchflik.",
    url: `${_sU}/#movies-section`,
    numberOfItems: _movies.length,
    itemListElement: _movies
      .filter(m => _isValidUrl(m.m4uhd_url))
      .slice(0, 20)
      .map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: m.m4uhd_url,
        name: m.title,
        item: {
          "@type": m.type === "series" ? "TVSeries" : "Movie",
          name: m.title,
          url: m.m4uhd_url,
          genre: m.genre,
          datePublished: m.release_date,
          // Fully annotated ImageObject — satisfies all Google image-license fields
          ...(m.poster_url && _isValidUrl(m.poster_url)
            ? {
                image: {
                  "@type": "ImageObject",
                  url: m.poster_url,
                  contentUrl: m.poster_url,
                  name: `${m.title} poster`,
                  description: `Official poster for ${m.title}`,
                  license: _iLU,
                  acquireLicensePage: _iAL,
                  copyrightNotice: _iCN,
                  creditText: _iCr,
                  creator: { "@type": "Person", name: _iCr, url: _sU },
                },
              }
            : {}),
          ...(m.director ? { director: { "@type": "Person", name: m.director } } : {}),
        },
      })),
  };

  const _inner = "max-w-[1280px] mx-auto px-4 md:px-8";

  return (
    <main
      className="min-h-screen bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans transition-colors duration-500"
      itemScope itemType="https://schema.org/WebPage"
      aria-label={`${_sN} — Matchflik`}
    >
      <Helmet>
        <title>Brawnly Matchflik — Watch Movies &amp; Series Free</title>
        <meta name="description" content="Watch curated movies and series free on Brawnly Matchflik. LGBTQ+ editorial picks." />
        <link rel="canonical" href={_sU} />
      </Helmet>

      {/* JSON-LD */}
      <script type="application/ld+json">{_jLdWebSite}</script>
      <script type="application/ld+json">{_jLdOrg}</script>
      <script type="application/ld+json">{_jLdPerson}</script>
      <script type="application/ld+json">{_jLdWebPage}</script>
      <script type="application/ld+json">{_jLdBreadcrumb}</script>
      <script type="application/ld+json">{_jLdCoverStory}</script>
      <script type="application/ld+json">{JSON.stringify(_jLdMovies)}</script>
      <script type="application/ld+json">{_jLdImgC}</script>
      <script type="application/ld+json">{_jLdImgL}</script>
      <script type="application/ld+json">{_jLdImgR}</script>

      <meta itemProp="url" content={_sU} />
      <meta itemProp="name" content={`${_sN} Matchflik — Movies & Series`} />
      <meta itemProp="description" content={_pD} />
      <meta itemProp="inLanguage" content="id" />

      {/* ── Hidden SEO microdata ─────────────────────────────────────────── */}
      <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
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
            <meta itemProp="acquireLicensePage" content={_iAL} />
            <meta itemProp="copyrightNotice" content={_iCN} />
            <meta itemProp="creditText" content={_iCr} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_iCr} />
              <meta itemProp="url" content={_sU} />
            </span>
          </span>
          <span itemScope itemType="https://schema.org/PostalAddress" itemProp="address">
            <span itemProp="addressLocality">Medan</span><span itemProp="addressCountry">ID</span>
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
            <span itemProp="addressLocality">Medan</span><span itemProp="addressCountry">ID</span>
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
            <meta itemProp="acquireLicensePage" content={_iAL} />
            <meta itemProp="copyrightNotice" content={_iCN} />
            <meta itemProp="creditText" content={_iCr} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_iCr} />
              <meta itemProp="url" content={_sU} />
            </span>
          </span>
        </article>
        <aside aria-label="Trending Now">
          <span itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="url" content={_lGA} />
            <meta itemProp="contentUrl" content={_lGA} />
            <meta itemProp="name" content={`${_sN} — Trending sidebar visual`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="license" content={_iLU} />
            <meta itemProp="acquireLicensePage" content={_iAL} />
            <meta itemProp="copyrightNotice" content={_iCN} />
            <meta itemProp="creditText" content={_iCr} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_iCr} />
              <meta itemProp="url" content={_sU} />
            </span>
          </span>
        </aside>
        <aside aria-label="Must Read">
          <span itemScope itemType="https://schema.org/ImageObject">
            <meta itemProp="url" content={_rGA} />
            <meta itemProp="contentUrl" content={_rGA} />
            <meta itemProp="name" content={`${_sN} — Must Read sidebar visual`} />
            <meta itemProp="encodingFormat" content="image/gif" />
            <meta itemProp="license" content={_iLU} />
            <meta itemProp="acquireLicensePage" content={_iAL} />
            <meta itemProp="copyrightNotice" content={_iCN} />
            <meta itemProp="creditText" content={_iCr} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_iCr} />
              <meta itemProp="url" content={_sU} />
            </span>
          </span>
        </aside>
        <span itemScope itemType="https://schema.org/BreadcrumbList">
          <span itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
            <meta itemProp="position" content="1" />
            <a href={_sU} itemProp="item" tabIndex={-1} rel="noopener noreferrer"><span itemProp="name">Home</span></a>
          </span>
        </span>
        <ol itemScope itemType="https://schema.org/ItemList">
          <meta itemProp="name" content="Matchflik — Brawnly Movies" />
          <meta itemProp="numberOfItems" content={String(_movies.length)} />
          {_movies.map((m, i) => (
            <li
              key={`seo-mv-${m.id}`}
              itemScope
              itemType={m.type === "series" ? "https://schema.org/TVSeries" : "https://schema.org/Movie"}
              itemProp="itemListElement"
            >
              <meta itemProp="position" content={String(i + 1)} />
              {/* Guard: only emit anchor when URL is a valid absolute URL */}
              {_isValidUrl(m.m4uhd_url) && (
                <a href={m.m4uhd_url} itemProp="url" tabIndex={-1} rel="noopener noreferrer">{m.title}</a>
              )}
              <meta itemProp="name" content={m.title} />
              {m.poster_url && _isValidUrl(m.poster_url) && <meta itemProp="image" content={m.poster_url} />}
              {m.release_date && <meta itemProp="datePublished" content={m.release_date} />}
            </li>
          ))}
        </ol>
      </div>
      {/* ── End hidden SEO ────────────────────────────────────────────────── */}

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        className="pt-12 pb-6 border-b-4 border-black dark:border-white mb-2"
        aria-label="Brawnly Matchflik hero"
        itemScope itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content={_hH} />
        <meta itemProp="description" content={_hSl} />
        <meta itemProp="articleSection" content="Cover Story" />
        <meta itemProp="url" content={_sU} />
        <span itemScope itemType="https://schema.org/Person" itemProp="author" style={{ display: "none" }}>
          <meta itemProp="name" content={_aN} />
        </span>

        <div className={_inner}>
          <div className="flex flex-col md:flex-row gap-8 items-start mb-12">

            {/* Left sidebar — Trending Now */}
            <aside
              className="hidden lg:block w-1/4 pt-4 border-t border-gray-200 dark:border-neutral-800"
              aria-label="Trending Now"
              itemScope itemType="https://schema.org/WPSideBar"
            >
              <span className="text-[12px] font-black uppercase tracking-wider text-red-600 mb-2 block">Trending Now</span>
              <div itemScope itemType="https://schema.org/ImageObject">
                <meta itemProp="url" content={_lGA} />
                <meta itemProp="contentUrl" content={_lGA} />
                <meta itemProp="name" content={`${_sN} — trending visual`} />
                <meta itemProp="encodingFormat" content="image/gif" />
                <meta itemProp="description" content="Trending sidebar animated visual — Brawnly 2026" />
                <meta itemProp="license" content={_iLU} />
                <meta itemProp="acquireLicensePage" content={_iAL} />
                <meta itemProp="copyrightNotice" content={_iCN} />
                <meta itemProp="creditText" content={_iCr} />
                <span itemScope itemType="https://schema.org/Person" itemProp="creator">
                  <meta itemProp="name" content={_iCr} />
                  <meta itemProp="url" content={_sU} />
                </span>
                {/* fetchpriority lowercase — fixes "React does not recognize fetchPriority prop" warning */}
                <img
                  src={leftGif}
                  alt={`${_sN} — trending visual (animated)`}
                  className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300 mb-2 grayscale hover:grayscale-0 content-visibility-auto"
                  fetchpriority="high"
                />
              </div>
              <img src={prideMustache} alt={`${_sN} pride mustache icon`} className="h-5 w-auto object-contain mt-2 opacity-30" />
              <p className="text-xs font-bold mt-4 leading-snug" itemProp="description">
                How Brawnly is Redefining Wellness in 2026.
              </p>
            </aside>

            {/* Center — Cover Story */}
            <div className="flex-1 border-t-2 border-black dark:border-white pt-4" itemScope itemType="https://schema.org/Article">
              <meta itemProp="articleSection" content="Cover Story" />
              <meta itemProp="headline" content={_hH} />
              <span className="text-[12px] font-black uppercase tracking-wider text-red-600 mb-2 block">Cover Story</span>
              <h1 className="text-[42px] md:text-[84px] leading-[0.9] font-black uppercase tracking-tighter mb-6" itemProp="headline">
                The Sexiest Men <br />
                <span className="text-neutral-300 dark:text-neutral-700">Photos Handpicked.</span>
              </h1>

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="relative" itemScope itemType="https://schema.org/ImageObject" itemProp="image">
                  <meta itemProp="url" content={_cGA} />
                  <meta itemProp="contentUrl" content={_cGA} />
                  <meta itemProp="name" content={`${_sN} — Cover Story hero image`} />
                  <meta itemProp="description" content="Hero editorial visual — Brawnly Cover Story 2026" />
                  <meta itemProp="encodingFormat" content="image/gif" />
                  <meta itemProp="license" content={_iLU} />
                  <meta itemProp="acquireLicensePage" content={_iAL} />
                  <meta itemProp="copyrightNotice" content={_iCN} />
                  <meta itemProp="creditText" content={_iCr} />
                  <span itemScope itemType="https://schema.org/Person" itemProp="creator" style={{ display: "none" }}>
                    <meta itemProp="name" content={_iCr} />
                    <meta itemProp="url" content={_sU} />
                  </span>
                  <img
                    src={centralGif}
                    alt={`${_sN} — Cover Story hero image (animated)`}
                    className="w-full max-w-[480px] h-auto object-cover rounded-none mb-4 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[20px_20px_0px_0px_rgba(255,255,255,0.02)] border border-neutral-200 dark:border-neutral-800 content-visibility-auto"
                    fetchpriority="high"
                  />
                  <img src={prideMustache} alt={`${_sN} pride icon`} className="h-8 w-auto mt-4 mx-auto md:mx-0" aria-hidden="true" />
                </div>

                <div className="flex-1">
                  <p className="text-lg md:text-xl font-medium leading-tight text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl font-serif hero-subline" itemProp="description">
                    An exclusive editorial look at the aesthetic standards of 2026,
                    curated specifically for the Brawnly community by this gay man.
                  </p>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 border-black dark:border-white pb-1 inline-block mb-8" itemProp="author">
                    By Brawnly Owner
                  </span>
                  {/* Matchflik scroll CTA */}
                  <div className="mt-2">
                    <button
                      onClick={() => _moviesRef.current?.scrollIntoView({ behavior: "smooth" })}
                      className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest text-xs px-5 py-2.5 hover:bg-red-600 dark:hover:bg-red-500 dark:hover:text-white transition-colors duration-150"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                      Watch Matchflik
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar — Must Read */}
            <aside
              className="hidden lg:block w-1/4 pt-4 border-t border-gray-200 dark:border-neutral-800"
              aria-label="Must Read"
              itemScope itemType="https://schema.org/WPSideBar"
            >
              <span className="text-[12px] font-black uppercase tracking-wider text-red-600 mb-2 block">Must Read</span>
              <div itemScope itemType="https://schema.org/ImageObject">
                <meta itemProp="url" content={_rGA} />
                <meta itemProp="contentUrl" content={_rGA} />
                <meta itemProp="name" content={`${_sN} — must read visual`} />
                <meta itemProp="encodingFormat" content="image/gif" />
                <meta itemProp="description" content="Must Read sidebar animated visual — Brawnly 2026" />
                <meta itemProp="license" content={_iLU} />
                <meta itemProp="acquireLicensePage" content={_iAL} />
                <meta itemProp="copyrightNotice" content={_iCN} />
                <meta itemProp="creditText" content={_iCr} />
                <span itemScope itemType="https://schema.org/Person" itemProp="creator">
                  <meta itemProp="name" content={_iCr} />
                  <meta itemProp="url" content={_sU} />
                </span>
                <img
                  src={rightGif}
                  alt={`${_sN} — must read visual (animated)`}
                  className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-300 mb-2 grayscale hover:grayscale-0 content-visibility-auto"
                  fetchpriority="high"
                />
              </div>
              <img src={prideMustache} alt={`${_sN} pride mustache icon`} className="h-5 w-auto object-contain mt-2 opacity-30" />
              <p className="text-xs font-bold mt-4 leading-snug" itemProp="description">
                Exclusive: The Art of Fitness and Masculinity.
              </p>
            </aside>

          </div>
        </div>
      </section>

      {/* ── Matchflik Section ─────────────────────────────────────────────── */}
      <section
        id="movies-section"
        ref={_moviesRef}
        className="py-12"
        aria-label="Matchflik — Watch Movies & Series"
        itemScope itemType="https://schema.org/ItemList"
      >
        <meta itemProp="name" content="Matchflik — Brawnly Movies & Series" />
        <meta itemProp="description" content="Watch curated movies and series on Brawnly Matchflik." />

        <div className={_inner}>

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between border-b-8 border-black dark:border-white mb-8 pb-2 gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 block mb-1">Brawnly Presents</span>
              {/* ── Matchflik heading with favicon icon ── */}
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none flex items-center gap-3">
                <img
                  src="/assets/ultra-simple-flat-vector-favicon-icon-for-matchflik.png"
                  alt="Matchflik icon"
                  width={48}
                  height={48}
                  className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
                  aria-hidden="true"
                />
                Matchflik
              </h2>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1.5">
                Watch Movies &amp; Series — Free, Curated for You
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              {/* Search input */}
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search title, genre, actor…"
                  value={_searchQ}
                  onChange={(e) => _setSearchQ(e.target.value)}
                  className="text-[10px] font-bold bg-transparent border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white outline-none px-3 py-1.5 pr-7 w-48 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 transition-colors"
                  aria-label="Search movies"
                />
                {_searchQ && (
                  <button
                    onClick={() => _setSearchQ("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white"
                    aria-label="Clear search"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Type filter tabs */}
              <div className="flex gap-1" role="tablist" aria-label="Filter by type">
                {(["all", "movie", "series"] as const).map((f) => (
                  <button
                    key={f}
                    role="tab"
                    aria-selected={_movieFilter === f}
                    onClick={() => _setMovieFilter(f)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border transition-colors duration-150 ${
                      _movieFilter === f
                        ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                        : "border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                    }`}
                  >
                    {f === "all" ? "All" : f === "movie" ? "Movies" : "Series"}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* Grid */}
          <div role="region" aria-label="Movie grid" aria-live="polite" aria-busy={!_moviesReady}>
            {!_moviesReady ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                {Array.from({ length: 16 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : _filteredMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
                <span className="text-5xl mb-4 opacity-30">🎬</span>
                <p className="text-sm font-black uppercase tracking-widest">
                  {_searchQ ? "No results found" : "No titles available yet"}
                </p>
                {_searchQ && (
                  <button
                    onClick={() => _setSearchQ("")}
                    className="mt-3 text-xs font-bold underline hover:text-black dark:hover:text-white"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
                {_filteredMovies.map((m) => (
                  <MovieCard key={m.id} movie={m} onWatch={_setActiveMovie} />
                ))}
              </div>
            )}
          </div>

          {/* Count */}
          {_moviesReady && _filteredMovies.length > 0 && (
            <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-neutral-400 text-right">
              {_filteredMovies.length} title{_filteredMovies.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </section>

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {_activeMovie && (
        <MovieDetailModal movie={_activeMovie} onClose={_handleClose} />
      )}
    </main>
  );
};

export default Home;