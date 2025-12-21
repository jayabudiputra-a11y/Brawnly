import { Link } from "react-router-dom";
import { Calendar, Clock, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import Badge from "@/components/ui/Badge";
import FormattedDate from "@/components/features/FormattedDate";
import myAvatar from "@/assets/myAvatar.jpg";
import ShareButtons from "@/components/features/ShareButtons";
import {
  generateFullImageUrl,
  getLowQualityUrl,
  type LangCode,
} from "@/utils/helpers";
import { useSaveData } from "@/hooks/useSaveData";

interface ArticleCardProps {
  article: any;
}

const LANGS = [
  "en",
  "id",
  "zh",
  "ja",
  "ko",
  "es",
  "fr",
  "de",
  "ru",
  "ar",
  "th",
  "vi",
] as const;

export default function ArticleCard({ article }: ArticleCardProps) {
  const { i18n } = useTranslation();

  const lang = (i18n.language as LangCode) || "en";

  const { isEnabled, saveData } = useSaveData();

  const title =
    article[`title_${lang}`] ??
    article.title_en ??
    article.title ??
    "";

  const excerpt =
    article[`excerpt_${lang}`] ??
    article.excerpt_en ??
    article.excerpt ??
    "";

  const firstImagePath = article.featured_image_path_clean
    ? article.featured_image_path_clean.split("\r\n")[0]?.trim()
    : null;

  const highQualityUrl = firstImagePath
    ? generateFullImageUrl(firstImagePath)
    : null;

  const isLowQualityMode = isEnabled && saveData.quality === "low";

  const displayUrl =
    isLowQualityMode && highQualityUrl
      ? getLowQualityUrl(highQualityUrl)
      : highQualityUrl;

  const authorName = article.author ?? "Anonymous";

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col h-full group">
      <Link
        to={`/article/${article.slug}`}
        className="block relative w-full aspect-video bg-gray-200 overflow-hidden"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={title}
            className="w-full h-full object-cover block group-hover:scale-[1.03] transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white text-lg font-bold">
            Fitapp
          </div>
        )}

        <div className="absolute top-2 left-2 pointer-events-none">
          <Badge variant="primary" size="sm">
            {article.category || "fit"}
          </Badge>
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link to={`/article/${article.slug}`} className="block">
          <h2 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition mb-1 line-clamp-2">
            {title}
          </h2>
        </Link>

        {excerpt ? (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2 flex-1">
            {excerpt}
          </p>
        ) : (
          <div className="flex-1 mb-2" />
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={myAvatar}
              alt={authorName}
              className="w-6 h-6 rounded-full ring-1 ring-emerald-400 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {authorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <FormattedDate
                dateString={article.published_at}
                formatString="MMMM d, yyyy"
                variant="card"
              />
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.reading_time}m
            </span>

            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.views ?? 0}
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100">
          <ShareButtons article={{ title, slug: article.slug }} />
        </div>
      </div>
    </article>
  );
}
