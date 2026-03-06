import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ArticleDetail from '../components/features/ArticleDetail';
import StructuredData from '../components/seo/StructuredData';
import MetaTags from '../components/seo/MetaTags';
import { useArticles } from '../hooks/useArticles';
import { registerSW } from '../pwa/swRegister';
import { 
  setCookieHash, 
  mirrorQuery, 
  warmupEnterpriseStorage 
} from '../lib/enterpriseStorage';
import { detectBestFormat } from '../lib/imageFormat';

// ─── Site Constants ──────────────────────────────────────────────────────────
const SITE_URL       = "https://www.brawnly.online";
const SITE_NAME      = "Brawnly";
const AUTHOR_NAME    = "Budi Putra Jaya";

// ─── Fallback (own content) ──────────────────────────────────────────────────
const OWN_LICENSE         = "https://creativecommons.org/licenses/by/4.0/";
const OWN_COPYRIGHT       = `© 2026 ${AUTHOR_NAME}. All rights reserved.`;
const OWN_ACQUIRE_URL     = `${SITE_URL}/license`;
const OWN_CREATOR_NAME    = AUTHOR_NAME;
const OWN_CREATOR_TYPE    = "Person";

// ─── Per-source Copyright Profiles ──────────────────────────────────────────
/**
 * Setiap properti gambar dari platform pihak ketiga tunduk pada ToS platform
 * tersebut. Di sini kita deklarasikan profil copyright yang akurat per sumber.
 */
const SOURCE_PROFILES: Record<
  string,
  {
    license: string;
    copyright: string;
    acquireUrl: string;
    creatorName: string;
    creatorType: "Person" | "Organization";
    creatorUrl: string;
  }
> = {
  instagram: {
    license:      "https://www.instagram.com/legal/terms/",
    copyright:    "© Instagram / Meta Platforms, Inc. All rights reserved.",
    acquireUrl:   "https://www.instagram.com/legal/terms/",
    creatorName:  "Instagram / Meta Platforms, Inc.",
    creatorType:  "Organization",
    creatorUrl:   "https://www.instagram.com",
  },
  tiktok: {
    license:      "https://www.tiktok.com/legal/page/us/terms-of-service/en",
    copyright:    "© TikTok / ByteDance Ltd. All rights reserved.",
    acquireUrl:   "https://www.tiktok.com/legal/page/us/terms-of-service/en",
    creatorName:  "TikTok / ByteDance Ltd.",
    creatorType:  "Organization",
    creatorUrl:   "https://www.tiktok.com",
  },
  google: {
    license:      "https://policies.google.com/terms",
    copyright:    "© Google LLC. All rights reserved.",
    acquireUrl:   "https://policies.google.com/terms",
    creatorName:  "Google LLC",
    creatorType:  "Organization",
    creatorUrl:   "https://www.google.com",
  },
  flickr: {
    // Flickr menggunakan beragam lisensi per foto; kita default ke Attribution
    license:      "https://www.flickr.com/creativecommons/",
    copyright:    "© Respective photographers on Flickr. License varies per image.",
    acquireUrl:   "https://www.flickr.com/help/terms",
    creatorName:  "Respective photographers on Flickr",
    creatorType:  "Person",
    creatorUrl:   "https://www.flickr.com",
  },
  pinterest: {
    license:      "https://policy.pinterest.com/en/terms-of-service",
    copyright:    "© Pinterest, Inc. / respective pin owners. All rights reserved.",
    acquireUrl:   "https://policy.pinterest.com/en/terms-of-service",
    creatorName:  "Pinterest / respective content creators",
    creatorType:  "Organization",
    creatorUrl:   "https://www.pinterest.com",
  },
  twitter: {
    license:      "https://twitter.com/en/tos",
    copyright:    "© X Corp. / respective tweet authors. All rights reserved.",
    acquireUrl:   "https://twitter.com/en/tos",
    creatorName:  "X Corp. / respective tweet authors",
    creatorType:  "Organization",
    creatorUrl:   "https://twitter.com",
  },
  youtube: {
    license:      "https://www.youtube.com/t/terms",
    copyright:    "© YouTube / Google LLC / respective content creators. All rights reserved.",
    acquireUrl:   "https://www.youtube.com/t/terms",
    creatorName:  "YouTube / respective content creators",
    creatorType:  "Organization",
    creatorUrl:   "https://www.youtube.com",
  },
  cloudinary: {
    // Gambar yang di-host di Cloudinary milik Brawnly sendiri
    license:      OWN_LICENSE,
    copyright:    OWN_COPYRIGHT,
    acquireUrl:   OWN_ACQUIRE_URL,
    creatorName:  OWN_CREATOR_NAME,
    creatorType:  "Person",
    creatorUrl:   SITE_URL,
  },
};

