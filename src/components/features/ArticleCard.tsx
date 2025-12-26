import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import FormattedDate from "@/components/features/FormattedDate";
import myAvatar from "@/assets/myAvatar.jpg";
import {
  generateFullImageUrl,
  getLowQualityUrl,
  type LangCode,
} from "@/utils/helpers";
import { useSaveData } from "@/hooks/useSaveData";

interface ArticleCardProps {
  article: any;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { i18n } = useTranslation();
  const lang = (i18n.language as LangCode) || "en";
  const { isEnabled, saveData } = useSaveData();

  const title =
    article[`title_${lang}`] ??
    article.title_en ??
    article.title ??
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

  return (
    <article
      className="group bg-transparent border-b border-gray-100 dark:border-neutral-900 last:border-0 py-6 transition-colors duration-300 active:bg-neutral-100 dark:active:bg-neutral-900/30 outline-none"
      tabIndex={0}
    >
      <Link
        to={`/article/${article.slug}`}
        className="flex flex-row items-center gap-4 md:gap-8 outline-none"
      >
        <div className="relative flex-shrink-0 w-[110px] h-[110px] md:w-[200px] md:h-[130px] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={title}
              className="w-full h-full object-cover grayscale transition-all duration-500 ease-in-out group-hover:grayscale-0 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 text-[10px] font-black uppercase">
              No Image
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 translate-y-full group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-300" />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#00a354]">
            {article.category || "FITAPP SELECTION"}
          </span>

          <h2 className="text-[17px] md:text-[22px] leading-[1.2] font-black uppercase tracking-tighter text-black dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2 mb-2">
            {title}
          </h2>

          <div className="flex items-center gap-2">
            <img
              src={myAvatar}
              alt="Author"
              className="w-4 h-4 rounded-full grayscale group-hover:grayscale-0 transition-all"
            />
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <span className="text-black dark:text-white">
                By {article.author || "Putra Jaya"}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#00a354]" />
                {article.views ?? 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
