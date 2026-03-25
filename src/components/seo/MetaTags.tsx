import React, { useEffect as _e } from "react"
import { Helmet as _H } from "react-helmet-async"
import _pG from "@/assets/myPride.gif"
import _mL from "@/assets/masculineLogo.svg"
import _bG from "@/assets/Brawnly.gif"
import _fS from "@/assets/Brawnly-favicon.svg"
import { setCookieHash, mirrorQuery, warmupEnterpriseStorage } from "@/lib/enterpriseStorage"
import { registerSW } from "@/pwa/swRegister"
import { detectBestFormat } from "@/lib/imageFormat"
import { autoIndex, buildKeywords, extractPersonNames } from "@/lib/autoIndex"

/* ============================================================
   COPYRIGHT PROFILES
   Setiap gambar dari platform pihak ketiga tunduk pada ToS
   platform tersebut. Profile ini memenuhi field GSC:
   license, creator, copyrightNotice, acquireLicensePage,
   creditText — wajib untuk Google Image Metadata rich results.
   ============================================================ */
const _SITE_URL        = "https://www.brawnly.online"
const _SITE_NAME       = "Brawnly"
const _AUTHOR_NAME     = "Budi Putra Jaya"
const _OWN_LICENSE     = "https://creativecommons.org/licenses/by/4.0/"
const _OWN_COPYRIGHT   = `© 2026 ${_AUTHOR_NAME}. All rights reserved.`
const _OWN_ACQUIRE_URL = `${_SITE_URL}/license`

const _SOURCE_PROFILES: Record<
  string,
  {
    license: string
    copyright: string
    acquireUrl: string
    creatorName: string
    creatorType: "Person" | "Organization"
    creatorUrl: string
  }
> = {
  instagram: {
    license:     "https://www.instagram.com/legal/terms/",
    copyright:   "© Instagram / Meta Platforms, Inc. All rights reserved.",
    acquireUrl:  "https://www.instagram.com/legal/terms/",
    creatorName: "Instagram / Meta Platforms, Inc.",
    creatorType: "Organization",
    creatorUrl:  "https://www.instagram.com",
  },
  tiktok: {
    license:     "https://www.tiktok.com/legal/page/us/terms-of-service/en",
    copyright:   "© TikTok / ByteDance Ltd. All rights reserved.",
    acquireUrl:  "https://www.tiktok.com/legal/page/us/terms-of-service/en",
    creatorName: "TikTok / ByteDance Ltd.",
    creatorType: "Organization",
    creatorUrl:  "https://www.tiktok.com",
  },
  tumblr: {
    license:     "https://www.tumblr.com/policy/en/terms-of-service",
    copyright:   "© Tumblr / Automattic Inc. / respective content creators. All rights reserved.",
    acquireUrl:  "https://www.tumblr.com/policy/en/terms-of-service",
    creatorName: "Tumblr / respective content creators",
    creatorType: "Organization",
    creatorUrl:  "https://www.tumblr.com",
  },
  twitter: {
    license:     "https://twitter.com/en/tos",
    copyright:   "© X Corp. / respective tweet authors. All rights reserved.",
    acquireUrl:  "https://twitter.com/en/tos",
    creatorName: "X Corp. / respective tweet authors",
    creatorType: "Organization",
    creatorUrl:  "https://twitter.com",
  },
  pinterest: {
    license:     "https://policy.pinterest.com/en/terms-of-service",
    copyright:   "© Pinterest, Inc. / respective pin owners. All rights reserved.",
    acquireUrl:  "https://policy.pinterest.com/en/terms-of-service",
    creatorName: "Pinterest / respective content creators",
    creatorType: "Organization",
    creatorUrl:  "https://www.pinterest.com",
  },
  google: {
    license:     "https://policies.google.com/terms",
    copyright:   "© Google LLC. All rights reserved.",
    acquireUrl:  "https://policies.google.com/terms",
    creatorName: "Google LLC",
    creatorType: "Organization",
    creatorUrl:  "https://www.google.com",
  },
  flickr: {
    license:     "https://www.flickr.com/creativecommons/",
    copyright:   "© Respective photographers on Flickr. License varies per image.",
    acquireUrl:  "https://www.flickr.com/help/terms",
    creatorName: "Respective photographers on Flickr",
    creatorType: "Person",
    creatorUrl:  "https://www.flickr.com",
  },
  youtube: {
    license:     "https://www.youtube.com/t/terms",
    copyright:   "© YouTube / Google LLC / respective content creators. All rights reserved.",
    acquireUrl:  "https://www.youtube.com/t/terms",
    creatorName: "YouTube / respective content creators",
    creatorType: "Organization",
    creatorUrl:  "https://www.youtube.com",
  },
  supabase: {
    license:     _OWN_LICENSE,
    copyright:   _OWN_COPYRIGHT,
    acquireUrl:  _OWN_ACQUIRE_URL,
    creatorName: _AUTHOR_NAME,
    creatorType: "Person",
    creatorUrl:  _SITE_URL,
  },
  cloudinary: {
    license:     _OWN_LICENSE,
    copyright:   _OWN_COPYRIGHT,
    acquireUrl:  _OWN_ACQUIRE_URL,
    creatorName: _AUTHOR_NAME,
    creatorType: "Person",
    creatorUrl:  _SITE_URL,
  },
}