/**
 * Deteksi sumber gambar dari URL dan kembalikan profil copyright yang sesuai.
 * Jika tidak dikenal, fallback ke profil milik sendiri (Budi Putra Jaya).
 */
function detectImageSource(url: string) {
  if (!url) return null;
  const u = url.toLowerCase();

  if (u.includes("instagram.com") || u.includes("cdninstagram.com") || u.includes("fbcdn.net"))
    return SOURCE_PROFILES.instagram;
  if (u.includes("tiktok.com") || u.includes("tiktokcdn.com") || u.includes("musical.ly"))
    return SOURCE_PROFILES.tiktok;
  if (u.includes("googleusercontent.com") || u.includes("ggpht.com") || u.includes("gstatic.com"))
    return SOURCE_PROFILES.google;
  if (u.includes("flickr.com") || u.includes("staticflickr.com") || u.includes("live.staticflickr.com"))
    return SOURCE_PROFILES.flickr;
  if (u.includes("pinterest.com") || u.includes("pinimg.com"))
    return SOURCE_PROFILES.pinterest;
  if (u.includes("twitter.com") || u.includes("twimg.com") || u.includes("x.com"))
    return SOURCE_PROFILES.twitter;
  if (u.includes("youtube.com") || u.includes("ytimg.com") || u.includes("youtu.be"))
    return SOURCE_PROFILES.youtube;
  if (u.includes("cloudinary.com") || u.includes("res.cloudinary.com"))
    return SOURCE_PROFILES.cloudinary;
  if (u.includes("brawnly.online"))
    return SOURCE_PROFILES.cloudinary; // own domain → own copyright

  // Tidak dikenal — fallback ke own copyright
  return {
    license:      OWN_LICENSE,
    copyright:    OWN_COPYRIGHT,
    acquireUrl:   OWN_ACQUIRE_URL,
    creatorName:  OWN_CREATOR_NAME,
    creatorType:  "Person" as const,
    creatorUrl:   SITE_URL,
  };
}

/**
 * Bangun ImageObject schema.org sebagai object JS (untuk JSON-LD)
 * dengan semua field wajib & opsional GSC terpenuhi.
 */
function buildImageObject(url: string, name: string, description?: string) {
  if (!url) return undefined;
  const profile = detectImageSource(url);
  if (!profile) return undefined;

  return {
    "@type": "ImageObject",
    "url": url,
    "contentUrl": url,
    "name": name,
    ...(description ? { "description": description } : {}),
    "license": profile.license,
    "creator": {
      "@type": profile.creatorType,
      "name": profile.creatorName,
      "url": profile.creatorUrl,
    },
    "copyrightNotice": profile.copyright,
    "acquireLicensePage": profile.acquireUrl,
    "creditText": profile.creatorName,
  };
}

// ─── ImageObject Microdata component (untuk hidden SEO node) ─────────────────
function ImageObjectMicrodata({
  url,
  name,
  description,
}: {
  url: string;
  name: string;
  description?: string;
}) {
  const profile = detectImageSource(url);
  if (!profile || !url) return null;
  return (
    <span
      itemScope
      itemType="https://schema.org/ImageObject"
      itemProp="image"
      style={{ display: "none" }}
    >
      <meta itemProp="url" content={url} />
      <meta itemProp="contentUrl" content={url} />
      <meta itemProp="name" content={name} />
      {description && <meta itemProp="description" content={description} />}
      <meta itemProp="license" content={profile.license} />
      <meta itemProp="copyrightNotice" content={profile.copyright} />
      <meta itemProp="acquireLicensePage" content={profile.acquireUrl} />
      <span
        itemScope
        itemType={`https://schema.org/${profile.creatorType}`}
        itemProp="creator"
      >
        <meta itemProp="name" content={profile.creatorName} />
        <meta itemProp="url" content={profile.creatorUrl} />
      </span>
    </span>
  );
}

