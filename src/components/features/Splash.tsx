import { useEffect, useState } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import { setCookieHash, mirrorQuery } from "@/lib/enterpriseStorage";
import { detectBestFormat } from "@/lib/imageFormat";
import { wasmTranscodeImage } from "@/lib/wasmImagePipeline";
import { saveAssetToShared, getAssetFromShared } from "@/lib/sharedStorage";
import "@/styles/splash.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const texts = [
  "I am Budi Putra Jaya",
  "I am here for you babe",
  "I am gay like you",
];

const photos = [
  `https://res.cloudinary.com/dtkiwn8i4/image/upload/v1772196867/qeb5419ze2ok240tufnz.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/self/putra-self.jpeg`,
  `${SUPABASE_URL}/storage/v1/object/public/self/putra-self%20(2).jpeg`,
  `${SUPABASE_URL}/storage/v1/object/public/self/putra-selfk.jpeg`,
];

const videoSrc = `${SUPABASE_URL}/storage/v1/object/public/self/putra-self.mp4`;

const mediaItems = [...photos, videoSrc];

const rotations = [
  "rotate-6",
  "-rotate-12",
  "rotate-6",
  "-rotate-12",
  "rotate-3",
];

/* ============================================================
   PERSON / AUTHOR CONSTANTS — used across SEO nodes
   ============================================================ */
const PERSON_NAME = "Budi Putra Jaya";
const SITE_URL = "https://www.brawnly.online";
const SPLASH_URL = `${SITE_URL}/`;