type _SourceProfile = typeof _SOURCE_PROFILES[keyof typeof _SOURCE_PROFILES]

/** Detect copyright source profile from image URL */
function _detectImageSource(url: string): _SourceProfile {
  const u = (url || "").toLowerCase()
  if (u.includes("instagram.com") || u.includes("cdninstagram.com") || u.includes("fbcdn.net"))
    return _SOURCE_PROFILES.instagram
  if (u.includes("tiktok.com") || u.includes("tiktokcdn.com") || u.includes("musical.ly"))
    return _SOURCE_PROFILES.tiktok
  if (u.includes("tumblr.com") || u.includes("tumblr.co"))
    return _SOURCE_PROFILES.tumblr
  if (u.includes("twitter.com") || u.includes("twimg.com") || u.includes("x.com"))
    return _SOURCE_PROFILES.twitter
  if (u.includes("pinterest.com") || u.includes("pinimg.com"))
    return _SOURCE_PROFILES.pinterest
  if (
    u.includes("googleusercontent.com") ||
    u.includes("ggpht.com") ||
    u.includes("gstatic.com")
  )
    return _SOURCE_PROFILES.google
  if (
    u.includes("flickr.com") ||
    u.includes("staticflickr.com") ||
    u.includes("live.staticflickr.com")
  )
    return _SOURCE_PROFILES.flickr
  if (u.includes("youtube.com") || u.includes("ytimg.com") || u.includes("youtu.be"))
    return _SOURCE_PROFILES.youtube
  if (u.includes("supabase.co") || u.includes("supabase.io"))
    return _SOURCE_PROFILES.supabase
  if (
    u.includes("cloudinary.com") ||
    u.includes("res.cloudinary.com") ||
    u.includes("brawnly.online")
  )
    return _SOURCE_PROFILES.cloudinary
  return {
    license:     _OWN_LICENSE,
    copyright:   _OWN_COPYRIGHT,
    acquireUrl:  _OWN_ACQUIRE_URL,
    creatorName: _AUTHOR_NAME,
    creatorType: "Person",
    creatorUrl:  _SITE_URL,
  }
}

/**
 * Validate and sanitize a URL to absolute HTTPS/HTTP.
 * FIX: "Invalid URL in field url / contentUrl" in Google Search Console.
 * - Rejects relative paths, blob:, data: URIs
 * - Normalizes encoding via URL constructor
 */
function _validateUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  // Reject obvious non-absolute URLs
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("javascript:") ||
    !trimmed.includes("://")
  )
    return null
  try {
    const u = new URL(trimmed)
    if (u.protocol !== "https:" && u.protocol !== "http:") return null
    if (!u.hostname || u.hostname.length < 4) return null
    return u.href // normalized by URL constructor
  } catch {
    // Try encoding spaces / special chars then re-validate
    try {
      const enc = trimmed
        .replace(/\s+/g, "%20")
        .replace(/[^\x00-\x7F]/g, (c) => encodeURIComponent(c))
      const u2 = new URL(enc)
      if (u2.protocol !== "https:" && u2.protocol !== "http:") return null
      if (!u2.hostname || u2.hostname.length < 4) return null
      return u2.href
    } catch {
      return null
    }
  }
}

/**
 * Build a fully-compliant schema.org ImageObject.
 * FIX: "Invalid URL in field url/contentUrl", "Missing creditText", "Missing creator"
 * Returns undefined if URL is invalid — prevents bad data in JSON-LD.
 */
function _buildImageObject(
  url: string | null | undefined,
  name: string,
  description?: string,
  representative?: boolean
): object | undefined {
  const validUrl = _validateUrl(url)
  if (!validUrl) return undefined
  const p = _detectImageSource(validUrl)
  const ext = validUrl.toLowerCase()
  const encodingFormat = ext.match(/\.gif/)
    ? "image/gif"
    : ext.match(/\.webp/)
    ? "image/webp"
    : ext.match(/\.png/)
    ? "image/png"
    : ext.match(/\.svg/)
    ? "image/svg+xml"
    : "image/jpeg"

  return {
    "@type":              "ImageObject",
    "url":                validUrl,           // FIX: always validated absolute
    "contentUrl":         validUrl,           // FIX: always validated absolute
    "name":               name || _SITE_NAME,
    ...(description ? { "description": description } : {}),
    "license":            p.license,
    "creator": {                              // FIX: always Person/Organization object
      "@type": p.creatorType,
      "name":  p.creatorName,
      "url":   p.creatorUrl,
    },
    "copyrightNotice":    p.copyright,
    "acquireLicensePage": p.acquireUrl,
    "creditText":         p.creatorName,      // FIX: always present
    ...(representative !== undefined ? { "representativeOfPage": representative } : {}),
    "encodingFormat":     encodingFormat,
  }
}

