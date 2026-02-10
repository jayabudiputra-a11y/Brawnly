const SNAP = "brawnly_articles_snap_v3";
const QUERY = "brawnly_query_mirror_v3";
const TTL = "brawnly_ttl_v3";

/* COOKIE HASH (¼ MEMORY) */
function h(s: string) {
  let x = 0;
  for (let i = 0; i < s.length; i++) {
    x = Math.imul(31, x) + s.charCodeAt(i);
  }
  return Math.abs(x).toString(36);
}

export function setCookieHash(id: string) {
  document.cookie = `b_v=${h(id)};path=/;SameSite=Lax;max-age=604800`;
}

/* SNAPSHOT STORE */
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

/* TTL CHECK (60 MENIT) */
export function isTTLExpired() {
  try {
    const t = Number(localStorage.getItem(TTL) || 0);
    return Date.now() - t > 60 * 60 * 1000;
  } catch {
    return true;
  }
}

/* FB BIGQUERY STYLE MIRROR */
export function mirrorQuery(row: any) {
  try {
    const q = JSON.parse(localStorage.getItem(QUERY) || "[]");
    q.unshift(row);
    if (q.length > 200) q.length = 200;
    localStorage.setItem(QUERY, JSON.stringify(q));
  } catch {}
}

/* ENTERPRISE WARMUP */
export function warmupEnterpriseStorage() {
  try {
    localStorage.getItem(SNAP);
    localStorage.getItem(QUERY);
    localStorage.getItem(TTL);
  } catch {}
}
