import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Eye } from "lucide-react";

import FormattedDate from "@/components/features/FormattedDate";
import StructuredData from "../seo/StructuredData";
import myAvatar from "@/assets/myAvatar.jpg";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import CommentSection from "@/components/articles/CommentSection";

import { useArticleData } from "@/hooks/useArticleData";
import { useArticleViews } from "@/hooks/useArticleViews";
import ArticleImageGallery from "@/components/features/ArticleImageGallery";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";
import { getOptimizedImage } from "@/lib/utils";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const slugValue = slug ?? "unknown";

  const { processedData, isLoading, article } = useArticleData();

  const initialViewsFromArticle = article?.views ?? 0;

  const { viewCount } = useArticleViews({
    id: article?.id ?? "",
    slug: slugValue,
    initialViews: initialViewsFromArticle,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xl font-black uppercase tracking-tighter animate-pulse text-neutral-500">
            Loading article...
          </p>
        </div>
      </div>
    );
  }

  if (!processedData || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white dark:bg-black px-4">
        <h1 className="text-9xl font-black text-neutral-200 dark:text-neutral-800 mb-6">
          404
        </h1>
        <Link
          to="/"
          className="border-2 border-black dark:border-white text-black dark:text-white px-8 py-3 text-sm font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition duration-200"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const {
    title,
    excerpt,
    paragraphs,
    coverImage,
    midGallery: midGalleryString,
    bottomGallery: bottomGalleryString,
  } = processedData;

  const metaDescription =
    excerpt ||
    `Read ${title} on Fitapp 2025. Explore fitness inspiration, mindset, and wellness community stories.`;

  const ogImageUrl = getOptimizedImage(coverImage, 1200);

  const cleanParagraphs = paragraphs.filter(
    (line: string) => line.trim() !== "" && line.trim() !== "&nbsp;"
  );

  return (
    <main className="bg-white dark:bg-black min-h-screen pb-10 text-black dark:text-white transition-colors duration-300">
      <Helmet>
        <title>{title} — Fitapp 2025</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${title} — Fitapp 2025`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <StructuredData
        article={{
          title,
          excerpt: metaDescription,
          featured_image: ogImageUrl,
          published_at: article.published_at,
        }}
      />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <article className="pt-10">
          <header className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <span className="bg-[#008142] text-white text-[10px] font-black px-2 py-0.5 tracking-[.15em] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                Fitapp Selection
              </span>
            </div>

            <h1 className="text-[34px] md:text-[58px] leading-[1] font-black uppercase tracking-tighter mb-6 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-500 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>

            <div className="flex flex-col items-center border-y border-gray-100 dark:border-neutral-800 py-4">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={getOptimizedImage(myAvatar, 80)}
                  alt={`Author ${article.author}`}
                  className="w-10 h-10 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-300 shadow-md"
                  width="40"
                  height="40"
                  loading="eager"
                />
                <span className="text-[12px] font-black uppercase tracking-widest">
                  By {article.author ?? "Fitapp Contributor"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mt-1">
                <FormattedDate
                  dateString={article.published_at}
                  formatString="MMMM d, yyyy"
                />
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-[#008142]" /> {viewCount}
                </span>
              </div>
            </div>
          </header>

          <p className="text-[18px] md:text-[20px] leading-relaxed font-medium text-neutral-700 dark:text-neutral-400 italic text-center mb-8">
            {excerpt}
          </p>

          <div className="max-w-none">
            {cleanParagraphs.map((line: string, index: number) => {
              const processedLine = line
                .trim()
                .replace(/\*\*(.*?)\*\*/g, `<strong class="font-black">$1</strong>`)
                .replace(/\*(.*?)\*/g, `<em class="italic">$1</em>`);

              return (
                <div key={index}>
                  <p
                    className="text-[18px] md:text-[20px] leading-[1.7] mb-6 font-serif"
                    dangerouslySetInnerHTML={{ __html: processedLine }}
                  />

                  {index === 0 && (
                    <div className="my-10 max-w-[700px] mx-auto text-center">
                      <ArticleCoverImage
                        imageUrl={coverImage}
                        title={title}
                        slug={slugValue}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {midGalleryString && (
            <section className="mt-8 mb-12">
              <ArticleImageGallery
                images={midGalleryString}
                title=""
                slug={slugValue}
                downloadPrefix="mid"
                startIndex={1}
                containerClassName="px-0 py-0" 
              />
            </section>
          )}

          {bottomGalleryString && (
            <section className="mt-8 mb-16">
              <ArticleImageGallery
                images={bottomGalleryString}
                title=""
                slug={slugValue}
                downloadPrefix="bottom"
                startIndex={7}
                containerClassName="px-0 py-0"
              />
            </section>
          )}

          {/* PERBAIKAN SPACING:
              1. mt-20: Memberikan jarak yang sangat lega setelah galeri terakhir.
              2. pt-12: Memberikan padding top di dalam border agar teks Discussion tidak menempel ke garis.
          */}
          <section className="mt-20 border-t border-gray-100 dark:border-neutral-900 pt-12">
            <CommentSection articleId={article.id} />
          </section>
        </article>
      </div>

      <ScrollToTopButton />
    </main>
  );
}