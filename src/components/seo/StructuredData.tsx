import React from "react"
import { Helmet } from "react-helmet-async"
import masculineLogo from "@/assets/masculineLogo.svg"
import { resolveAuthorName } from "@/components/features/ArticleCard"

interface ArticleStructuredData {
  title: string
  excerpt?: string
  featured_image_url?: string | null
  featured_image?: string | string[] | null
  published_at: string
  // ✅ Widened from `string | null` to `any` — Supabase may return an object
  //    shape like { username: string; name?: string } from a joined query.
  author?: any
  author_name?: string | null
  url?: string
}

interface StructuredDataProps {
  article: ArticleStructuredData
}

/* ============================================================
   COPYRIGHT PROFILES
   Setiap gambar dari platform pihak ketiga tunduk pada ToS platform tersebut.
   Profile ini memenuhi field GSC: license, creator, copyrightNotice,
   acquireLicensePage (wajib untuk Google Image Metadata rich results).
   ============================================================ */
const SITE_URL        = "https://www.brawnly.online"
const SITE_NAME       = "Brawnly"
const AUTHOR_NAME     = "Budi Putra Jaya"
const OWN_LICENSE     = "https://creativecommons.org/licenses/by/4.0/"
const OWN_COPYRIGHT   = `© 2026 ${AUTHOR_NAME}. All rights reserved.`
const OWN_ACQUIRE_URL = `${SITE_URL}/license`

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
  cloudinary: {
    license:     OWN_LICENSE,
    copyright:   OWN_COPYRIGHT,
    acquireUrl:  OWN_ACQUIRE_URL,
    creatorName: AUTHOR_NAME,
    creatorType: "Person",
    creatorUrl:  SITE_URL,
  },
}

type SourceProfile = typeof _SOURCE_PROFILES[keyof typeof _SOURCE_PROFILES]

/** Deteksi sumber gambar dari URL, return profil copyright yang sesuai */
function _detectImageSource(url: string): SourceProfile {
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
  if (u.includes("googleusercontent.com") || u.includes("ggpht.com") || u.includes("gstatic.com"))
    return _SOURCE_PROFILES.google
  if (u.includes("flickr.com") || u.includes("staticflickr.com") || u.includes("live.staticflickr.com"))
    return _SOURCE_PROFILES.flickr
  if (u.includes("youtube.com") || u.includes("ytimg.com") || u.includes("youtu.be"))
    return _SOURCE_PROFILES.youtube
  if (u.includes("cloudinary.com") || u.includes("res.cloudinary.com") || u.includes("brawnly.online"))
    return _SOURCE_PROFILES.cloudinary
  // fallback — own content
  return {
    license:     OWN_LICENSE,
    copyright:   OWN_COPYRIGHT,
    acquireUrl:  OWN_ACQUIRE_URL,
    creatorName: AUTHOR_NAME,
    creatorType: "Person",
    creatorUrl:  SITE_URL,
  }
}

/**
 * FIX: Validasi URL — pastikan URL adalah absolute HTTPS/HTTP yang valid.
 * Mencegah "Invalid URL in field url/contentUrl" di GSC.
 */
function _validateUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.protocol !== "https:" && u.protocol !== "http:") return null
    if (!u.hostname || u.hostname.length < 4) return null
    return url
  } catch {
    return null
  }
}

