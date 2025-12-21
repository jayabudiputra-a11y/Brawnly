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
      currentArticles = currentArticles.filter((article: any) => {
        return (
          article.tags &&
          Array.isArray(article.tags) &&
          article.tags.some((tag: string) => tag.toLowerCase() === lowerCaseSelectedTag)
        )
      })
    }

    const safeSearchTerm = searchTerm || ""
    if (safeSearchTerm.trim() === "") {
      return currentArticles
    }

    const lowerCaseSearch = safeSearchTerm.toLowerCase()

    return currentArticles.filter((article: any) => {
      const articleTitle = article[`title_${lang}`] || article.title_en || article.title || ""
      const articleExcerpt =
        article[`excerpt_${lang}`] || article.excerpt_en || article.excerpt || ""

      const tagMatch =
        article.tags &&
        Array.isArray(article.tags) &&
        article.tags.some((tag: string) => tag.toLowerCase().includes(lowerCaseSearch))

      return (
        articleTitle.toLowerCase().includes(lowerCaseSearch) ||
        articleExcerpt.toLowerCase().includes(lowerCaseSearch) ||
        tagMatch
      )
    })
  }, [allArticles, selectedTag, searchTerm, lang])

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 mx-auto animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="mt-2 text-sm text-gray-600">{t("Loading articles...")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-center py-10 text-red-500 text-sm">
        {t("Failed to load data")}
      </p>
    )
  }

  if (filteredArticles.length === 0) {
    return (
      <p className="text-center py-10 text-gray-600 text-sm">
        {selectedTag || searchTerm.trim() !== ""
          ? t("No articles found matching the current filters.")
          : t("No articles available")}
      </p>
    )
  }

  return (
    <>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {filteredArticles.map((a: any) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      <ScrollToTopButton />
    </>
  )
}