export default function Splash() {
  const [textIndex, setTextIndex] = useState(0);
  const [blobs, setBlobs] = useState<Record<string, string>>({});

  useEffect(() => {
    const textTimer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 1400);

    const script = document.createElement("script");
    script.src =
      "https://pl28680659.effectivegatecpm.com/c57d71c78e6c823d7af356008a2e25b5/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);

    setCookieHash("splash_session");
    mirrorQuery({ event: "splash_view", ts: Date.now() });

    const processImages = async () => {
      const fmt = await detectBestFormat();
      const newBlobs: Record<string, string> = {};

      for (let i = 0; i < photos.length; i++) {
        const id = `splash_img_${i}`;
        const cached = await getAssetFromShared(id);

        if (cached) {
          newBlobs[i] = URL.createObjectURL(cached);
        } else if (navigator.onLine) {
          try {
            const res = await fetch(photos[i]);
            const blob = await res.blob();
            const optimized = await wasmTranscodeImage(blob, fmt, 0.85);
            await saveAssetToShared(id, optimized);
            newBlobs[i] = URL.createObjectURL(optimized);
          } catch {
            newBlobs[i] = photos[i];
          }
        } else {
          newBlobs[i] = photos[i];
        }
      }

      setBlobs(newBlobs);
    };

    processImages();

    return () => {
      clearInterval(textTimer);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      Object.values(blobs).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, []);

  /* ============================================================
     JSON-LD: Person — author / subject of the splash page
     ============================================================ */
  const _jLdPerson = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": PERSON_NAME,
    "alternateName": "Putra",
    "url": SITE_URL,
    "description": `${PERSON_NAME} — creator and author at Brawnly. Explore articles, visual content, and personal media.`,
    "image": photos.map((src, i) => ({
      "@type": "ImageObject",
      "url": src,
      "name": `${PERSON_NAME} — photo ${i + 1}`,
      "contentUrl": src,
      "representativeOfPage": i === 0,
    })),
    "sameAs": [SITE_URL],
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly",
      "url": SITE_URL,
    },
  };

  /* ============================================================
     JSON-LD: WebPage — splash / landing page
     ============================================================ */
  const _jLdWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": SPLASH_URL,
    "url": SPLASH_URL,
    "name": `${PERSON_NAME} — Brawnly`,
    "description": `Welcome to Brawnly — the personal space of ${PERSON_NAME}. Discover articles, visual media, and editorial content.`,
    "inLanguage": "id",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Brawnly",
      "url": SITE_URL,
    },
    "about": {
      "@type": "Person",
      "name": PERSON_NAME,
      "url": SITE_URL,
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": photos[0],
      "contentUrl": photos[0],
      "representativeOfPage": true,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly",
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/favicon.ico`,
      },
    },
  };

  /* ============================================================
     JSON-LD: ImageGallery — splash photos
     ============================================================ */
  const _jLdGallery = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": `${PERSON_NAME} — Photo Gallery`,
    "description": `Personal photo gallery of ${PERSON_NAME} on Brawnly.`,
    "url": SPLASH_URL,
    "numberOfItems": photos.length,
    "image": photos.map((src, i) => ({
      "@type": "ImageObject",
      "url": src,
      "contentUrl": src,
      "name": `${PERSON_NAME} — photo ${i + 1}`,
      "description": `Personal photo ${i + 1} of ${PERSON_NAME}`,
      "representativeOfPage": i === 0,
      "encodingFormat": "image/jpeg",
    })),
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly",
      "url": SITE_URL,
    },
  };

  /* ============================================================
     JSON-LD: VideoObject — splash video
     ============================================================ */
  const _jLdVideo = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `${PERSON_NAME} — self video`,
    "description": `Personal video of ${PERSON_NAME} featured on the Brawnly splash page.`,
    "contentUrl": videoSrc,
    "thumbnailUrl": photos[0],
    "uploadDate": new Date().toISOString().split("T")[0],
    "author": {
      "@type": "Person",
      "name": PERSON_NAME,
      "url": SITE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly",
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/favicon.ico`,
      },
    },
    "isPartOf": {
      "@type": "WebPage",
      "@id": SPLASH_URL,
    },
  };

  /* ============================================================
     JSON-LD: BreadcrumbList
     ============================================================ */
  const _jLdBreadcrumb = {
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
        "name": PERSON_NAME,
        "item": SPLASH_URL,
      },
    ],
  };

  return (
    <section
      className="splash-section"
      itemScope
      itemType="https://schema.org/WebPage"
      aria-label={`Splash page — ${PERSON_NAME}`}
    >
      {/* ── JSON-LD: Person ── */}
      <script type="application/ld+json">{JSON.stringify(_jLdPerson)}</script>

      {/* ── JSON-LD: WebPage ── */}
      <script type="application/ld+json">{JSON.stringify(_jLdWebPage)}</script>

      {/* ── JSON-LD: ImageGallery ── */}
      <script type="application/ld+json">{JSON.stringify(_jLdGallery)}</script>

      {/* ── JSON-LD: VideoObject ── */}
      <script type="application/ld+json">{JSON.stringify(_jLdVideo)}</script>

      {/* ── JSON-LD: BreadcrumbList ── */}
      <script type="application/ld+json">{JSON.stringify(_jLdBreadcrumb)}</script>

      {/* ── Microdata: WebPage-level ── */}
      <meta itemProp="url" content={SPLASH_URL} />
      <meta itemProp="name" content={`${PERSON_NAME} — Brawnly`} />
      <meta
        itemProp="description"
        content={`Welcome to Brawnly — the personal space of ${PERSON_NAME}.`}
      />
      <meta itemProp="inLanguage" content="id" />

      {/* ── SEO HIDDEN: full person + media node for crawlers ── */}
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
        {/* Person */}
        <span itemScope itemType="https://schema.org/Person" itemProp="about">
          <span itemProp="name">{PERSON_NAME}</span>
          <span itemProp="alternateName">Putra</span>
          <a
            href={SITE_URL}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {PERSON_NAME} on Brawnly
          </a>
          <meta
            itemProp="description"
            content={`${PERSON_NAME} — creator and author at Brawnly.`}
          />
        </span>

        {/* Publisher */}
        <span itemScope itemType="https://schema.org/Organization" itemProp="publisher">
          <span itemProp="name">Brawnly</span>
          <a
            href={SITE_URL}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly
          </a>
        </span>

        {/* Photo gallery — all photos described for crawlers */}
        <figure
          itemScope
          itemType="https://schema.org/ImageGallery"
          aria-label={`${PERSON_NAME} photo gallery`}
        >
          <meta itemProp="name" content={`${PERSON_NAME} — Photo Gallery`} />
          <meta itemProp="numberOfItems" content={String(photos.length)} />
          <ol>
            {photos.map((src, i) => (
              <li
                key={`seo-photo-${i}`}
                itemScope
                itemType="https://schema.org/ImageObject"
                itemProp="image"
              >
                <img
                  src={src}
                  alt={`${PERSON_NAME} — photo ${i + 1}`}
                  itemProp="contentUrl"
                  tabIndex={-1}
                />
                <meta itemProp="url" content={src} />
                <meta
                  itemProp="name"
                  content={`${PERSON_NAME} — photo ${i + 1}`}
                />
                <meta
                  itemProp="description"
                  content={`Personal photo ${i + 1} of ${PERSON_NAME}`}
                />
                <meta
                  itemProp="representativeOfPage"
                  content={String(i === 0)}
                />
                <meta itemProp="encodingFormat" content="image/jpeg" />
                <figcaption itemProp="caption">
                  {PERSON_NAME} — photo {i + 1}
                </figcaption>
              </li>
            ))}
          </ol>
        </figure>

        {/* Video described for crawlers */}
        <span itemScope itemType="https://schema.org/VideoObject" itemProp="video">
          <meta itemProp="name" content={`${PERSON_NAME} — self video`} />
          <meta
            itemProp="description"
            content={`Personal video of ${PERSON_NAME} featured on the Brawnly splash page.`}
          />
          <meta itemProp="contentUrl" content={videoSrc} />
          <meta itemProp="thumbnailUrl" content={photos[0]} />
          <a
            href={videoSrc}
            itemProp="contentUrl"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            {PERSON_NAME} — self video
          </a>
          <span itemScope itemType="https://schema.org/Person" itemProp="author">
            <span itemProp="name">{PERSON_NAME}</span>
          </span>
        </span>

        {/* Rotating texts — described as keywords/taglines */}
        <span itemProp="keywords">
          {texts.join(", ")}
        </span>

        {/* Canonical + isPartOf */}
        <link rel="canonical" href={SPLASH_URL} />
        <span itemScope itemType="https://schema.org/WebSite" itemProp="isPartOf">
          <a
            href={SITE_URL}
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly
          </a>
          <span itemProp="name">Brawnly</span>
        </span>
      </div>

      {/* ── Header with rotating text (existing logic preserved) ── */}
      <div className="splash-header">
        <h1
          key={textIndex}
          className="splash-title"
          aria-label={texts[textIndex]}
          itemProp="name"
        >
          {texts[textIndex]}
        </h1>
      </div>

      {/* ── Media grid (existing logic preserved) ── */}
      <div
        className="splash-media-wrapper"
        itemScope
        itemType="https://schema.org/ImageGallery"
        aria-label={`${PERSON_NAME} — photos and video`}
      >
        <meta itemProp="name" content={`${PERSON_NAME} — Media`} />
        <meta itemProp="numberOfItems" content={String(mediaItems.length)} />

        {mediaItems.map((item, index) => {
          const isVideo = item === videoSrc;
          const imgSrc =
            index < photos.length ? blobs[index] || photos[index] : "";
          const isMainPhoto =
            !isVideo && photos[index]?.includes("putra-self.jpeg");

          return (
            <div
              key={index}
              className={`splash-card ${
                isVideo
                  ? "video-card"
                  : isMainPhoto
                  ? "main-photo"
                  : "frame-photo"
              } ${rotations[index]}`}
              itemScope
              itemType={
                isVideo
                  ? "https://schema.org/VideoObject"
                  : "https://schema.org/ImageObject"
              }
              itemProp={isVideo ? "video" : "image"}
            >
              {isVideo ? (
                <>
                  {/* Microdata for video item */}
                  <meta
                    itemProp="name"
                    content={`${PERSON_NAME} — self video`}
                  />
                  <meta itemProp="contentUrl" content={item} />
                  <meta itemProp="thumbnailUrl" content={photos[0]} />
                  <video
                    src={item}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="splash-media"
                    aria-label={`${PERSON_NAME} — personal video`}
                    title={`${PERSON_NAME} — self video`}
                  />
                </>
              ) : (
                <>
                  {/* Microdata for image item */}
                  <meta itemProp="url" content={photos[index] || imgSrc} />
                  <meta
                    itemProp="contentUrl"
                    content={photos[index] || imgSrc}
                  />
                  <meta
                    itemProp="name"
                    content={`${PERSON_NAME} — photo ${index + 1}`}
                  />
                  <meta
                    itemProp="representativeOfPage"
                    content={String(index === 0)}
                  />
                  <img
                    src={imgSrc}
                    alt={`${PERSON_NAME} — photo ${index + 1}`}
                    className="splash-media"
                    loading={index === 0 ? "eager" : "lazy"}
                    itemProp="contentUrl"
                  />
                  {/* sr-only figcaption for accessibility */}
                  <span className="sr-only">
                    {PERSON_NAME} — photo {index + 1}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Ad wrapper (existing logic preserved) ── */}
      <div className="splash-ad-wrapper" aria-hidden="true">
        <div className="splash-ad-box">
          <div
            id="container-c57d71c78e6c823d7af356008a2e25b5"
            className="splash-ad-container"
          ></div>
        </div>
      </div>

      <ScrollToTopButton />
    </section>
  );
}