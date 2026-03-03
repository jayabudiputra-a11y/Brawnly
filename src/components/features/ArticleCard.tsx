import { Link as _L } from "react-router-dom";
import { Eye as _E, WifiOff as _Wo, Zap as _Zp } from "lucide-react";
import { useEffect as _uE, useState as _uS } from "react";
import _mA from "@/assets/myAvatar.jpg";
import { getOptimizedImage as _gOI } from "@/lib/utils";
import { useSaveData as _uSD } from "@/hooks/useSaveData";
import { CLOUDINARY_CONFIG as _CC } from "@/lib/supabase";
import { setCookieHash, mirrorQuery } from "@/lib/enterpriseStorage";
import { saveAssetToShared, getAssetFromShared } from "@/lib/sharedStorage";
import { detectBestFormat } from "@/lib/imageFormat";

const VIBRANT_COLORS = ["#facc15", "#f87171", "#60a5fa", "#4ade80", "#c084fc", "#f472b6", "#fb923c", "#2dd4bf"];

type ImageFormat = "webp" | "avif";

interface ArticleCardProps {
  article: any;
  priority?: boolean;
}

export function resolveAuthorName(article: any, defaultName = "Brawnly Editorial"): string {
  const { author, author_name } = article ?? {};

  if (typeof author === "string" && author.trim()) {
    return author.trim();
  }

  if (author && typeof author === "object") {
    const username = typeof author.username === "string" ? author.username.trim() : "";
    const name    = typeof author.name     === "string" ? author.name.trim()     : "";
    if (username) return username;
    if (name)     return name;
  }

  if (typeof author_name === "string" && author_name.trim()) {
    return author_name.trim();
  }

  return defaultName;
}

