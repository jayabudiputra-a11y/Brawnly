const _SK = "BRAWNLY_SNAP_V2";

export type SnapArticle = {
  title: string;
  slug: string;
  image: string;
};

export function saveSnap(data: SnapArticle[]) {
  try {
    const payload = JSON.stringify(data);
    localStorage.removeItem("BRAWNLY_SNAP_V1");
    localStorage.setItem(_SK, payload);
    window.__BRAWNLY_SNAP__ = data;
  } catch {}
}

export function loadSnap(): SnapArticle[] {
  try {
    if (window.__BRAWNLY_SNAP__?.length) return window.__BRAWNLY_SNAP__;
    const raw = localStorage.getItem(_SK);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    window.__BRAWNLY_SNAP__ = parsed;
    return parsed;
  } catch {
    return [];
  }
}