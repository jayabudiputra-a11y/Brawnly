import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import myAvatar from "@/assets/myAvatar.jpg";
import { getOptimizedImage } from "@/lib/utils";
import {
  generateFullImageUrl,
  type LangCode,
} from "@/utils/helpers";
import { useSaveData } from "@/hooks/useSaveData";

interface ArticleCardProps {
  article: any;
  priority?: boolean;
}

export default function ArticleCard({ article, priority = false }: ArticleCardProps) {
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

  const rawImageUrl = firstImagePath ? generateFullImageUrl(firstImagePath) : null;

  const isLowQualityMode = isEnabled && saveData.quality === "low";
  const targetWidth = isLowQualityMode ? 200 : 400;
  
  const displayUrl = rawImageUrl ? getOptimizedImage(rawImageUrl, targetWidth) : null;

  return (
    <article
      className="group relative bg-transparent border-b border-gray-100 dark:border-neutral-900 last:border-0 py-6 outline-none overflow-hidden"
      tabIndex={0}
    >
      <Link
        to={`/article/${article.slug}`}
        className="flex flex-row items-center gap-4 md:gap-8 outline-none relative z-10"
      >
        <div className="relative flex-shrink-0 w-[110px] h-[110px] md:w-[200px] md:h-[130px] overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-transparent group-hover:border-yellow-400/50 transition-colors duration-500">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={title}
              loading={priority ? "eager" : "lazy"}
              width={200}
              height={130}
              className="w-full h-full object-cover grayscale transition-all duration-700 ease-in-out group-hover:grayscale-0 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-600 text-[10px] font-black uppercase">
              No Image
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_#facc15]" />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-[#00a354] group-hover:text-yellow-500 transition-colors duration-300">
            {article.category || "BRAWNLY SELECTION"}
          </span>

          <motion.h2 
            className="text-[17px] md:text-[22px] leading-[1.2] font-black uppercase tracking-tighter text-black dark:text-white line-clamp-2 mb-2 transition-all duration-300"
            variants={{
              initial: { x: 0 },
              hover: { x: 5, color: "#facc15" }
            }}
            initial="initial"
            whileHover="hover"
          >
            {title}
          </motion.h2>

          <div className="flex items-center gap-2">
            <img
              src={getOptimizedImage(myAvatar, 40)}
              alt="Author"
              className="w-4 h-4 rounded-full grayscale group-hover:grayscale-0 group-hover:ring-1 group-hover:ring-yellow-400 transition-all duration-500"
            />
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              <span className="text-black dark:text-white group-hover:text-yellow-400/80 transition-colors">
                By {article.author || "Budi Putra Jaya"}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#00a354] group-hover:text-yellow-400" />
                {article.views ?? 0}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/[0.02] pointer-events-none transition-colors duration-500" />
    </article>
  );
}