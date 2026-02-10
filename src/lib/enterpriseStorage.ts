import { cookieHashQuarter as _chQ } from "@/lib/cookieHash";

const SNAP = "brawnly_articles_snap_v3";
const QUERY = "brawnly_query_mirror_v3";
const TTL = "brawnly_ttl_v3";

/* ==================================
    ENTERPRISE COOKIE HASH (¼ MEMORY)
   ================================== */

/**
 * Menghasilkan hash sesi yang aman menggunakan SHA-256 
 * dengan footprint memori minimal (1/4).
 */
export async function setCookieHash(id: string) {
  try {
    const _hV = await _chQ(id + Date.now());
    document.cookie = `b_v=${_hV}; path=/; SameSite=Strict; max-age=604800`;
  } catch (_e) {
    // Fallback sederhana jika Web Crypto API tidak tersedia
    const _fB = Math.abs(id.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(36);
    document.cookie = `b_v=${_fB}; path=/; SameSite=Lax; max-age=604800`;
  }
}

/* ==================================
    SNAPSHOT STORE (FAST-LOAD)
   ================================== */

export function saveArticlesSnap(data: any[]) {
  try {
    localStorage.setItem(SNAP, JSON.stringify(data));
    localStorage.setItem(TTL, Date.now().toString());
  } catch {}
}

export function getArticlesSnap() {
  try {
    return JSON.parse(localStorage.getItem(SNAP) || "[]");
  } catch {
    return [];
  }
}

/* ==================================
    TTL CHECK (60 MENIT)
   ================================== */

export function isTTLExpired() {
  try {
    const t = Number(localStorage.getItem(TTL) || 0);
    return Date.now() - t > 60 * 60 * 1000;
  } catch {
    return true;
  }
}

/* ==================================
    FB BIGQUERY STYLE MIRROR
   ================================== */

export function mirrorQuery(row: any) {
  try {
    const q = JSON.parse(localStorage.getItem(QUERY) || "[]");
    q.unshift(row);
    if (q.length > 200) q.length = 200;
    localStorage.setItem(QUERY, JSON.stringify(q));
  } catch {}
}

/* ==================================
    ENTERPRISE WARMUP
   ================================== */

export function warmupEnterpriseStorage() {
  try {
    localStorage.getItem(SNAP);
    localStorage.getItem(QUERY);
    localStorage.getItem(TTL);
  } catch {}
}