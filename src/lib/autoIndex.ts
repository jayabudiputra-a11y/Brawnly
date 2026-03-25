/**
 * autoIndex.ts — Brawnly Auto-Indexing Utility
 *
 * Handles:
 *  - IndexNow submission (Bing, Yandex, and Google-adjacent crawlers)
 *  - Google sitemap ping
 *  - Bing sitemap ping
 *  - LocalStorage deduplication (7-day TTL per URL)
 *  - Person name extraction from article text/tags
 *  - Keyword building (includes "brawnly" always)
 *
 * CATATAN PEMANGGILAN:
 *  autoIndex() / autoIndexBatch() dipanggil dari beberapa tempat.
 *  Deduplication via localStorage TTL 7-hari memastikan URL yang sama
 *  tidak di-submit ulang dalam window tersebut, meski dipanggil
 *  dari MetaTags.tsx, useArticleData.ts, maupun useArticles.ts.
 */

// ── Config ────────────────────────────────────────────────────────────────────
const SITE_URL        = "https://www.brawnly.online";
const SITEMAP_URL     = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY    =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_INDEXNOW_KEY) ||
  "brawnly2026indexnow";
const INDEX_CACHE_KEY = "__brawnly_autoindex_cache__";
const INDEX_TTL_MS    = 7 * 24 * 60 * 60 * 1000; // 7 hari

// ── Cache helpers ─────────────────────────────────────────────────────────────
interface _ICache { [url: string]: number }

function _getCache(): _ICache {
  if (typeof localStorage === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(INDEX_CACHE_KEY) || "{}"); }
  catch { return {}; }
}

function _setCache(c: _ICache): void {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(INDEX_CACHE_KEY, JSON.stringify(c)); } catch {}
}

function _wasRecentlyIndexed(url: string): boolean {
  const ts = _getCache()[url];
  return !!ts && Date.now() - ts < INDEX_TTL_MS;
}

function _markIndexed(url: string): void {
  const c = _getCache();
  c[url] = Date.now();
  // Prune entri lama — simpan maksimal 500
  const keys = Object.keys(c);
  if (keys.length > 500) {
    keys.sort((a, b) => c[a] - c[b]).slice(0, keys.length - 500).forEach((k) => delete c[k]);
  }
  _setCache(c);
}

// ── Normalize URL ─────────────────────────────────────────────────────────────
function _normalizeUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ── IndexNow ──────────────────────────────────────────────────────────────────
async function _pingIndexNow(url: string): Promise<void> {
  try {
    // Primary: IndexNow API (menjangkau Bing, Yandex, dll.)
    await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`,
      { mode: "no-cors", method: "GET" }
    );
    // Secondary: Bing IndexNow endpoint langsung
    await fetch(
      `https://www.bing.com/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`,
      { mode: "no-cors", method: "GET" }
    );
  } catch {}
}

