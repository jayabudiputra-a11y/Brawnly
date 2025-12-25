import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { useArticles } from "@/hooks/useArticles"
import ArticleCard from "./ArticleCard"
import ScrollToTopButton from "./ScrollToTopButton"
import { type LangCode } from "@/utils/helpers"

interface Props {
  selectedTag: string | null
  searchTerm: string
}

export default function ArticleList({ selectedTag, searchTerm }: Props) {
  const { i18n, t } = useTranslation()
  const lang = (i18n.language as LangCode) || "en"
  const { data: allArticles, isLoading, error } = useArticles(null)

  const filteredArticles = useMemo(() => {
    if (!allArticles) return []
    let currentArticles = allArticles

    // ... (logic filtering tetap sama seperti punya Anda)
    if (selectedTag) {
      const lowerCaseSelectedTag = selectedTag.toLowerCase()
      currentArticles = currentArticles.filter((article: any) => 
        article.tags?.some((tag: string) => tag.toLowerCase() === lowerCaseSelectedTag)
      )
    }

    const safeSearchTerm = searchTerm || ""
    if (safeSearchTerm.trim() === "") return currentArticles

    const lowerCaseSearch = safeSearchTerm.toLowerCase()
    return currentArticles.filter((article: any) => {
      const articleTitle = (article[`title_${lang}`] || article.title_en || article.title || "").toLowerCase()
      return articleTitle.includes(lowerCaseSearch)
    })
  }, [allArticles, selectedTag, searchTerm, lang])

  // STATE LOADING
  if (isLoading) {
    return (
      <div className="text-center py-20">
        {/* Spinner Emerald yang menyala di Dark/Light */}
        <div className="w-10 h-10 mx-auto animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="mt-4 text-[11px] text-gray-400 dark:text-neutral-500 font-black uppercase tracking-[.2em]">
          {t("Loading articles...")}
        </p>
      </div>
    )
  }

  // STATE ERROR
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-xs font-bold uppercase tracking-widest">
          {t("Failed to load data")}
        </p>
      </div>
    )
  }

  // STATE EMPTY
  if (filteredArticles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 dark:text-neutral-600 text-xs font-bold uppercase tracking-widest">
          {selectedTag || searchTerm.trim() !== ""
            ? t("No results found")
            : t("No articles available")}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col max-w-[900px] mx-auto w-full px-2 transition-all duration-500">
        {filteredArticles.map((a: any) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      <ScrollToTopButton />
    </>
  )
}