// ─── Copyright Attribution Comment (visible in page source for compliance) ───
function CopyrightAttribution({ imageUrl, title }: { imageUrl: string; title: string }) {
  const profile = detectImageSource(imageUrl);
  if (!profile) return null;
  return (
    <meta
      name="image-copyright"
      content={`${title}: ${profile.copyright} — ${profile.acquireUrl}`}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: _d, isLoading: _l } = useArticles();

  useEffect(() => {
    registerSW();
    warmupEnterpriseStorage();
    detectBestFormat();
  }, []);

  useEffect(() => {
    if (slug) {
      setCookieHash(slug);
      mirrorQuery({
        type: "ARTICLE_VIEW",
        slug: slug,
        timestamp: Date.now()
      });
    }
  }, [slug]);

  const _s = _d?.find((item: any) => item.slug === slug);

  if (_l) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="w-10 h-10 border-t-2 border-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!_s) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="opacity-5 text-[120px] font-black italic select-none">VOID</div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] -mt-10 text-neutral-400">
          Sequence Integrity Compromised
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-8 text-[11px] font-black uppercase border-b-2 border-black dark:border-white pb-1"
        >
          Re-establish Feed
        </button>
      </div>
    );
  }

  // Ambil gambar pertama dari featured_image_url (bisa multi-line)
  const metaImage = _s.featured_image_url 
    ? _s.featured_image_url.split(/[\r\n]+/)[0].trim()
    : (_s.featured_image || "");

  // Semua gambar dari featured_image_url (bisa multi-line = galeri)
  const allImages: string[] = [
    ...(_s.featured_image_url
      ? _s.featured_image_url.split(/[\r\n]+/).map((u: string) => u.trim()).filter(Boolean)
      : []),
    ...(_s.featured_image && !_s.featured_image_url ? [_s.featured_image] : []),
  ];

  // Artikel URL kanonik (tanpa trailing slash)
  const articleUrl = `${SITE_URL}/article/${slug}`;

  // JSON-LD Article dengan ImageObject penuh (multi-source copyright)
  const articleJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": _s.title,
    "description": _s.excerpt,
    "url": articleUrl,
    "datePublished": _s.published_at || new Date().toISOString(),
    "dateModified": _s.updated_at || _s.published_at || new Date().toISOString(),
    "articleSection": _s.category || "Brawnly Selection",
    "keywords": [
      _s.category || "fitness",
      "Brawnly",
      ...(Array.isArray(_s.tags) ? _s.tags : []),
    ].join(", "),
    "wordCount": _s.content?.split(/\s+/).length || 0,
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
        "license": OWN_LICENSE,
        "creator": { "@type": "Person", "name": OWN_CREATOR_NAME, "url": SITE_URL },
        "copyrightNotice": OWN_COPYRIGHT,
        "acquireLicensePage": OWN_ACQUIRE_URL,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    // FIX: image sebagai array ImageObject lengkap dengan copyright per sumber
    "image": allImages.length > 0
      ? allImages.map((imgUrl, idx) =>
          buildImageObject(
            imgUrl,
            idx === 0
              ? `Cover image — ${_s.title}`
              : `Gallery image ${idx + 1} — ${_s.title}`,
            idx === 0
              ? `Cover image for article: ${_s.title}`
              : `Gallery image for article: ${_s.title}`
          )
        ).filter(Boolean)
      : undefined,
    "isPartOf": {
      "@type": "WebSite",
      "name": SITE_NAME,
      "url": SITE_URL,
    },
  });

  // JSON-LD BreadcrumbList
  const breadcrumbJsonLd = JSON.stringify({
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
        "item": `${SITE_URL}/articles`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": _s.title,
        "item": articleUrl,
      },
    ],
  });

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-all">
      <MetaTags 
        title={`${_s.title} | Brawnly Online`} 
        description={_s.excerpt} 
        url={window.location.href} 
        image={metaImage} 
      />

      <StructuredData article={_s} />

      {/* FIX: JSON-LD Article dengan ImageObject penuh per sumber */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />

      {/* FIX: Copyright attribution meta tags per gambar */}
      {allImages.map((imgUrl, idx) => (
        <CopyrightAttribution
          key={`cp-${idx}`}
          imageUrl={imgUrl}
          title={idx === 0 ? `Cover — ${_s.title}` : `Gallery ${idx + 1} — ${_s.title}`}
        />
      ))}

      {/* ===== SEO HIDDEN CONTENT - OPTIMIZED KEYWORDS ===== */}
      <div className="hidden" aria-hidden="true">
        {/* Primary Keywords */}
        <span>Brawnly Online article {_s.title} {_s.excerpt}</span>
        
        {/* Article Metadata for Crawlers */}
        <div itemScope itemType="https://schema.org/Article">
          <meta itemProp="headline" content={_s.title} />
          <meta itemProp="description" content={_s.excerpt} />
          <meta itemProp="datePublished" content={_s.published_at || new Date().toISOString()} />
          <meta itemProp="dateModified" content={_s.updated_at || _s.published_at || new Date().toISOString()} />
          <meta itemProp="url" content={articleUrl} />
          <meta itemProp="author" content={AUTHOR_NAME} />
          <meta itemProp="wordCount" content={String(_s.content?.split(/\s+/).length || 0)} />
          {_s.category && <meta itemProp="articleSection" content={_s.category} />}

          {/* FIX: ImageObject lengkap untuk setiap gambar artikel */}
          {allImages.map((imgUrl, idx) => (
            <ImageObjectMicrodata
              key={`img-meta-${idx}`}
              url={imgUrl}
              name={
                idx === 0
                  ? `Cover image — ${_s.title}`
                  : `Gallery image ${idx + 1} — ${_s.title}`
              }
              description={
                idx === 0
                  ? `Cover image for article: ${_s.title}`
                  : `Gallery image ${idx + 1} for article: ${_s.title}`
              }
            />
          ))}
        </div>
        
        {/* Topic Cluster - Supporting Long-tail Keywords */}
        <ul>
          <li>Fitness article {_s.category || "general"}</li>
          <li>Workout guide and tips</li>
          <li>Brawnly exclusive content</li>
          <li>Expert fitness insights</li>
          <li>Training methodology</li>
          <li>Nutrition advice from Brawnly</li>
        </ul>
        
        {/* Breadcrumb Trail for SEO */}
        <div itemScope itemType="https://schema.org/BreadcrumbList">
          <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content="1" />
            <meta itemProp="name" content="Home" />
            <meta itemProp="item" content={SITE_URL} />
          </div>
          <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content="2" />
            <meta itemProp="name" content="Articles" />
            <meta itemProp="item" content={`${SITE_URL}/articles`} />
          </div>
          <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content="3" />
            <meta itemProp="name" content={_s.title} />
            <meta itemProp="item" content={articleUrl} />
          </div>
        </div>
        
        {/* Reading Time Estimation */}
        <meta name="twitter:label1" content="Reading time" />
        <meta name="twitter:data1" content={`${Math.ceil((_s.content?.split(/\s+/).length || 0) / 200)} minutes`} />
        
        {/* Category & Tags */}
        <meta name="article:section" content={_s.category || "Fitness"} />
        {_s.tags?.map((tag: string, idx: number) => (
          <meta key={idx} name="article:tag" content={tag} />
        ))}
      </div>
      
      {/* ===== INVISIBLE SEO TEXT BLOCK ===== */}
      <div style={{ display: 'none' }}>
        {/* Extended Description */}
        <p>
          Brawnly Online presents "{_s.title}" – {_s.excerpt} 
          This comprehensive guide covers {_s.category || "fitness"} techniques, 
          expert recommendations, and practical insights for your fitness journey. 
          Read more exclusive content at Brawnly.online.
        </p>
        
        {/* Keywords Density */}
        <span>Brawnly, fitness, workout, exercise, health, {_s.title}, {_s.category}, training, muscle, strength, nutrition, wellness, gym, bodybuilding, recovery, supplements, motivation, fitness tips, workout plans, Brawnly Online, exclusive content, expert advice</span>
      </div>
      
      <div className="w-full">
        <ArticleDetail />
      </div>
    </main>
  );
};

export default ArticlePage;