// ── Sitemap pings ─────────────────────────────────────────────────────────────
async function _pingSitemapGoogle(): Promise<void> {
  try {
    await fetch(
      `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
      { mode: "no-cors", method: "GET" }
    );
  } catch {}
}

async function _pingSitemapBing(): Promise<void> {
  try {
    await fetch(
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
      { mode: "no-cors", method: "GET" }
    );
  } catch {}
}

// ── Public: autoIndex ─────────────────────────────────────────────────────────
/**
 * Submit satu URL ke IndexNow dan ping sitemaps.
 * Dilewati jika URL sudah di-submit dalam window TTL (7 hari).
 *
 * Dipanggil dari:
 *  - MetaTags.tsx         (delay 3000ms, per page load)
 *  - useArticleData.ts    (delay 2500ms, per artikel load)
 *  - useArticles.ts       (via autoIndexBatch, delay 4000ms, batch)
 *
 * Deduplication TTL memastikan tidak ada double-submission ke IndexNow.
 */
export async function autoIndex(url: string): Promise<void> {
  if (!url || typeof window === "undefined") return;
  const normalized = _normalizeUrl(url);
  if (!normalized.startsWith("https://")) return;
  if (_wasRecentlyIndexed(normalized)) return;

  await Promise.allSettled([
    _pingIndexNow(normalized),
    _pingSitemapGoogle(),
    _pingSitemapBing(),
  ]);

  _markIndexed(normalized);
}

/**
 * Submit banyak URL secara berurutan dengan rate limiting.
 * Digunakan di useArticles.ts untuk batch submit semua slug artikel.
 */
export async function autoIndexBatch(urls: string[]): Promise<void> {
  for (const url of urls) {
    await autoIndex(url);
    // Jeda kecil antar submission agar tidak di-rate-limit IndexNow
    await new Promise((r) => setTimeout(r, 300));
  }
}

// ── Stop words ────────────────────────────────────────────────────────────────
// Kata umum Inggris + Indonesia + Portugis yang bukan nama orang
const _STOP_WORDS = new Set([
  // English
  "the","and","for","this","that","with","from","have","will","been","has",
  "are","were","was","not","but","all","can","new","now","just","more","also",
  "into","its","their","about","after","when","where","which","who","what",
  "how","some","such","then","than","them","they","been","both","each","many",
  // Indonesian
  "dan","yang","di","ke","dari","pada","dengan","untuk","tidak","ini","itu",
  "ada","saya","kamu","dia","kami","mereka","juga","sudah","akan","bisa",
  "ada","atau","jadi","karena","namun","meski","seperti","setelah","saat",
  "dalam","luar","atas","bawah","pria","wanita","orang","dunia","tahun",
  // Portuguese
  "que","para","por","com","uma","não","mas","mais","como","ele","ela",
  "seu","sua","dos","das","nos","nas","pelo","pela","também","quando",
  // Kata umum fitness/media yang bukan nama
  "hollywood","marvel","captain","america","fitness","celebrity","actor",
  "instagram","youtube","twitter","facebook","tumblr","pinterest","substack",
]);

/**
 * Ekstrak nama orang dari plain text atau HTML.
 * Mendukung pola nama Inggris, Indonesia, dan Portugis.
 */
export function extractPersonNames(text: string): string[] {
  if (!text) return [];

  // Strip HTML tags dan entity
  const plain = text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Cocokkan 2+ kata kapital berurutan (nama orang dalam berbagai bahasa Latin)
  const nameRe =
    /\b([A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]{1,}(?:[\s\-][A-ZÁÉÍÓÚÀÈÌÒÙÃÕÂÊÎÔÛÇ][a-záéíóúàèìòùãõâêîôûç]{1,})+)\b/g;

  const found: string[] = [];
  for (const m of plain.matchAll(nameRe)) {
    const name = m[1].trim();
    const words = name.split(/[\s\-]/);
    // 2–4 kata, tiap kata 2–20 karakter, bukan stop word
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      words.every((w) => w.length >= 2 && w.length <= 20) &&
      !_STOP_WORDS.has(name.toLowerCase()) &&
      !words.every((w) => _STOP_WORDS.has(w.toLowerCase()))
    ) {
      found.push(name);
    }
  }

  return [...new Set(found)];
}

/**
 * Bangun daftar keyword yang sudah di-deduplikasi untuk meta tag.
 * Selalu menyertakan "brawnly" sebagai keyword pertama.
 *
 * @param tags       Tag artikel dari database (string[])
 * @param title      Judul artikel / halaman
 * @param content    Konten artikel (HTML atau plain text)
 * @param extra      Keyword tambahan yang selalu disertakan
 */
export function buildKeywords(
  tags: string[] = [],
  title = "",
  content = "",
  extra: string[] = []
): string {
  const always = ["brawnly", "Brawnly", "brawnly.online"];
  const fromTags    = tags.filter(Boolean);
  const fromTitle   = extractPersonNames(title);
  const fromContent = extractPersonNames(content).slice(0, 10);
  const fromExtra   = extra.filter(Boolean);

  const all = [
    ...always,
    ...fromTags,
    ...fromTitle,
    ...fromContent,
    ...fromExtra,
  ];

  // Deduplikasi case-insensitive, pertahankan casing asli
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const kw of all) {
    const key = kw.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(kw.trim());
    }
  }

  return unique.slice(0, 25).join(", ");
}