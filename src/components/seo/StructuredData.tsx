import React from "react"
import { Helmet } from "react-helmet-async"
import { resolveAuthorName } from "@/lib/Resolveauthor"
import { buildKeywords, extractPersonNames } from "@/lib/autoIndex"

// ── Types ────────────────────────────────────────────────────────────────────
interface _ASD {
  title: string
  excerpt?: string
  featured_image_url?: string | null
  featured_image?: string | string[] | null
  published_at: string
  updated_at?: string | null
  author?: any
  author_name?: string | null
  url?: string
  tags?: string[] | null
  content?: string | null
  content_en?: string | null
  category?: string | null
  slug?: string | null
}

interface _SDP { article: _ASD }

// ── Site constants ────────────────────────────────────────────────────────────
const _SU  = "https://www.brawnly.online"
const _SN  = "Brawnly"
const _AN  = "Budi Putra Jaya"
const _OL  = "https://creativecommons.org/licenses/by/4.0/"
const _OC  = `© 2026 ${_AN}. All rights reserved.`
const _OAU = `${_SU}/license`

// ── Source / copyright profiles ───────────────────────────────────────────────
const _SP: Record<
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
    license:     _OL,
    copyright:   _OC,
    acquireUrl:  _OAU,
    creatorName: _AN,
    creatorType: "Person",
    creatorUrl:  _SU,
  },
  cloudinary: {
    license:     _OL,
    copyright:   _OC,
    acquireUrl:  _OAU,
    creatorName: _AN,
    creatorType: "Person",
    creatorUrl:  _SU,
  },
}

type _TPr = typeof _SP[keyof typeof _SP]

// ── Detect image source from URL ──────────────────────────────────────────────
function _dIS(url: string): _TPr {
  const u = (url || "").toLowerCase()
  if (u.includes("instagram.com") || u.includes("cdninstagram.com") || u.includes("fbcdn.net"))
    return _SP.instagram
  if (u.includes("tiktok.com") || u.includes("tiktokcdn.com") || u.includes("musical.ly"))
    return _SP.tiktok
  if (u.includes("tumblr.com") || u.includes("tumblr.co"))
    return _SP.tumblr
  if (u.includes("twitter.com") || u.includes("twimg.com") || u.includes("x.com"))
    return _SP.twitter
  if (u.includes("pinterest.com") || u.includes("pinimg.com"))
    return _SP.pinterest
  if (
    u.includes("googleusercontent.com") ||
    u.includes("ggpht.com") ||
    u.includes("gstatic.com")
  )
    return _SP.google
  if (
    u.includes("flickr.com") ||
    u.includes("staticflickr.com") ||
    u.includes("live.staticflickr.com")
  )
    return _SP.flickr
  if (u.includes("youtube.com") || u.includes("ytimg.com") || u.includes("youtu.be"))
    return _SP.youtube
  if (u.includes("supabase.co") || u.includes("supabase.io"))
    return _SP.supabase
  if (
    u.includes("cloudinary.com") ||
    u.includes("res.cloudinary.com") ||
    u.includes("brawnly.online")
  )
    return _SP.cloudinary
  return {
    license:     _OL,
    copyright:   _OC,
    acquireUrl:  _OAU,
    creatorName: _AN,
    creatorType: "Person",
    creatorUrl:  _SU,
  }
}

/**
 * Validate and sanitize a URL.
 * - Must be absolute HTTPS/HTTP
 * - Must have a real hostname (min 4 chars)
 * - Encodes unsafe characters that break JSON-LD validators
 * FIX: "Invalid URL in field url / contentUrl"
 */
function _vU(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  // Reject obvious relative paths
  if (trimmed.startsWith("/") || trimmed.startsWith(".") || !trimmed.includes("://"))
    return null
  try {
    const u = new URL(trimmed)
    if (u.protocol !== "https:" && u.protocol !== "http:") return null
    if (!u.hostname || u.hostname.length < 4) return null
    // Return the href from URL object (normalizes encoding)
    return u.href
  } catch {
    // Try percent-encoding spaces and non-ASCII, then re-validate
    try {
      const encoded = trimmed.replace(/\s+/g, "%20").replace(/[^\x00-\x7F]/g, (c) =>
        encodeURIComponent(c)
      )
      const u2 = new URL(encoded)
      if (u2.protocol !== "https:" && u2.protocol !== "http:") return null
      if (!u2.hostname || u2.hostname.length < 4) return null
      return u2.href
    } catch {
      return null
    }
  }
}

