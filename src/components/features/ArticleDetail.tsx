// src/components/features/ArticleDetail.tsx
import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, Eye } from "lucide-react";
import { format } from "date-fns";
import StructuredData from "../seo/StructuredData";
import myAvatar from "@/assets/myAvatar.jpg";
import myPride from "@/assets/myPride.gif";
import { trackPageView } from "@/lib/trackViews";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const slugValue = slug || "unknown";
  const queryClient = useQueryClient();

  // =====================================================
  // 1) FETCH ARTICLE
  // =====================================================
  const {
    data: article,
    isLoading,
  } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      return data;
    },
    retry: false,
  });

  // =====================================================
  // 2) VIEW COUNT STATE + FETCH (fallback to articles.views)
  // =====================================================
  const [liveViewCount, setLiveViewCount] = useState<number>(0);

  const {
    data: fetchedViewCount,
  } = useQuery<number, Error>({
    queryKey: ["viewCount", article?.id],
    queryFn: async (): Promise<number> => {
      if (!article?.id) return 0;

      // Try article_view_counts first
      const { data: countsRow } = await supabase
        .from("article_view_counts")
        .select("total_views")
        .eq("article_id", article.id)
        .maybeSingle();

      if (countsRow && typeof countsRow.total_views === "number") {
        return countsRow.total_views;
      }

      // Fallback to articles.views
      const { data: articleRow } = await supabase
        .from("articles")
        .select("views")
        .eq("id", article.id)
        .maybeSingle();

      return (articleRow?.views as number) ?? 0;
    },
    enabled: !!article?.id,
    refetchInterval: 4000,
  });

  // Sync query result into local state and cache (v5-friendly replacement for onSuccess)
  useEffect(() => {
    if (typeof fetchedViewCount === "number") {
      setLiveViewCount(fetchedViewCount);
      if (article?.id) {
        queryClient.setQueryData(["viewCount", article.id], fetchedViewCount);
      }
    }
  }, [fetchedViewCount, article?.id, queryClient]);

  // =====================================================
  // 3) Realtime subscription to article_view_counts
  // =====================================================
  useEffect(() => {
    if (!article?.id) return;

    const channel = supabase
      .channel(`public:article_view_counts:article_${article.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "article_view_counts",
          filter: `article_id=eq.${article.id}`,
        },
        (payload) => {
          try {
            const record =
              (payload as any).record ??
              (payload as any).new ??
              (payload as any).old;
            if (record && typeof record.total_views === "number") {
              setLiveViewCount(record.total_views);
              queryClient.setQueryData(
                ["viewCount", article.id],
                record.total_views
              );
            }
          } catch (e) {
            console.error("Realtime payload handling error:", e);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [article?.id, queryClient]);

  // =====================================================
  // 4) TRACK PAGE VIEW (guarded)
  // =====================================================
  const hasTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!article?.id) return;
    if (hasTrackedRef.current === String(article.id)) return;

    void trackPageView(String(article.id));
    hasTrackedRef.current = String(article.id);
  }, [article?.id]);

  // =====================================================
  // LOADING & 404
  // =====================================================
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-5xl font-black text-emerald-600 animate-pulse">
          Loading, My king…
        </p>
      </div>
    );

  if (!article)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
        <h1 className="text-7xl font-black text-red-600 mb-6">404</h1>
        <Link
          to="/"
          className="bg-emerald-600 text-white px-10 py-4 rounded-full text-xl font-bold"
        >
          Kembali
        </Link>
      </div>
    );

  // =====================================================
  // PARSE IMAGES
  // =====================================================
  const imageList = article.featured_image
    ? article.featured_image
        .split(/\n|,|\s+/)
        .map((u: string) => u.trim())
        .filter((u: string) => u.startsWith("http"))
    : [];

  const coverImage = imageList[0] || null;
  const midGallery = imageList.slice(1, 6);
  const bottomGallery = imageList.slice(6);

  // =====================================================
  // RENDER CONTENT (MARKDOWN LIKE)
  // =====================================================
  const renderContent = () => {
    if (!article.content) return "";
    if (/<[a-z][\s\S]*>/i.test(article.content)) return article.content;

    const lines = article.content
      .replace(/\r\n/g, "\n")
      .replace(/\\n/g, "\n")
      .split("\n")
      .filter(Boolean);

    let html = "";
    let pCount = 0;

    lines.forEach((line: string) => {
      let text = line.trim();
      text = text.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-bold text-emerald-700">$1</strong>'
      );
      text = text.replace(
        /\*(.*?)\*/g,
        '<em class="italic text-purple-600">$1</em>'
      );

      html += `<p class="text-[17px] leading-[30px] mb-6 text-gray-800">${text}</p>`;
      pCount++;

      if (pCount === 3 && midGallery.length > 0) {
        html += `
          <div class="my-10">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              ${midGallery
                .map(
                  (url: string, i: number) => `
                <a href="${url}" download="fitapp_${slugValue}_mid_${i + 2}.jpg"
                  class="group block h-64 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <img src="${url}" alt="Gallery ${i + 2}"
                    class="w-full h-full object-cover aspect-square group-hover:scale-105 transition duration-500"/>
                </a>
              `
                )
                .join("")}
            </div>
          </div>`;
      }
    });

    return html;
  };

  // =====================================================
  // RENDER PAGE
  // =====================================================
  return (
    <>
      <Helmet>
        <title>{article.title} — Fitapp 2025</title>
        <meta name="description" content={article.excerpt || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:image" content={coverImage || ""} />
      </Helmet>

      <StructuredData
        article={{
          title: article.title,
          excerpt: article.excerpt ?? "",
          featured_image: coverImage ?? "",
          published_at: article.published_at ?? "",
        }}
      />

      <div className="min-h-screen bg-gray-100">
        {/* HERO */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-700 to-purple-800 text-white py-16 text-center shadow-md">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-base opacity-90">{article.excerpt}</p>
            )}
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10">
          <article className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            {/* AUTHOR BAR */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
              <div className="flex flex-col items-center text-center gap-3">
                <img
                  src={myAvatar}
                  alt="Budi Putra Jaya"
                  className="w-20 h-20 rounded-full ring-4 ring-white shadow-md object-cover"
                />

                <div className="flex items-center gap-3 text-2xl font-black text-gray-900">
                  <span>Budi</span>
                  <span className="relative flex flex-col items-center">
                    Putra
                    <img
                      src={myPride}
                      alt="Kumis Pride"
                      className="w-14 h-6 -mt-1 pointer-events-none"
                    />
                  </span>
                  <span>Jaya</span>
                </div>

                <div className="flex items-center gap-5 text-sm text-gray-700 mt-2">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(article.published_at), "dd MMM yyyy")}
                  </span>

                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Clock className="w-4 h-4" />
                    {article.reading_time} min
                  </span>

                  {/* VIEW COUNT */}
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <Eye className="w-4 h-4" />
                    {(liveViewCount ?? 0).toString()} views
                  </span>
                </div>
              </div>
            </div>

            {/* COVER IMAGE */}
            {coverImage && (
              <div className="px-6 pt-6">
                <a
                  href={coverImage}
                  download={`fitapp_${slugValue}_cover.jpg`}
                  className="block overflow-hidden rounded-xl shadow-sm"
                >
                  <img
                    src={coverImage}
                    alt={article.title}
                    className="w-full max-h-[340px] object-cover"
                  />
                </a>
              </div>
            )}

            {/* ARTICLE BODY */}
            <div className="px-6 py-8">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderContent() }}
              />
            </div>

            {/* BOTTOM GALLERY */}
            {bottomGallery.length > 0 && (
              <div className="px-6 pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {bottomGallery.map((url: string, i: number) => (
                    <a
                      key={i}
                      href={url}
                      download={`fitapp_${slugValue}_bottom_${i + 7}.jpg`}
                      className="block h-64 overflow-hidden rounded-xl shadow-sm hover:shadow-md transition"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${i + 7}`}
                        className="w-full h-full object-cover aspect-square"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
