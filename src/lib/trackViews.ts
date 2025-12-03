export async function trackPageView(articleId: string) {
  try {
    const base = import.meta.env.VITE_SUPABASE_URL ?? "";
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

    // URL with query fallback
    const urlWithQuery = `${base.replace(/\/$/, "")}/functions/v1/track-view?article_id=${encodeURIComponent(
      String(articleId)
    )}`;

    // Debug logs (hapus setelah sukses)
    console.log("TRACK: urlWithQuery ->", urlWithQuery);
    console.log("TRACK: anonKey present ->", !!anonKey);
    console.log("TRACK: payload ->", { article_id: articleId });

    // Send POST with:
    // - query string fallback
    // - header fallback x-article-id
    // - JSON body
    const res = await fetch(urlWithQuery, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-article-id": String(articleId),
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ article_id: articleId }),
    });

    const text = await res.text();
    console.log("TRACK: function response ->", res.status, text);

    if (!res.ok) {
      throw new Error(`trackPageView failed: ${res.status} ${text}`);
    }
  } catch (err) {
    console.error("trackPageView error:", err);
  }
}
