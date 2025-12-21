import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, Eye } from "lucide-react";

import FormattedDate from "@/components/features/FormattedDate";
import StructuredData from "../seo/StructuredData";
import myAvatar from "@/assets/myAvatar.jpg";
import Card from "@/components/ui/Card";
import ScrollToTopButton from "@/components/features/ScrollToTopButton";
import CommentSection from "@/components/articles/CommentSection";

import { useArticleData } from "@/hooks/useArticleData";
import { useArticleViews } from "@/hooks/useArticleViews";
import ArticleImageGallery from "@/components/features/ArticleImageGallery";
import ArticleCoverImage from "@/components/features/ArticleCoverImage";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  featured_image_path_clean?: string;
  featured_image_url_clean?: string;
  published_at: string;
  views: number;
  reading_time: number;
  tags: string[];
  [key: string]: any;
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-5xl font-black text-emerald-600 animate-pulse">
          {t("loading....babe")}
        </p>
      </div>
    );

  if (!processedData || !article)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-7xl font-black text-red-600 mb-6">404</h1>
        <Link
          to="/"
          className="bg-emerald-600 text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-emerald-700 transition duration-200"
        >
          {t("back")}
        </Link>
        <p className="mt-4 text-gray-500">
          {t("Article not found or article data is incomplete.")}
        </p>
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
    <>
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

      <div className="min-h-screen flex justify-center">
        <article className="bg-white rounded-2xl shadow-xl border overflow-hidden max-w-4xl w-full">
          <div className="px-6 pt-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <img
                src={myAvatar}
                alt={t("Author")}
                className="w-12 h-12 rounded-full ring-2 ring-emerald-500 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {article.author ?? "Fitapp Contributor"}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <FormattedDate
                      dateString={article.published_at}
                      formatString="MMMM d, yyyy"
                    />
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.reading_time}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {viewCount}
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
              {title}
            </h1>

            <p className="text-lg italic font-medium text-gray-600 mb-0">
              {excerpt}
            </p>
          </div>

          <div className="px-6 py-8">
            <div className="prose max-w-none">
              {paragraphs.map((line: string, originalIndex: number) => {
                const processedLine = line
                  .trim()
                  .replace(
                    /\*\*(.*?)\*\*/g,
                    `<strong class="font-bold text-emerald-700">$1</strong>`
                  )
                  .replace(
                    /\*(.*?)\*/g,
                    `<em class="italic text-purple-600">$1</em>`
                  );

                return (
                  <div key={originalIndex}>
                    {originalIndex === 0 && (
                      <div className="mb-8 mt-2 -mx-6 sm:-mx-6 md:-mx-8 lg:mx-0">
                        <ArticleCoverImage
                          imageUrl={coverImage}
                          title={title}
                          slug={slugValue}
                        />
                      </div>
                    )}

                    <p
                      className="text-base sm:text-lg leading-relaxed mb-6 text-gray-800"
                      dangerouslySetInnerHTML={{ __html: processedLine }}
                    />

                    {originalIndex === 2 && (
                      <ArticleImageGallery
                        images={midGalleryString}
                        title="Gallery"
                        slug={slugValue}
                        containerClassName="my-10 -mx-6 px-6"
                        downloadPrefix="mid"
                        startIndex={1}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <ArticleImageGallery
            images={bottomGalleryString}
            title="More Photos"
            slug={slugValue}
            downloadPrefix="bottom"
            startIndex={7}
          />

          <div className="px-6 pb-6 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-semibold text-gray-500">
                {t("Tags")}:
              </span>
              {(article.tags || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <CommentSection articleId={article.id} />
          </div>
        </article>
      </div>

      <ScrollToTopButton aria-label={t("Scroll to top")} />
    </>
  );
}
