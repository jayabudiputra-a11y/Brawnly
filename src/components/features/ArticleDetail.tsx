import { useTranslation } from "react-i18next";
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

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <p className="text-2xl font-black uppercase tracking-tighter animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          Loading article...
        </p>
      </div>
    );

  if (!processedData || !article)
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

  const {
    title,
    excerpt,
    paragraphs,
    coverImage,
    midGallery: midGalleryString,
    bottomGallery: bottomGalleryString,
  } = processedData;

  return (
    <main className="bg-white dark:bg-black min-h-screen pb-20 text-black dark:text-white transition-colors duration-300">
      <Helmet>
        <title>{title} — Fitapp 2025</title>
        <meta name="description" content={excerpt} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:type" content="article" />
      </Helmet>

      <StructuredData
        article={{
          title,
          excerpt,
          featured_image: coverImage,
          published_at: article.published_at,
        }}
      />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <article className="pt-12">
          <header className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <span className="bg-[#00a354] text-white text-[10px] font-black px-2 py-0.5 tracking-[.15em] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                Fitapp Selection
              </span>
            </div>

            <h1 className="text-[34px] md:text-[58px] leading-[1] font-black uppercase tracking-tighter mb-8 bg-gradient-to-r from-red-500 via-orange-400 via-yellow-500 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>

            <div className="flex flex-col items-center border-y border-gray-100 dark:border-neutral-800 py-6">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={myAvatar}
                  alt="Author"
                  className="w-10 h-10 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-300 shadow-md"
                />
                <span className="text-[12px] font-black uppercase tracking-widest text-black dark:text-white">
                  By {article.author ?? "Fitapp Contributor"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-neutral-500 mt-2">
                <FormattedDate
                  dateString={article.published_at}
                  formatString="MMMM d, yyyy"
                />
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-[#00a354]" /> {viewCount}
                </span>
              </div>
            </div>
          </header>

          <p className="text-[20px] leading-relaxed font-medium text-neutral-500 italic text-center mb-10">
            {excerpt}
          </p>

          <div className="max-w-none">
            {paragraphs.map((line: string, index: number) => {
              const processedLine = line
                .trim()
                .replace(
                  /\*\*(.*?)\*\*/g,
                  `<strong class="font-black text-black dark:text-white">$1</strong>`
                )
                .replace(/\*(.*?)\*/g, `<em class="italic">$1</em>`);

              return (
                <div key={index}>
                  <p
                    className="text-[18px] md:text-[20px] leading-[1.8] mb-8 text-neutral-700 dark:text-neutral-200 font-serif"
                    dangerouslySetInnerHTML={{ __html: processedLine }}
                  />

                  {index === 0 && (
                    <div className="my-10 max-w-[600px] mx-auto text-center">
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
            <div className="my-16 pt-10 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 shadow-[0_0_10px_rgba(255,0,0,0.3)]" />
              <h3 className="text-[13px] font-black uppercase tracking-[.25em] mb-8 text-center bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
                Highlights Gallery
              </h3>
              <ArticleImageGallery
                images={midGalleryString}
                title=""
                slug={slugValue}
                downloadPrefix="mid"
                startIndex={1}
              />
            </div>
          )}

          {bottomGalleryString && (
            <div className="mt-20 pt-12 relative">
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(0,163,84,0.3)]" />

              <h3 className="text-[14px] md:text-[18px] font-black uppercase tracking-[.4em] mb-10 text-center bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                More Photos Gallery
              </h3>

              <div className="max-w-[600px] mx-auto">
                <ArticleImageGallery
                  images={bottomGalleryString}
                  title=""
                  slug={slugValue}
                  downloadPrefix="bottom"
                  startIndex={7}
                />
              </div>
            </div>
          )}

          <div className="mt-20 pt-10 relative">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-200 dark:bg-neutral-800" />
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[14px] font-black uppercase tracking-[.3em] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
                Explore Tags:
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              {(article.tags || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="relative text-[11px] font-black uppercase tracking-[0.2em] px-5 py-2.5 transition-all duration-300
                             text-black dark:text-white
                             bg-white dark:bg-neutral-900
                             hover:scale-105 active:scale-95 cursor-default
                             shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]"
                  style={{
                    border: "2px solid transparent",
                    borderImageSource:
                      "linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #0000ff, #8800ff)",
                    borderImageSlice: 1,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-24 border-t border-gray-100 dark:border-neutral-900 pt-12">
            <CommentSection articleId={article.id} />
          </div>
        </article>
      </div>

      <ScrollToTopButton />
    </main>
  );
}