export default function ArticleCard({ article: _a, priority: _p = false }: ArticleCardProps) {
  const _t = _a.title || "Untitled Article";
  const { isEnabled: _iE, saveData: _sD } = _uSD();
  const [_oF, _sOF] = _uS(!navigator.onLine);
  const [_iL, _siL] = _uS(false);
  const [_blobUrl, _sBU] = _uS<string | null>(null);

  const [_rC, _sRC] = _uS(() => VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)]);

  const _authorName = resolveAuthorName(_a);

  _uE(() => {
    const oN = () => _sOF(false);
    const oF = () => _sOF(true);
    window.addEventListener("online", oN);
    window.addEventListener("offline", oF);
    return () => {
      window.removeEventListener("online", oN);
      window.removeEventListener("offline", oF);
    };
  }, []);

  const _fC = (_u: string) => {
    if (!_u) return "";
    if (_u.startsWith("http")) return _u;
    return `${_CC.baseUrl}/${_u}`;
  };

  const _rP = _a.featured_image ? String(_a.featured_image).split(/[\r\n]+/)[0]?.trim() : null;
  const _hQ = _rP ? _fC(_rP) : null;
  const _isLow = _iE && _sD.quality === "low";
  const _tW = _isLow ? 200 : 400;
  const _dU = _hQ ? _gOI(_hQ, _tW) : null;

  _uE(() => {
    if (!_a.slug || !_hQ) return;
    (async () => {
      try {
        mirrorQuery({ id: _a.id, slug: _a.slug, ts: Date.now(), type: "CARD_RENDER" });
        await setCookieHash(_a.slug);
        const cachedBlob = await getAssetFromShared(_a.slug);
        if (cachedBlob) {
          _sBU(URL.createObjectURL(cachedBlob));
          return;
        }
        if (navigator.onLine && !_isLow && !_p) {
          const fmtStr = await detectBestFormat();
          const fmt = (fmtStr.toLowerCase() === "avif" ? "avif" : "webp") as ImageFormat;
          const res = await fetch(_dU || _hQ, { mode: 'cors' });
          const blob = await res.blob();

          if (window.Worker) {
            const optimized = await new Promise<Blob>((resolve, reject) => {
              const worker = new Worker(new URL('@/wasm/imageWorker.ts', import.meta.url), { type: 'module' });

              worker.onmessage = (e) => {
                const { error, result } = e.data;
                worker.terminate();
                if (error) reject(new Error(error));
                else resolve(result);
              };

              worker.onerror = (err) => {
                worker.terminate();
                reject(err);
              };

              worker.postMessage({ id: `card_${_a.slug}`, blob: blob, format: fmt, quality: 0.6 });
            });
            await saveAssetToShared(_a.slug, optimized);
          }
        }
      } catch (e) {}
    })();
    return () => { if (_blobUrl) URL.revokeObjectURL(_blobUrl); };
  }, [_a.slug, _hQ, _isLow]);

  const _jL = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": _t,
    "name": _t,
    "description": _a.excerpt || _a.description || `Read ${_t} on Brawnly.`,
    "image": _hQ
      ? {
          "@type": "ImageObject",
          "url": _hQ,
          "contentUrl": _hQ,
          "name": `${_t} — cover image`,
          "representativeOfPage": true,
        }
      : undefined,
    "author": {
      "@type": "Person",
      "name": _authorName,
      "url": "https://www.brawnly.online",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly",
      "url": "https://www.brawnly.online",
      "logo": {
        "@type": "ImageObject",
        "url": "https://brawnly.online/favicon.ico",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://brawnly.online/article/${_a.slug}`,
      "url": `https://brawnly.online/article/${_a.slug}`,
    },
    "url": `https://www.brawnly.online/article/${_a.slug}`,
    "datePublished": _a.published_at || _a.created_at || undefined,
    "dateModified": _a.updated_at || _a.published_at || _a.created_at || undefined,
    "articleSection": _a.category || "Brawnly Selection",
    "keywords": _a.tags ? (Array.isArray(_a.tags) ? _a.tags.join(", ") : _a.tags) : "Brawnly, article",
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/ReadAction",
      "userInteractionCount": _a.views ?? 0,
    },
    "isPartOf": {
      "@type": "Blog",
      "name": "Brawnly",
      "url": "https://www.brawnly.online",
    },
  };

  const _jLListItem = {
    "@context": "https://schema.org",
    "@type": "ListItem",
    "item": {
      "@type": "BlogPosting",
      "url": `https://www.brawnly.online/article/${_a.slug}`,
      "headline": _t,
      "name": _t,
      "image": _hQ || undefined,
      "author": {
        "@type": "Person",
        "name": _authorName,
      },
      "datePublished": _a.published_at || _a.created_at || undefined,
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReadAction",
        "userInteractionCount": _a.views ?? 0,
      },
    },
  };

  const _displayImg = _blobUrl || _dU;

  return (
    <article
      className="group relative bg-transparent border-b border-gray-100 dark:border-neutral-900 last:border-0 py-6 outline-none overflow-hidden"
      tabIndex={0}
      itemScope
      itemType="https://schema.org/BlogPosting"
      onMouseEnter={() => _sRC(VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)])}
      style={{ "--hover-color": _rC } as React.CSSProperties}
    >
      <script type="application/ld+json">{JSON.stringify(_jL)}</script>
      <script type="application/ld+json">{JSON.stringify(_jLListItem)}</script>

      <meta itemProp="headline" content={_t} />
      <meta itemProp="name" content={_t} />
      <meta
        itemProp="description"
        content={_a.excerpt || _a.description || `Read ${_t} on Brawnly.`}
      />
      <meta
        itemProp="url"
        content={`https://www.brawnly.online/article/${_a.slug}`}
      />
      {_a.published_at && (
        <meta itemProp="datePublished" content={_a.published_at} />
      )}
      {(_a.updated_at || _a.published_at) && (
        <meta
          itemProp="dateModified"
          content={_a.updated_at || _a.published_at}
        />
      )}
      {_a.category && (
        <meta itemProp="articleSection" content={_a.category} />
      )}
      {_hQ && <meta itemProp="image" content={_hQ} />}
      <meta
        itemProp="interactionStatistic"
        content={`ReadAction:${_a.views ?? 0}`}
      />

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
        <a
          href={`https://www.brawnly.online/article/${_a.slug}`}
          itemProp="url"
          tabIndex={-1}
          rel="noopener noreferrer"
        >
          {_t}
        </a>

        <span
          itemScope
          itemType="https://schema.org/Person"
          itemProp="author"
        >
          <span itemProp="name">
            {_authorName}
          </span>
          <a
            href="https://www.brawnly.online"
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly Editorial
          </a>
        </span>

        <span
          itemScope
          itemType="https://schema.org/Organization"
          itemProp="publisher"
        >
          <span itemProp="name">Brawnly</span>
          <a
            href="https://www.brawnly.online"
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly
          </a>
          <span itemScope itemType="https://schema.org/ImageObject" itemProp="logo">
            <meta itemProp="url" content="https://brawnly.online/favicon.ico" />
          </span>
        </span>

        {_hQ && (
          <figure
            itemScope
            itemType="https://schema.org/ImageObject"
            itemProp="image"
          >
            <img
              src={_hQ}
              alt={`${_t} — cover image`}
              itemProp="url"
              tabIndex={-1}
              width={400}
              height={260}
            />
            <meta itemProp="contentUrl" content={_hQ} />
            <meta itemProp="name" content={`${_t} — cover image`} />
            <meta itemProp="representativeOfPage" content="true" />
            <figcaption itemProp="caption">{_t}</figcaption>
          </figure>
        )}

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
            content={String(_a.views ?? 0)}
          />
        </span>

        {_a.category && (
          <span itemProp="articleSection">{_a.category}</span>
        )}

        {_a.tags && (
          <span itemProp="keywords">
            {Array.isArray(_a.tags) ? _a.tags.join(", ") : _a.tags}
          </span>
        )}

        {(_a.excerpt || _a.description) && (
          <p itemProp="description">{_a.excerpt || _a.description}</p>
        )}

        <span
          itemScope
          itemType="https://schema.org/Blog"
          itemProp="isPartOf"
        >
          <a
            href="https://www.brawnly.online"
            itemProp="url"
            tabIndex={-1}
            rel="noopener noreferrer"
          >
            Brawnly Blog
          </a>
          <span itemProp="name">Brawnly</span>
        </span>
      </div>

      <_L
        to={`/article/${_a.slug}`}
        className="flex flex-row items-center gap-4 md:gap-8 outline-none relative z-10"
        aria-label={`Read article: ${_t}${_a.category ? ` — ${_a.category}` : ""}`}
      >
        <div className="relative flex-shrink-0 w-[110px] h-[110px] md:w-[200px] md:h-[130px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-xl border-2 border-transparent group-hover:border-[var(--hover-color)] transition-all duration-500 shadow-sm">
          <div className="absolute top-2 left-2 z-20 flex gap-1">
            {_oF && (
              <div
                className="bg-red-600 p-1 rounded-md shadow-lg animate-pulse"
                title="Offline"
              >
                <_Wo size={10} className="text-white" aria-hidden="true" />
              </div>
            )}
            {_blobUrl && (
              <div
                className="bg-yellow-500 p-1 rounded-md shadow-lg"
                title="Optimized"
              >
                <_Zp size={10} className="text-black" aria-hidden="true" />
              </div>
            )}
          </div>

          {!_iL && (
            <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 animate-pulse" aria-hidden="true" />
          )}

          {_displayImg ? (
            <img
              src={_displayImg}
              alt={`${_t} — thumbnail`}
              loading={_p ? "eager" : "lazy"}
              fetchPriority={_p ? "high" : "auto"}
              decoding={_p ? "sync" : "async"}
              onLoad={() => _siL(true)}
              itemProp="thumbnailUrl"
              className={`w-full h-full object-cover grayscale transition-all duration-700 ease-in-out group-hover:grayscale-0 group-hover:scale-105 ${_iL ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] font-black uppercase tracking-tighter">
              No Media
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#00a354] group-hover:text-[var(--hover-color)] transition-colors duration-300 flex items-center gap-2"
            itemProp="articleSection"
          >
            {_a.category || "BRAWNLY SELECTION"}
            {_isLow && (
              <span className="text-[8px] bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-neutral-500">
                SAVER_ON
              </span>
            )}
          </span>

          <h2
            className="text-[17px] md:text-[22px] leading-[1.2] font-black uppercase tracking-tighter text-black dark:text-white line-clamp-2 mb-2 transition-all duration-300 group-hover:translate-x-1"
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = _rC; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ""; }}
            itemProp="headline"
          >
            {_t}
          </h2>

          <div className="flex items-center gap-2">
            <img
              src={_mA}
              alt={`Author avatar — ${_authorName}`}
              className="w-4 h-4 rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 border border-neutral-200 dark:border-neutral-800"
            />
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <span
                className="text-black dark:text-white group-hover:text-[var(--hover-color)] transition-colors"
                itemProp="author"
              >
                By {_authorName}
              </span>
              <span
                className="flex items-center gap-1"
                aria-label={`${_a.views ?? 0} views`}
              >
                <_E
                  className="w-3 h-3 text-[#00a354] group-hover:text-[var(--hover-color)] transition-colors"
                  aria-hidden="true"
                />
                {_a.views ?? 0}
              </span>
            </div>
          </div>
        </div>
      </_L>

      <div
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-[var(--hover-color)] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-all duration-500"
        aria-hidden="true"
      />
    </article>
  );
}