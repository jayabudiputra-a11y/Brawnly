import { useState } from 'react'
import TagFilter from '@/components/features/TagFilter'
import ArticleList from '@/components/features/ArticleList'

const Articles = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  return (

    <div className="space-y-12">
      
      <div>
        <h1 className="text-4xl font-bold mb-8">All Articles</h1>
        <TagFilter selected={selectedTag} onSelect={setSelectedTag} />
      </div>

      <ArticleList selectedTag={selectedTag} searchTerm={searchTerm} />
    </div>
  )
}

export default Articles
