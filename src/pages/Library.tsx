import React, { useState as _s, useEffect as _e, useMemo as _uM } from "react";
import { Link as _L } from "react-router-dom";
import { Bookmark as _Bm, BookOpen as _Bo, ArrowLeft as _Al, Hexagon as _Hx, Music as _Ms, Image as _Im, WifiOff as _Wo, RefreshCw as _Rc, HardDrive as _Hd } from "lucide-react";
import { motion as _m, AnimatePresence as _AP } from "framer-motion";

import { useArticles as _uA } from "@/hooks/useArticles";
import { songsApi as _sa, type Song as _S } from "@/lib/api";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useThemePreference as _uTP } from '@/hooks/useThemePreference';

import { detectBestFormat as _dBF } from "@/lib/imageFormat";
import { wasmTranscodeImage as _wTI } from "@/lib/wasmImagePipeline";
import { setCookieHash as _sCH, mirrorQuery as _mQ, warmupEnterpriseStorage as _wES } from "@/lib/enterpriseStorage";
import { getAssetFromShared as _gAS, saveAssetToShared as _sAS } from "@/lib/sharedStorage";
import { openDB as _oDB } from "@/lib/idbQueue";

/* ============================================================
   CONSTANTS
   ============================================================ */
const SITE_URL = "https://www.brawnly.online";
const SITE_NAME = "Brawnly";
const AUTHOR_NAME = "Budi Putra Jaya";
const PAGE_URL = `${SITE_URL}/library`;
const PAGE_TITLE = `Library — ${SITE_NAME}`;
const PAGE_DESCRIPTION =
  "Your personal Brawnly library — saved articles and sonic vault. Access your bookmarked editorial content and music collection.";

// ─── Article Image License (Budi Putra Jaya) ────────────────────────────────
const ARTICLE_IMAGE_LICENSE     = "https://creativecommons.org/licenses/by/4.0/";
const ARTICLE_IMAGE_COPYRIGHT   = "© 2026 Budi Putra Jaya. All rights reserved.";
const ARTICLE_IMAGE_ACQUIRE_URL = `${SITE_URL}/license`;
const ARTICLE_IMAGE_CREATOR     = AUTHOR_NAME;

// ─── YouTube Thumbnail License ───────────────────────────────────────────────
// Thumbnail YouTube tunduk pada YouTube Terms of Service:
// https://www.youtube.com/t/terms
// Creator konten adalah pemilik channel/video masing-masing.
const YT_THUMBNAIL_LICENSE     = "https://www.youtube.com/t/terms";
const YT_THUMBNAIL_COPYRIGHT   = "© YouTube / respective content creators. All rights reserved.";
const YT_THUMBNAIL_ACQUIRE_URL = "https://www.youtube.com/t/terms";
const YT_THUMBNAIL_CREATOR     = "YouTube / respective content creators";

/* ============================================================
   STATIC JSON-LD — serialised once outside component
   ============================================================ */
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
      "name": `${SITE_NAME} logo`,
      "license": ARTICLE_IMAGE_LICENSE,
      "creator": { "@type": "Person", "name": ARTICLE_IMAGE_CREATOR },
      "copyrightNotice": ARTICLE_IMAGE_COPYRIGHT,
      "acquireLicensePage": ARTICLE_IMAGE_ACQUIRE_URL,
    },
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Library", "item": PAGE_URL },
    ],
  },
});

const _jLdBreadcrumb = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
    { "@type": "ListItem", "position": 2, "name": "Library", "item": PAGE_URL },
  ],
});

/* ============================================================
   HELPERS
   ============================================================ */

/** Kembalikan URL thumbnail YouTube dari videoId, prefer maxresdefault */
function _ytThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

/** Ekstrak YouTube videoId dari berbagai format URL */
function _extractYtId(url: string): string | null {
  const r = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?\s]*).*/;
  const m = url.match(r);
  return m && m[2].length === 11 ? m[2] : null;
}

