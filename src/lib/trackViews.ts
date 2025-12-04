// src/lib/trackViews.ts
export async function trackPageView(articleId: string) {
  try {
    if (!articleId) {
      console.warn("TRACK: missing articleId");
      return;
    }

    const base = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!base || !anonKey) {
      console.error("TRACK: missing Supabase env");
      return;
    }

    const endpoint = `${base.replace(/\/$/, "")}/functions/v1/track-view`;

    const res = await fetch(`${endpoint}?article_id=${encodeURIComponent(articleId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-article-id": articleId,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ article_id: articleId }),
    });

    const txt = await res.text();
    console.log("TRACK response:", res.status, txt);

    if (!res.ok) {
      console.error("TRACK failed:", res.status, txt);
    }
  } catch (err) {
    console.error("TRACK error:", err);
  }
}
