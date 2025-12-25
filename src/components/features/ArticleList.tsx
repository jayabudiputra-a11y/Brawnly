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

  // 1. STATE LOADING: Menggunakan Teks Pelangi agar selaras dengan loading di ArticleDetail
  if (isLoading) {
    return (
      <div className="text-center py-32 bg-transparent">
        <div className="w-12 h-12 mx-auto mb-6 animate-spin rounded-full border-4 border-[#00a354] border-t-transparent shadow-[0_0_20px_rgba(0,163,84,0.2)]" />
        <p className="text-lg font-black uppercase tracking-widest animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 bg-clip-text text-transparent">
          {t("loading....babe")}
        </p>
      </div>
    )
  }

  // 2. STATE ERROR
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-[10px] font-black uppercase tracking-[.3em]">
          {t("System Error: Failed to load articles")}
        </p>
      </div>
    )
  }

  // 3. STATE EMPTY
  if (filteredArticles.length === 0) {
    return (
      <div className="text-center py-32 bg-transparent">
        <p className="text-neutral-400 dark:text-neutral-600 text-[11px] font-black uppercase tracking-[.4em] mb-4">
          {selectedTag || searchTerm.trim() !== ""
            ? t("NO MATCHING DATA FOUND")
            : t("FEED IS EMPTY")}
        </p>
        <div className="h-[1px] w-20 mx-auto bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent" />
      </div>
    )
  }

  return (
    <>
      {/* 4. CONTAINER: Menggunakan gap dan padding yang pas untuk Billboard Style */}
      <div className="flex flex-col max-w-[900px] mx-auto w-full px-4 md:px-0 transition-all duration-500 divide-y divide-gray-100 dark:divide-neutral-900">
        {filteredArticles.map((a: any) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      <ScrollToTopButton />
    </>
  )
}