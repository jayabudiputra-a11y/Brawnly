import { useArticles } from '@/hooks/useArticles'
import ArticleCard from './ArticleCard'

interface ArticleListProps {
  selectedTag: string | null
}

const ArticleList = ({ selectedTag }: ArticleListProps) => {
  const { data: articles, isLoading, error } = useArticles(selectedTag)

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading articles...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-xl">
        <p className="text-red-600 text-xl font-bold">Gagal connect ke Supabase</p>
        <p className="text-gray-700 mt-2">Cek console (F12) → Network → pastikan .env benar</p>
      </div>
    )
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-gray-600">Belum ada artikel</p>
        <p className="text-gray-500 mt-2">Coba pilih tag lain atau insert artikel baru</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}

export default ArticleList
