const SNAP_KEY = "BRAWNLY_SNAP_V1";

export type SnapArticle = {
  title: string;
  slug: string;
  image: string;
};

export function saveSnap(data: SnapArticle[]) {
  try {
    localStorage.setItem(SNAP_KEY, JSON.stringify(data));
    window.__BRAWNLY_SNAP__ = data;
  } catch {}
}

export function loadSnap(): SnapArticle[] {
  try {
    if (window.__BRAWNLY_SNAP__) return window.__BRAWNLY_SNAP__;

    const raw = localStorage.getItem(SNAP_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    window.__BRAWNLY_SNAP__ = parsed;
    return parsed;
  } catch {
    return [];
  }
}