/**
 * Build a fully-compliant schema.org ImageObject with ALL required GSC fields.
 * FIX: "Invalid URL in field url/contentUrl", "Missing creditText", "Missing creator"
 */
function _bIO(
  url: string | null | undefined,
  name: string,
  description?: string,
  representative?: boolean
): object | undefined {
  const validUrl = _vU(url)
  if (!validUrl) return undefined
  const p = _dIS(validUrl)
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
    "url":                validUrl,                  // FIX: always validated absolute URL
    "contentUrl":         validUrl,                  // FIX: always validated absolute URL
    "name":               name || _SN,
    ...(description ? { "description": description } : {}),
    "license":            p.license,
    "creator": {                                     // FIX: always a Person/Organization object
      "@type": p.creatorType,
      "name":  p.creatorName,
      "url":   p.creatorUrl,
    },
    "copyrightNotice":    p.copyright,
    "acquireLicensePage": p.acquireUrl,
    "creditText":         p.creatorName,             // FIX: always present
    ...(representative !== undefined ? { "representativeOfPage": representative } : {}),
    "encodingFormat":     encodingFormat,
  }
}

// ── Publisher logo (own content) ──────────────────────────────────────────────
const _PLG = _bIO(
  `${_SU}/masculineLogo.svg`,
  `${_SN} logo`,
  `Official logo of ${_SN}`
)