/**
 * Bangun ImageObject schema.org lengkap (JSON-LD) dengan semua field GSC terpenuhi:
 * url, contentUrl, license, creator, copyrightNotice, acquireLicensePage.
 * Mengembalikan undefined jika url tidak valid.
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
  return {
    "@type":               "ImageObject",
    "url":                 validUrl,
    "contentUrl":          validUrl,
    "name":                name,
    ...(description ? { "description": description } : {}),
    "license":             p.license,
    "creator": {
      "@type": p.creatorType,
      "name":  p.creatorName,
      "url":   p.creatorUrl,
    },
    "copyrightNotice":     p.copyright,
    "acquireLicensePage":  p.acquireUrl,
    "creditText":          p.creatorName,
    ...(representative !== undefined ? { "representativeOfPage": representative } : {}),
    "encodingFormat": validUrl.toLowerCase().match(/\.gif/i)
      ? "image/gif"
      : validUrl.toLowerCase().match(/\.webp/i)
      ? "image/webp"
      : "image/jpeg",
  }
}

// ─── Publisher logo object (own content) ─────────────────────────────────────
const _PUBLISHER_LOGO = {
  "@type":               "ImageObject",
  "url":                 `${SITE_URL}/masculineLogo.svg`,
  "contentUrl":          `${SITE_URL}/masculineLogo.svg`,
  "name":                `${SITE_NAME} logo`,
  "license":             OWN_LICENSE,
  "creator":             { "@type": "Person", "name": AUTHOR_NAME, "url": SITE_URL },
  "copyrightNotice":     OWN_COPYRIGHT,
  "acquireLicensePage":  OWN_ACQUIRE_URL,
}

// ─────────────────────────────────────────────────────────────────────────────

const StructuredData: React.FC<StructuredDataProps> = ({ article }) => {
  if (!article) return null

  const baseUrl = SITE_URL

  const getFirstImage = (): string | undefined => {
    const rawImageSource = article.featured_image_url || article.featured_image
    if (!rawImageSource) return undefined

    if (Array.isArray(rawImageSource)) {
      // FIX: Validasi tiap item array, ambil yang pertama valid
      for (const item of rawImageSource) {
        const v = _validateUrl(String(item).trim())
        if (v) return v
      }
      return undefined
    }

    const urls = String(rawImageSource)
      .split(/[\n\r|,|\s+]+/)
      .map(s => s.trim())
      .filter(Boolean)

    // FIX: Validasi URL — ambil yang pertama lolos validasi
    for (const u of urls) {
      const v = _validateUrl(u)
      if (v) return v
    }
    return undefined
  }

  // ✅ Use the shared helper — handles string | object | null without crashing
  const authorName = resolveAuthorName(article, AUTHOR_NAME)

  const articleUrl = _validateUrl(article.url) || baseUrl
  const imageUrl   = getFirstImage()

  // ─── Copyright profile untuk gambar ini ────────────────────────────────
  const cp = imageUrl ? _detectImageSource(imageUrl) : null

  // ─── JSON-LD: Article — image field penuh dengan copyright per sumber ──
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id":   articleUrl,
      "url":   articleUrl,
    },
    "headline":    article.title,
    "name":        article.title,
    "description": article.excerpt,
    // FIX: image sebagai ImageObject penuh dengan copyright + URL validation
    "image": _buildImageObject(
      imageUrl,
      `${article.title} — cover image`,
      article.excerpt
        ? `${article.excerpt}`
        : `Featured image for article: ${article.title}`,
      true
    ),
    "datePublished": article.published_at,
    "dateModified":  article.published_at,
    "author": {
      "@type": "Person",
      "name":  authorName,
      "url":   baseUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name":  SITE_NAME,
      "url":   SITE_URL,
      // FIX: publisher logo dengan full own copyright
      "logo":  _PUBLISHER_LOGO,
    },
    "isPartOf": {
      "@type": "Blog",
      "name":  SITE_NAME,
      "url":   SITE_URL,
    },
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Trik SEO & LLM SPA:
        Microdata HTML mentah yang disembunyikan secara visual.
        Bot AI dan Crawler sederhana yang mengabaikan <script> JSON-LD
        PASTI akan membaca data ini karena menyatu dengan struktur DOM HTML.
      */}
      <div className="sr-only" itemScope itemType="https://schema.org/Article">
        <h2 itemProp="headline">{article.title}</h2>
        {article.excerpt && <p itemProp="description">{article.excerpt}</p>}

        <span itemProp="author" itemScope itemType="https://schema.org/Person">
          Ditulis oleh <span itemProp="name">{authorName}</span>
        </span>

        <time itemProp="datePublished" dateTime={article.published_at}>
          {new Date(article.published_at).toLocaleDateString('id-ID', {
            year:  'numeric',
            month: 'long',
            day:   'numeric'
          })}
        </time>

        {/* FIX: ImageObject microdata dengan copyright per sumber — hanya jika URL valid */}
        {imageUrl && cp ? (
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="image">
            <meta itemProp="url"                content={imageUrl} />
            <meta itemProp="contentUrl"         content={imageUrl} />
            <meta itemProp="name"               content={`${article.title} — cover image`} />
            {article.excerpt && (
              <meta itemProp="description"      content={article.excerpt} />
            )}
            <meta itemProp="representativeOfPage" content="true" />
            {/* FIX: copyright fields wajib GSC */}
            <meta itemProp="license"            content={cp.license} />
            <meta itemProp="copyrightNotice"    content={cp.copyright} />
            <meta itemProp="acquireLicensePage" content={cp.acquireUrl} />
            <meta itemProp="creditText"         content={cp.creatorName} />
            <span
              itemScope
              itemType={`https://schema.org/${cp.creatorType}`}
              itemProp="creator"
            >
              <meta itemProp="name" content={cp.creatorName} />
              <meta itemProp="url"  content={cp.creatorUrl} />
            </span>
          </span>
        ) : null}

        {/* FIX: publisher microdata dengan logo own copyright */}
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <span itemProp="name">{SITE_NAME}</span>
          <a href={SITE_URL} itemProp="url" tabIndex={-1} rel="noopener noreferrer">
            {SITE_NAME}
          </a>
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
            <meta itemProp="url"                content={`${SITE_URL}/masculineLogo.svg`} />
            <meta itemProp="contentUrl"         content={`${SITE_URL}/masculineLogo.svg`} />
            <meta itemProp="name"               content={`${SITE_NAME} logo`} />
            <meta itemProp="license"            content={OWN_LICENSE} />
            <meta itemProp="copyrightNotice"    content={OWN_COPYRIGHT} />
            <meta itemProp="acquireLicensePage" content={OWN_ACQUIRE_URL} />
            <span itemScope itemType="https://schema.org/Person" itemProp="creator">
              <meta itemProp="name" content={AUTHOR_NAME} />
              <meta itemProp="url"  content={SITE_URL} />
            </span>
          </span>
        </span>
      </div>
    </>
  )
}

export default StructuredData