// ── Own-content asset objects ─────────────────────────────────────────────────
const _LOGO_OBJECT = _buildImageObject(
  `${_SITE_URL}/masculineLogo.svg`,
  `${_SITE_NAME} logo`,
  `Official logo of ${_SITE_NAME}`
)

const _PRIDE_GIF_OBJECT = _buildImageObject(
  `${_SITE_URL}/myPride.gif`,
  `${_SITE_NAME} — Pride GIF`,
  `Brawnly editorial pride visual`
)

const _BRAWNLY_GIF_OBJECT = _buildImageObject(
  `${_SITE_URL}/Brawnly.gif`,
  `${_SITE_NAME} animated logo`,
  `Brawnly animated brand logo`
)

// ── Component ─────────────────────────────────────────────────────────────────
interface MetaTagsProps {
  title:        string
  description?: string
  url?:         string
  image?:       string
  /** Article tags from database for keyword injection */
  tags?:        string[]
  /** Raw article/page content for person name extraction */
  content?:     string
  /** Explicitly disable auto-indexing for this page (e.g. /signin) */
  noIndex?:     boolean
}

const MetaTags = ({
  title:       _t,
  description: _d,
  url:         _u,
  image:       _i,
  tags:        _tags      = [],
  content:     _content   = "",
  noIndex:     _noIndex   = false,
}: MetaTagsProps) => {
  const _bU = _SITE_URL
  const _fT = `${_t} | ${_SITE_NAME}`
  const _fD = _d || "Brawnly 2026: Smart Fitness and Wellness Tracker Intelligence."

  // FIX: Always produce valid absolute URLs for canonical and og:image
  const _fU = _validateUrl(_u) || _bU
  const _fI = _validateUrl(_i) || `${_bU}/Brawnly.gif`

  // ── Copyright profile for og:image ─────────────────────────────────────────
  const _ogCp = _detectImageSource(_fI)

  // ── Keywords: brawnly always first + tags + person names from content ────────
  const _keywords = buildKeywords(
    _tags,
    _t,
    _content,
    [_AUTHOR_NAME, _SITE_NAME, "brawnly.online", "fitness", "wellness"]
  )

  // Extract person names for <meta name="subject"> and JSON-LD "mentions"
  const _personNames = extractPersonNames(`${_t} ${_content}`.slice(0, 3000))

  // ── WebSite JSON-LD ──────────────────────────────────────────────────────────
  const _jLd = {
    "@context":    "https://schema.org",
    "@type":       "WebSite",
    "name":        _SITE_NAME,
    "alternateName": "Brawnly Online",
    "url":         _bU,
    "description": _fD,
    "keywords":    _keywords,

    // FIX: image as fully-compliant ImageObject
    "image": _buildImageObject(
      `${_bU}/myPride.gif`,
      `${_SITE_NAME} — Pride visual`,
      _fD,
      true
    ),

    // FIX: logo as fully-compliant ImageObject
    "logo": _LOGO_OBJECT,

    // FIX: author always Person object (not string)
    "author": {
      "@type": "Person",
      "name":  _AUTHOR_NAME,
      "url":   _bU,
    },

    "publisher": {
      "@type": "Organization",
      "name":  _SITE_NAME,
      "url":   _bU,
      "logo":  _LOGO_OBJECT,
    },

    // Person mentions from page title/content
    ...(
      _personNames.length > 0
        ? {
            "mentions": _personNames.slice(0, 10).map((name) => ({
              "@type": "Person",
              "name":  name,
            })),
          }
        : {}
    ),
  }

  // ── Side effects ──────────────────────────────────────────────────────────────
  _e(() => {
    warmupEnterpriseStorage()
    registerSW()
    detectBestFormat()

    if (_t) {
      setCookieHash(_t)
      mirrorQuery({
        type:  "META_LOAD",
        title: _t,
        url:   _fU,
        ts:    Date.now(),
      })
    }

    // ── Auto-indexing: submit page URL to IndexNow + ping Google/Bing sitemaps
    // Skipped for noIndex pages (signin, signup, admin)
    if (!_noIndex && _fU && _fU !== _bU) {
      // Delay slightly to not block page render
      const timer = setTimeout(() => {
        autoIndex(_fU).catch(() => {})
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [_t, _fU, _noIndex])

  return (
    <>
      <_H>
        <title>{_fT}</title>
        <link rel="icon" type="image/svg+xml" href={_fS} />
        <meta name="description"  content={_fD} />
        <meta name="author"       content={_AUTHOR_NAME} />

        {/* FIX: keywords meta tag — always includes "brawnly" + person names + tags */}
        <meta name="keywords"     content={_keywords} />

        {/* Person names as subject for entity recognition */}
        {_personNames.length > 0 && (
          <meta name="subject" content={_personNames.slice(0, 5).join(", ")} />
        )}

        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content={_fT} />
        <meta property="og:description" content={_fD} />
        <meta property="og:image"       content={_fI} />
        <meta property="og:image:alt"   content={`${_t} — ${_SITE_NAME}`} />
        <meta property="og:url"         content={_fU} />
        <meta property="og:site_name"   content={_SITE_NAME} />

        {/* Twitter Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={_fT} />
        <meta name="twitter:description" content={_fD} />
        <meta name="twitter:image"       content={_fI} />
        <meta name="twitter:image:alt"   content={`${_t} — ${_SITE_NAME}`} />
        <meta name="twitter:site"        content="@brawnly" />

        {/* Canonical */}
        <link rel="canonical" href={_fU} />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(_jLd)}</script>
      </_H>

      {/*
        sr-only: hidden from screen but read by Googlebot & LLMs
        as main content hierarchy for this page.
      */}
      <h1 className="sr-only">
        {_t || `${_SITE_NAME} - Smart Fitness Intelligence`}
      </h1>
      <p className="sr-only">{_fD}</p>
      {_keywords && (
        <p className="sr-only" aria-hidden="true">
          Topics: {_keywords}
        </p>
      )}

      {/* WebSite microdata — with all GSC-required image fields ────────────── */}
      <div className="sr-only" itemScope itemType="https://schema.org/WebSite">
        <meta itemProp="name"        content={_SITE_NAME} />
        <meta itemProp="url"         content={_bU} />
        <meta itemProp="description" content={_fD} />
        {_keywords && <meta itemProp="keywords" content={_keywords} />}

        {/* FIX: image ImageObject with ALL required GSC fields per source */}
        {_validateUrl(_fI) &&
          (() => {
            const _cp = _detectImageSource(_fI)
            return (
              <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
                <meta itemProp="url"                content={_fI} />
                <meta itemProp="contentUrl"         content={_fI} />
                <meta itemProp="name"               content={`${_t} — ${_SITE_NAME}`} />
                <meta itemProp="representativeOfPage" content="true" />
                <meta itemProp="license"            content={_cp.license} />
                <meta itemProp="copyrightNotice"    content={_cp.copyright} />
                <meta itemProp="acquireLicensePage" content={_cp.acquireUrl} />
                <meta itemProp="creditText"         content={_cp.creatorName} />
                <span
                  itemScope
                  itemType={`https://schema.org/${_cp.creatorType}`}
                  itemProp="creator"
                >
                  <meta itemProp="name" content={_cp.creatorName} />
                  <meta itemProp="url"  content={_cp.creatorUrl} />
                </span>
              </span>
            )
          })()}

        {/* FIX: logo ImageObject with own copyright */}
        <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
          <meta itemProp="url"                content={`${_bU}/masculineLogo.svg`} />
          <meta itemProp="contentUrl"         content={`${_bU}/masculineLogo.svg`} />
          <meta itemProp="name"               content={`${_SITE_NAME} logo`} />
          <meta itemProp="license"            content={_OWN_LICENSE} />
          <meta itemProp="copyrightNotice"    content={_OWN_COPYRIGHT} />
          <meta itemProp="acquireLicensePage" content={_OWN_ACQUIRE_URL} />
          <meta itemProp="creditText"         content={_AUTHOR_NAME} />
          <span itemScope itemType="https://schema.org/Person" itemProp="creator">
            <meta itemProp="name" content={_AUTHOR_NAME} />
            <meta itemProp="url"  content={_bU} />
          </span>
        </span>

        {/* FIX: author always Person object */}
        <span itemScope itemType="https://schema.org/Person" itemProp="author">
          <meta itemProp="name" content={_AUTHOR_NAME} />
          <meta itemProp="url"  content={_bU} />
        </span>

        {/* Publisher */}
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <meta itemProp="name" content={_SITE_NAME} />
          <meta itemProp="url"  content={_bU} />
        </span>

        {/* Person mentions — entity recognition for Google */}
        {_personNames.slice(0, 10).map((name, i) => (
          <span key={i} itemScope itemType="https://schema.org/Person" itemProp="mentions">
            <meta itemProp="name" content={name} />
          </span>
        ))}
      </div>
    </>
  )
}

export default MetaTags