export default function Library() {
  const { isDark: _iD } = _uTP();
  const { data: _aD, isLoading: _aL, isRefetching: _iR } = _uA();

  const [_sA, _ssA] = _s<any[]>([]);
  const [_sL, _ssL] = _s<_S[]>([]);
  const [_lL, _slL] = _s(true);
  const [_isOff, _sOff] = _s(!navigator.onLine);
  const [_blobMap, _setBlobMap] = _s<Record<string, string>>({});
  const [_syncState, _setSyncState] = _s<"idle" | "optimizing" | "shared">("idle");

  _e(() => {
    _wES();
    _sCH("library_node_" + Date.now());
    _mQ({ type: "LIBRARY_ACCESS", ts: Date.now() });

    const _c = localStorage.getItem("brawnly_lib_cache");
    const _cM = localStorage.getItem("brawnly_music_cache");

    if (_c) {
      _ssA(JSON.parse(_c));
      _slL(false);
    }
    if (_cM) _ssL(JSON.parse(_cM));

    const _hO = () => _sOff(false);
    const _hF = () => _sOff(true);
    window.addEventListener('online', _hO);
    window.addEventListener('offline', _hF);
    return () => {
      window.removeEventListener('online', _hO);
      window.removeEventListener('offline', _hF);
    };
  }, []);

  _e(() => {
    if (_aD) {
      const _sv = _aD.filter((a: any) => localStorage.getItem(`brawnly_saved_${a.slug}`) === "true");
      const _curr = JSON.stringify(_sv);
      if (_curr !== localStorage.getItem("brawnly_lib_cache")) {
        _ssA(_sv);
        localStorage.setItem("brawnly_lib_cache", _curr);
      }
      if (_lL) _slL(false);
    }
  }, [_aD]);

  _e(() => {
    let _active = true;

    const _initSonicLib = async () => {
      try {
        await _oDB();
        const _d = await _sa.getAll();
        if (_active) _ssL(_d);
        localStorage.setItem("brawnly_music_cache", JSON.stringify(_d));

        _setSyncState("optimizing");
        const _format = await _dBF();

        for (const _song of _d) {
          if (!_active) break;

          const _cachedBlob = await _gAS(_song.id.toString());
          if (_cachedBlob) {
            const _url = URL.createObjectURL(_cachedBlob);
            _setBlobMap(p => ({ ...p, [_song.id]: _url }));
          } else if (navigator.onLine) {
            try {
              const res = await fetch(_song.thumbnail_url);
              const b = await res.blob();
              const opt = await _wTI(b, _format, 0.5);
              await _sAS(_song.id.toString(), opt);
              const _url = URL.createObjectURL(opt);
              _setBlobMap(p => ({ ...p, [_url]: _url }));
            } catch (e) { }
          }
        }
        _setSyncState("shared");
      } catch (e) {} finally {
        if (_active) _slL(false);
      }
    };

    _initSonicLib();
    return () => { _active = false; };
  }, []);

  const _rI = (s: string) => {
    localStorage.removeItem(`brawnly_saved_${s}`);
    const _nA = _sA.filter((a) => a.slug !== s);
    _ssA(_nA);
    localStorage.setItem("brawnly_lib_cache", JSON.stringify(_nA));
  };

  const _triggerPlay = (url: string) => {
    const id = _extractYtId(url);
    if (id) {
      window.dispatchEvent(new CustomEvent("BRAWNLY_MUSIC", {
        detail: { type: "PLAY_SONG", id: id }
      }));
    }
  };

  const _playRandom = () => {
    if (_sL.length > 0) {
      const idx = Math.floor(Math.random() * _sL.length);
      _triggerPlay(_sL[idx].url);
    }
  };

  /* ============================================================
     DYNAMIC JSON-LD — Saved Articles ItemList (live state)
     ============================================================ */
  const _jLdSavedArticles = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${SITE_NAME} — Saved Articles`,
    "description": "User's saved/bookmarked articles on Brawnly.",
    "url": `${PAGE_URL}#saved`,
    "numberOfItems": _sA.length,
    "itemListElement": _sA.map((a: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `${SITE_URL}/article/${a.slug}`,
      "name": a.title,
      "item": {
        "@type": "BlogPosting",
        "url": `${SITE_URL}/article/${a.slug}`,
        "headline": a.title,
        "description": a.excerpt || a.description || undefined,
        // FIX: image sebagai ImageObject lengkap, bukan string URL
        ...(a.featured_image
          ? {
              "image": {
                "@type": "ImageObject",
                "url": a.featured_image,
                "contentUrl": a.featured_image,
                "name": `${a.title} — cover`,
                "license": ARTICLE_IMAGE_LICENSE,
                "creator": { "@type": "Person", "name": ARTICLE_IMAGE_CREATOR },
                "copyrightNotice": ARTICLE_IMAGE_COPYRIGHT,
                "acquireLicensePage": ARTICLE_IMAGE_ACQUIRE_URL,
                "creditText": ARTICLE_IMAGE_CREATOR,
              },
            }
          : {}),
        "datePublished": a.published_at || a.created_at || undefined,
        "articleSection": a.category || "Brawnly Selection",
        "author": {
          "@type": "Person",
          "name": a.author?.username || AUTHOR_NAME,
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "url": SITE_URL,
        },
      },
    })),
  };

  /* ============================================================
     DYNAMIC JSON-LD — Sonic Vault MusicPlaylist (live state)
     Thumbnail YouTube menggunakan copyright YouTube/creator masing-masing
     ============================================================ */
  const _jLdSonicVault = {
    "@context": "https://schema.org",
    "@type": "MusicPlaylist",
    "name": `${SITE_NAME} — Sonic Vault`,
    "description": "Brawnly personal sonic vault — curated music collection.",
    "url": `${PAGE_URL}#sonic-vault`,
    "numTracks": _sL.length,
    "track": _sL.map((s: _S, i: number) => {
      const ytId = _extractYtId(s.url);
      const thumbUrl = ytId ? _ytThumb(ytId) : (s.thumbnail_url || undefined);
      return {
        "@type": "MusicRecording",
        "position": i + 1,
        "name": s.title,
        "url": s.url,
        // FIX: thumbnailUrl sebagai ImageObject lengkap dengan copyright YouTube
        ...(thumbUrl
          ? {
              "thumbnailUrl": thumbUrl,
              "image": {
                "@type": "ImageObject",
                "url": thumbUrl,
                "contentUrl": thumbUrl,
                "name": `${s.title} — thumbnail`,
                "license": YT_THUMBNAIL_LICENSE,
                "creator": {
                  "@type": "Organization",
                  "name": YT_THUMBNAIL_CREATOR,
                  "url": "https://www.youtube.com",
                },
                "copyrightNotice": YT_THUMBNAIL_COPYRIGHT,
                "acquireLicensePage": YT_THUMBNAIL_ACQUIRE_URL,
              },
            }
          : {}),
      };
    }),
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
  };

  const _x = {
    r: "min-h-screen bg-white dark:bg-[#0a0a0a] pt-10 pb-24 text-black dark:text-white transition-colors duration-500",
    c: "max-w-[1320px] mx-auto px-5 md:px-10",
    g: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
    cd: "group relative bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-2xl",
    st: "text-2xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3",
    e: "flex flex-col items-center justify-center py-20 text-center"
  };

  /* ── Loading state ── */
  if ((_aL || _lL) && _sA.length === 0 && _sL.length === 0) return (
    <div
      className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]"
      role="status"
      aria-live="polite"
      aria-label="Loading library..."
    >
      <div
        className={`w-12 h-12 border-4 ${_iD ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
    </div>
  );

  return (
    <main
      className={_x.r}
      itemScope
      itemType="https://schema.org/WebPage"
      aria-label="Brawnly Library page"
    >
      {/* ── JSON-LD: WebPage (static) ── */}
      <script type="application/ld+json">{_jLdWebPage}</script>

      {/* ── JSON-LD: BreadcrumbList (static) ── */}
      <script type="application/ld+json">{_jLdBreadcrumb}</script>

      {/* ── JSON-LD: Saved Articles ItemList (dynamic) ── */}
      <script type="application/ld+json">{JSON.stringify(_jLdSavedArticles)}</script>

      {/* ── JSON-LD: Sonic Vault MusicPlaylist (dynamic) ── */}
      <script type="application/ld+json">{JSON.stringify(_jLdSonicVault)}</script>

      {/* ── Microdata: page-level ── */}
      <meta itemProp="url" content={PAGE_URL} />
      <meta itemProp="name" content={PAGE_TITLE} />
      <meta itemProp="description" content={PAGE_DESCRIPTION} />
      <meta itemProp="inLanguage" content="id" />

      {/* ── SEO HIDDEN: full page + collections for crawlers ── */}
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
            {AUTHOR_NAME}
          </a>
        </span>

        {/* Publisher */}
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <span itemProp="name">{SITE_NAME}</span>
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {SITE_NAME}
          </a>
        </span>

        {/* WebSite isPartOf */}
        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {SITE_NAME}
          </a>
          <span itemProp="name">{SITE_NAME}</span>
        </span>

        {/* BreadcrumbList */}
        <span itemScope itemType="https://schema.org/BreadcrumbList">
          <span itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
            <meta itemProp="position" content="1" />
            <a href={SITE_URL} itemProp="item" tabIndex={-1} rel="noopener noreferrer">
              <span itemProp="name">Home</span>
            </a>
          </span>
          <span itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
            <meta itemProp="position" content="2" />
            <a href={PAGE_URL} itemProp="item" tabIndex={-1} rel="noopener noreferrer">
              <span itemProp="name">Library</span>
            </a>
          </span>
        </span>

        {/* Saved articles hidden list */}
        <ol
          itemScope
          itemType="https://schema.org/ItemList"
          aria-label="Hidden saved articles list"
        >
          <meta itemProp="name" content={`${SITE_NAME} — Saved Articles`} />
          <meta itemProp="numberOfItems" content={String(_sA.length)} />
          {_sA.map((a: any, i: number) => (
            <li
              key={`seo-saved-${a.id || a.slug || i}`}
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
              {/* FIX: ImageObject penuh untuk featured_image artikel (Budi Putra Jaya) */}
              {a.featured_image && (
                <span
                  itemScope
                  itemType="https://schema.org/ImageObject"
                  itemProp="image"
                >
                  <meta itemProp="url" content={a.featured_image} />
                  <meta itemProp="contentUrl" content={a.featured_image} />
                  <meta itemProp="name" content={`${a.title} — cover`} />
                  <meta itemProp="license" content={ARTICLE_IMAGE_LICENSE} />
                  <meta itemProp="copyrightNotice" content={ARTICLE_IMAGE_COPYRIGHT} />
                  <meta itemProp="acquireLicensePage" content={ARTICLE_IMAGE_ACQUIRE_URL} />
                  <span
                    itemScope
                    itemType="https://schema.org/Person"
                    itemProp="creator"
                  >
                    <meta itemProp="name" content={ARTICLE_IMAGE_CREATOR} />
                  </span>
                </span>
              )}
              {(a.published_at || a.created_at) && (
                <meta itemProp="datePublished" content={a.published_at || a.created_at} />
              )}
              {a.category && (
                <meta itemProp="articleSection" content={a.category} />
              )}
              <span itemScope itemType="https://schema.org/Person" itemProp="author">
                <span itemProp="name">{a.author?.username || AUTHOR_NAME}</span>
              </span>
            </li>
          ))}
        </ol>

        {/* Sonic vault hidden track list */}
        <ol
          itemScope
          itemType="https://schema.org/MusicPlaylist"
          aria-label="Hidden sonic vault track list"
        >
          <meta itemProp="name" content={`${SITE_NAME} — Sonic Vault`} />
          <meta itemProp="numTracks" content={String(_sL.length)} />
          {_sL.map((s: _S, i: number) => {
            const ytId = _extractYtId(s.url);
            const thumbUrl = ytId ? _ytThumb(ytId) : (s.thumbnail_url || null);
            return (
              <li
                key={`seo-song-${s.id}`}
                itemScope
                itemType="https://schema.org/MusicRecording"
                itemProp="track"
              >
                <meta itemProp="position" content={String(i + 1)} />
                <span itemProp="name">{s.title}</span>
                <a
                  href={s.url}
                  itemProp="url"
                  tabIndex={-1}
                  rel="noopener noreferrer"
                >
                  {s.title}
                </a>
                {/* FIX: YouTube thumbnail — ImageObject dengan copyright YouTube */}
                {thumbUrl && (
                  <span
                    itemScope
                    itemType="https://schema.org/ImageObject"
                    itemProp="image"
                  >
                    <meta itemProp="url" content={thumbUrl} />
                    <meta itemProp="contentUrl" content={thumbUrl} />
                    <meta itemProp="name" content={`${s.title} — thumbnail`} />
                    <meta itemProp="license" content={YT_THUMBNAIL_LICENSE} />
                    <meta itemProp="copyrightNotice" content={YT_THUMBNAIL_COPYRIGHT} />
                    <meta itemProp="acquireLicensePage" content={YT_THUMBNAIL_ACQUIRE_URL} />
                    <span
                      itemScope
                      itemType="https://schema.org/Organization"
                      itemProp="creator"
                    >
                      <meta itemProp="name" content={YT_THUMBNAIL_CREATOR} />
                      <meta itemProp="url" content="https://www.youtube.com" />
                    </span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className={_x.c}>

        {/* ── Page header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <_L
              to="/"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all"
              aria-label="Back to home feed"
            >
              <_Al size={14} aria-hidden="true" /> BACK_TO_FEED
            </_L>

            <h1
              className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none"
              itemProp="name"
            >
              LIBRARY
            </h1>

            {/* Status indicators */}
            <div className="flex items-center gap-4 mt-2 h-6" role="status" aria-live="polite">
              {_isOff ? (
                <span
                  className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse border border-red-500 px-3 py-1 rounded-full"
                  aria-label="Offline mode active"
                >
                  <_Wo size={12} aria-hidden="true" /> OFFLINE MODE
                </span>
              ) : _syncState === "optimizing" ? (
                <span
                  className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest"
                  aria-label="Optimizing assets with WASM"
                >
                  <_Rc size={12} className="animate-spin" aria-hidden="true" /> WASM_OPTIMIZING...
                </span>
              ) : _syncState === "shared" ? (
                <span
                  className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.3em]"
                  aria-label="Shared storage synced"
                >
                  SHARED_STORAGE_SYNCED
                </span>
              ) : null}
            </div>
          </div>

          {/* Node count badge */}
          <div
            className={`flex items-center gap-4 ${_iD ? 'bg-white text-black' : 'bg-black text-white'} px-6 py-4 rounded-xl shadow-xl border border-neutral-800`}
            aria-label={`Total nodes mapped: ${_sA.length + _sL.length}`}
            itemScope
            itemType="https://schema.org/QuantitativeValue"
          >
            <_Bm size={20} fill="currentColor" aria-hidden="true" />
            <span
              className="text-2xl font-black italic"
              itemProp="value"
            >
              {_sA.length + _sL.length}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
              NODES_MAPPED
            </span>
            <meta itemProp="unitText" content="nodes" />
            <meta
              itemProp="description"
              content={`${_sA.length} saved articles + ${_sL.length} songs`}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SONIC VAULT SECTION (existing logic preserved)
            ══════════════════════════════════════════════ */}
        <section
          className="mb-20"
          id="sonic-vault"
          aria-label="Sonic Vault — music collection"
          itemScope
          itemType="https://schema.org/MusicPlaylist"
        >
          {/* Section microdata */}
          <meta itemProp="name" content={`${SITE_NAME} — Sonic Vault`} />
          <meta itemProp="numTracks" content={String(_sL.length)} />
          <meta itemProp="url" content={`${PAGE_URL}#sonic-vault`} />

          <div className="flex items-center justify-between mb-8 border-b-2 border-neutral-100 dark:border-neutral-900 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <_Ms className="text-emerald-500" aria-hidden="true" /> SONIC_VAULT
            </h2>
            <button
              onClick={_playRandom}
              aria-label={`Shuffle ${_sL.length} songs in Sonic Vault`}
              className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border-2 border-black dark:border-white hover:bg-emerald-500 hover:text-black transition-all"
            >
              SHUFFLE_NODES
            </button>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            role="list"
            aria-label="Song grid"
          >
            {_sL.map((s) => {
              const ytId = _extractYtId(s.url);
              // FIX: selalu gunakan YouTube thumbnail URL (bukan blob) untuk src attr &
              // contentUrl — blob hanya untuk tampilan UI, bukan schema.org
              const ytThumbUrl = ytId ? _ytThumb(ytId) : (s.thumbnail_url || "");
              const displaySrc = _blobMap[s.id] || ytThumbUrl;

              return (
                <_m.div
                  whileHover={{ y: -5 }}
                  key={s.id}
                  onClick={() => _triggerPlay(s.url)}
                  role="listitem"
                  aria-label={`Play song: ${s.title}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") _triggerPlay(s.url);
                  }}
                  className="relative aspect-square rounded-xl overflow-hidden group bg-neutral-100 dark:bg-neutral-800 cursor-pointer border border-transparent hover:border-emerald-500"
                  itemScope
                  itemType="https://schema.org/MusicRecording"
                  itemProp="track"
                >
                  {/* Song microdata */}
                  <meta itemProp="name" content={s.title} />
                  <a
                    href={s.url}
                    itemProp="url"
                    tabIndex={-1}
                    rel="noopener noreferrer"
                    style={{ display: "none" }}
                  >
                    {s.title}
                  </a>

                  {/* FIX: ImageObject untuk thumbnail YouTube — url & contentUrl absolut,
                      copyright YouTube Terms of Service */}
                  {ytThumbUrl && (
                    <span
                      itemScope
                      itemType="https://schema.org/ImageObject"
                      itemProp="image"
                      style={{ display: "none" }}
                    >
                      <meta itemProp="url" content={ytThumbUrl} />
                      <meta itemProp="contentUrl" content={ytThumbUrl} />
                      <meta itemProp="name" content={`${s.title} — thumbnail`} />
                      <meta
                        itemProp="description"
                        content={`YouTube thumbnail for: ${s.title}`}
                      />
                      <meta itemProp="license" content={YT_THUMBNAIL_LICENSE} />
                      <meta
                        itemProp="copyrightNotice"
                        content={YT_THUMBNAIL_COPYRIGHT}
                      />
                      <meta
                        itemProp="acquireLicensePage"
                        content={YT_THUMBNAIL_ACQUIRE_URL}
                      />
                      <span
                        itemScope
                        itemType="https://schema.org/Organization"
                        itemProp="creator"
                      >
                        <meta itemProp="name" content={YT_THUMBNAIL_CREATOR} />
                        <meta itemProp="url" content="https://www.youtube.com" />
                      </span>
                    </span>
                  )}

                  <img
                    src={displaySrc}
                    alt={`${s.title} — song thumbnail`}
                    className={`w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 ${
                      !_blobMap[s.id] ? "blur-sm" : "blur-0"
                    }`}
                    loading="lazy"
                    onError={(e) => {
                      // fallback ke thumbnail YouTube standar jika maxresdefault 404
                      if (ytId) {
                        (e.target as HTMLImageElement).src =
                          `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
                      }
                    }}
                  />

                  {_blobMap[s.id] && (
                    <div
                      className="absolute top-2 right-2 bg-emerald-500 text-black p-1 rounded shadow-lg"
                      aria-label="Optimized asset cached"
                      title="Optimized & cached"
                    >
                      <_Hd size={10} aria-hidden="true" />
                    </div>
                  )}

                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-[9px] font-black uppercase text-white tracking-widest truncate">
                      {s.title}
                    </p>
                  </div>
                </_m.div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SAVED ENTRIES SECTION (existing logic preserved)
            ══════════════════════════════════════════════ */}
        <section
          aria-label="Saved Articles — bookmarked entries"
          id="saved"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          {/* Section microdata */}
          <meta itemProp="name" content={`${SITE_NAME} — Saved Articles`} />
          <meta itemProp="numberOfItems" content={String(_sA.length)} />
          <meta itemProp="url" content={`${PAGE_URL}#saved`} />

          <h2 className={_x.st}>
            <_Bo className="text-emerald-500" aria-hidden="true" /> SAVED_ENTRIES
          </h2>

          {_sA.length === 0 ? (
            <div
              className={_x.e}
              aria-label="No saved articles yet"
              role="status"
            >
              <_Hx
                size={120}
                className="mb-8 opacity-10"
                strokeWidth={1}
                aria-hidden="true"
              />
              <h2 className="text-xl font-black uppercase tracking-tighter mb-4">
                VAULT_EMPTY
              </h2>
              <_L
                to="/#feed-section"
                className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-widest"
                aria-label="Go to article feed to bookmark articles"
              >
                MAP_NEW_ENTRIES
              </_L>
            </div>
          ) : (
            <div
              className={_x.g}
              role="list"
              aria-label="Saved articles grid"
            >
              <_AP mode="popLayout">
                {_sA.map((a) => (
                  <_m.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={a.id || a.slug}
                    role="listitem"
                    aria-label={`Saved article: ${a.title}`}
                    className={_x.cd}
                    itemScope
                    itemType="https://schema.org/BlogPosting"
                    itemProp="itemListElement"
                  >
                    {/* Article microdata */}
                    <meta itemProp="headline" content={a.title} />
                    <meta
                      itemProp="url"
                      content={`${SITE_URL}/article/${a.slug}`}
                    />
                    {a.category && (
                      <meta itemProp="articleSection" content={a.category} />
                    )}
                    {(a.published_at || a.created_at) && (
                      <meta
                        itemProp="datePublished"
                        content={a.published_at || a.created_at}
                      />
                    )}
                    <span
                      itemScope
                      itemType="https://schema.org/Person"
                      itemProp="author"
                      style={{ display: "none" }}
                    >
                      <span itemProp="name">{a.author?.username || AUTHOR_NAME}</span>
                    </span>
                    <span
                      itemScope
                      itemType="https://schema.org/Organization"
                      itemProp="publisher"
                      style={{ display: "none" }}
                    >
                      <span itemProp="name">{SITE_NAME}</span>
                    </span>

                    {/* Thumbnail */}
                    <div
                      className="aspect-[16/9] overflow-hidden relative bg-neutral-200 dark:bg-neutral-800"
                      itemScope
                      itemType="https://schema.org/ImageObject"
                      itemProp="image"
                    >
                      {/* FIX: url & contentUrl absolut, plus license/creator/copyright artikel */}
                      {a.featured_image && (
                        <>
                          <meta itemProp="url" content={a.featured_image} />
                          <meta itemProp="contentUrl" content={a.featured_image} />
                          <meta
                            itemProp="name"
                            content={`${a.title} — cover`}
                          />
                          <meta
                            itemProp="description"
                            content={`Cover image for article: ${a.title}`}
                          />
                          <meta
                            itemProp="license"
                            content={ARTICLE_IMAGE_LICENSE}
                          />
                          <meta
                            itemProp="copyrightNotice"
                            content={ARTICLE_IMAGE_COPYRIGHT}
                          />
                          <meta
                            itemProp="acquireLicensePage"
                            content={ARTICLE_IMAGE_ACQUIRE_URL}
                          />
                          <span
                            itemScope
                            itemType="https://schema.org/Person"
                            itemProp="creator"
                            style={{ display: "none" }}
                          >
                            <meta
                              itemProp="name"
                              content={ARTICLE_IMAGE_CREATOR}
                            />
                          </span>
                        </>
                      )}
                      {!a.featured_image && a.title && (
                        <meta itemProp="name" content={`${a.title} — cover`} />
                      )}

                      {a.featured_image ? (
                        <img
                          src={_gOI(a.featured_image, 600)}
                          alt={`${a.title} — cover image`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <_Im
                            size={40}
                            className="text-neutral-300 dark:text-neutral-700"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-6 flex flex-col flex-1">
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3"
                        itemProp="articleSection"
                      >
                        {a.category || "SELECTION"}
                      </span>
                      <h3
                        className="text-xl font-black uppercase leading-tight tracking-tight mb-4 group-hover:text-emerald-500 transition-colors line-clamp-2"
                        itemProp="headline"
                      >
                        {a.title}
                      </h3>

                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
                        <_L
                          to={`/article/${a.slug}`}
                          aria-label={`Read full article: ${a.title}`}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all italic"
                          itemProp="url"
                        >
                          <_Bo size={14} aria-hidden="true" /> READ_FULL
                        </_L>
                        <button
                          onClick={() => _rI(a.slug)}
                          aria-label={`Remove "${a.title}" from saved articles`}
                          className={`p-2.5 rounded-lg border transition-all ${
                            _iD
                              ? "bg-white text-black border-white"
                              : "bg-black text-white border-black"
                          } hover:bg-red-600 hover:border-red-600 hover:text-white`}
                        >
                          <_Bm size={16} fill="currentColor" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </_m.div>
                ))}
              </_AP>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}