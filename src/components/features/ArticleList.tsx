import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useArticles } from "@/hooks/useArticles";
import ArticleCard from "./ArticleCard";
import ScrollToTopButton from "./ScrollToTopButton";
import { type LangCode } from "@/utils/helpers";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";

interface Props {
  selectedTag: string | null;
  searchTerm: string;
}

export default function ArticleList({ selectedTag, searchTerm }: Props) {
  const { i18n } = useTranslation();
  const lang = (i18n.language as LangCode) || "en";
  const { data: allArticles, isLoading, error } = useArticles(null);
  
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredArticles = useMemo(() => {
    if (!allArticles) return [];
    let currentArticles = allArticles;

    if (selectedTag) {
      const lowerCaseSelectedTag = selectedTag.toLowerCase();
      currentArticles = currentArticles.filter((article: any) =>
        article.tags?.some(
          (tag: string) => tag.toLowerCase() === lowerCaseSelectedTag
        )
      );
    }

    const safeSearchTerm = searchTerm || "";
    if (safeSearchTerm.trim() === "") return currentArticles;

    const lowerCaseSearch = safeSearchTerm.toLowerCase();
    return currentArticles.filter((article: any) => {
      const articleTitle = (
        article[`title_${lang}`] ||
        article.title_en ||
        article.title ||
        ""
      ).toLowerCase();
      return articleTitle.includes(lowerCaseSearch);
    });
  }, [allArticles, selectedTag, searchTerm, lang]);

  if (isLoading) {
    return (
      <div className="text-center py-12 bg-transparent" aria-live="polite">
        <div className="w-12 h-12 mx-auto mb-6 animate-spin rounded-full border-4 border-[#00a354] border-t-transparent shadow-[0_0_20px_rgba(0,163,84,0.2)]" />
        <p className="text-lg font-black uppercase tracking-widest animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
          Loading articles...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 text-[10px] font-black uppercase tracking-[.3em]">
          System error: failed to load articles
        </p>
      </div>
    );
  }

  if (filteredArticles.length === 0) {
    return (
      <div className="text-center py-16 bg-transparent">
        <p className="text-neutral-400 dark:text-neutral-600 text-[11px] font-black uppercase tracking-[.4em] mb-4">
          {selectedTag || searchTerm.trim() !== ""
            ? "No matching data found"
            : "The feed is empty"}
        </p>
        <div className="h-[1px] w-20 mx-auto bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent" />
      </div>
    );
  }

  return (
    <>
      <LayoutGroup id="article-lasso">
        <div 
          role="list"
          onMouseLeave={() => setHoveredIndex(null)}
          className="flex flex-col max-w-[900px] mx-auto w-full px-0 divide-y divide-gray-100 dark:divide-neutral-900 mt-0 relative"
        >
          {filteredArticles.map((a: any, index: number) => (
            <div 
              key={a.id} 
              role="listitem" 
              className="relative w-full group transition-all duration-300"
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    layoutId="highlight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35
                    }}
                    className="absolute inset-0 z-0 bg-yellow-400/5 dark:bg-yellow-400/10 border-y-2 border-yellow-400/50 dark:border-yellow-400"
                    style={{
                      boxShadow: "0 0 15px rgba(250, 204, 21, 0.2)",
                    }}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 py-1">
                <ArticleCard 
                  article={a} 
                  priority={index < 2} 
                />
              </div>
            </div>
          ))}
        </div>
      </LayoutGroup>
      <ScrollToTopButton />
    </>
  );
}