// ── Component ─────────────────────────────────────────────────────────────────
const StructuredData: React.FC<_SDP> = ({ article }) => {
  if (!article) return null

  // ── First valid image from featured_image_url (multi-line) ─────────────────
  const _gFI = (): string | undefined => {
    const raw = article.featured_image_url || article.featured_image
    if (!raw) return undefined
    if (Array.isArray(raw)) {
      for (const item of raw) {
        const v = _vU(String(item).trim())
        if (v) return v
      }
      return undefined
    }
    const urls = String(raw)
      .split(/[\n\r,|\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    for (const u of urls) {
      const v = _vU(u)
      if (v) return v
    }
    return undefined
  }

  const _authorName = resolveAuthorName(article, _AN)
  const _aUrl       = _vU(article.url) || `${_SU}/article/${article.slug || ""}`
  const _imgUrl     = _gFI()
  const _cp         = _imgUrl ? _dIS(_imgUrl) : null

  // ── Tags & keyword extraction ────────────────────────────────────────────────
  const _tags: string[] = Array.isArray(article.tags)
    ? (article.tags as string[]).filter(Boolean)
    : []

  const _contentText = (article.content_en || article.content || "")
    .replace(/<[^>]+>/g, " ")
    .slice(0, 2000) // limit for perf

  const _keywords = buildKeywords(
    _tags,
    article.title,
    _contentText,
    [
      article.category || "",
      _authorName,
      "Brawnly article",
      "brawnly.online",
    ].filter(Boolean)
  )

  // ── Person names as keywords (for Google Keyword targeting) ─────────────────
  const _personNames = extractPersonNames(article.title + " " + _contentText)

  // ── datePublished fallback (FIX: always a valid ISO string) ─────────────────
  const _datePublished =
    article.published_at && article.published_at.trim()
      ? article.published_at
      : new Date().toISOString()
  const _dateModified =
    article.updated_at && article.updated_at.trim()
      ? article.updated_at
      : _datePublished

  // ── Article JSON-LD ──────────────────────────────────────────────────────────
  const _sd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":    "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id":   _aUrl,
      "url":   _aUrl,
    },
    "headline":    article.title,
    "name":        article.title,
    "description": article.excerpt || article.title,
    "url":         _aUrl,
    "keywords":    _keywords,                        // FIX: person names + brawnly always included

    // FIX: Always a fully-compliant ImageObject with url, contentUrl, creditText, creator
    ...((_imgUrl && _bIO(_imgUrl, `${article.title} — cover`, article.excerpt, true))
      ? { "image": _bIO(_imgUrl, `${article.title} — cover`, article.excerpt, true) }
      : {}),

    "datePublished": _datePublished,                 // FIX: always present
    "dateModified":  _dateModified,

    // FIX: author always a Person object (not plain string)
    "author": {
      "@type": "Person",
      "name":  _authorName,
      "url":   _SU,
    },

    "publisher": {
      "@type": "Organization",
      "name":  _SN,
      "url":   _SU,
      "logo":  _PLG,
    },

    "isPartOf": {
      "@type": "Blog",
      "name":  _SN,
      "url":   _SU,
    },
  }

  // ── BreadcrumbList JSON-LD ────────────────────────────────────────────────────
  const _bc = {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",     "item": _SU },
      { "@type": "ListItem", "position": 2, "name": "Articles", "item": `${_SU}/articles` },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": _aUrl },
    ],
  }

  return (
    <>
      <Helmet>
        <meta name="keywords" content={_keywords} />
        {_personNames.length > 0 && (
          <meta name="subject" content={_personNames.slice(0, 5).join(", ")} />
        )}
        <script type="application/ld+json">{JSON.stringify(_sd)}</script>
        <script type="application/ld+json">{JSON.stringify(_bc)}</script>
      </Helmet>

      {/* Microdata — sr-only for LLM/Googlebot ─────────────────────────────── */}
      <div className="sr-only" itemScope itemType="https://schema.org/Article">
        <h2 itemProp="headline">{article.title}</h2>
        {article.excerpt && <p itemProp="description">{article.excerpt}</p>}
        {_keywords && <meta itemProp="keywords" content={_keywords} />}

        {/* FIX: author always Person itemScope, never plain text */}
        <span itemProp="author" itemScope itemType="https://schema.org/Person">
          Ditulis oleh{" "}
          <span itemProp="name">{_authorName}</span>
          <meta itemProp="url" content={_SU} />
        </span>

        {/* FIX: datePublished always present */}
        <time itemProp="datePublished" dateTime={_datePublished}>
          {new Date(_datePublished).toLocaleDateString("id-ID", {
            year:  "numeric",
            month: "long",
            day:   "numeric",
          })}
        </time>
        {_dateModified !== _datePublished && (
          <time itemProp="dateModified" dateTime={_dateModified}>
            {new Date(_dateModified).toLocaleDateString("id-ID", {
              year:  "numeric",
              month: "long",
              day:   "numeric",
            })}
          </time>
        )}

        {/* FIX: image ImageObject with ALL required GSC fields */}
        {_imgUrl && _cp ? (
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
            <meta itemProp="url"                  content={_imgUrl} />
            <meta itemProp="contentUrl"           content={_imgUrl} />
            <meta itemProp="name"                 content={`${article.title} — cover image`} />
            {article.excerpt && <meta itemProp="description" content={article.excerpt} />}
            <meta itemProp="representativeOfPage" content="true" />
            <meta itemProp="license"              content={_cp.license} />
            <meta itemProp="copyrightNotice"      content={_cp.copyright} />
            <meta itemProp="acquireLicensePage"   content={_cp.acquireUrl} />
            <meta itemProp="creditText"           content={_cp.creatorName} />
            <span
              itemScope
              itemType={`https://schema.org/${_cp.creatorType}`}
              itemProp="creator"
            >
              <meta itemProp="name" content={_cp.creatorName} />
              <meta itemProp="url"  content={_cp.creatorUrl} />
            </span>
          </span>
        ) : null}

        {/* Publisher */}
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <span itemProp="name">{_SN}</span>
          <a href={_SU} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {_SN}
          </a>
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
            <meta itemProp="url"                content={`${_SU}/masculineLogo.svg`} />
            <meta itemProp="contentUrl"         content={`${_SU}/masculineLogo.svg`} />
            <meta itemProp="name"               content={`${_SN} logo`} />
            <meta itemProp="license"            content={_OL} />
            <meta itemProp="copyrightNotice"    content={_OC} />
            <meta itemProp="acquireLicensePage" content={_OAU} />
            <meta itemProp="creditText"         content={_AN} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={_AN} />
              <meta itemProp="url"  content={_SU} />
            </span>
          </span>
        </span>

        {/* Person names as mentions (for entity recognition) */}
        {_personNames.map((name, i) => (
          <span key={i} itemScope itemType="https://schema.org/Person" itemProp="mentions">
            <meta itemProp="name" content={name} />
          </span>
        ))}

        {/* Tags as about */}
        {_tags.map((tag, i) => (
          <span key={i} itemScope itemType="https://schema.org/Thing" itemProp="about">
            <meta itemProp="name" content={tag} />
          </span>
        ))}
      </div>
    </>
  )
}

export default StructuredData