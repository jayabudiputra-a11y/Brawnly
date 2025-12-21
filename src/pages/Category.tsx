import { useParams } from 'react-router-dom'
import ArticleList from '@/components/features/ArticleList'

const Category = () => {
  const { slug } = useParams<{ slug: string }>()
  const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Category'

  return (
    <div className="space-y-12">
      <h1 className="text-4xl font-bold mb-8">{categoryName}</h1>
      <ArticleList 
        selectedTag={slug ?? null} 
        searchTerm=""
      />
    </div>
  )
}

export default Category
