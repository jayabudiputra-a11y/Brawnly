// src/pages/Articles.tsx
import { useState } from 'react'
import TagFilter from '@/components/features/TagFilter'
import ArticleList from '@/components/features/ArticleList'

const Articles = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  return (
    <div className="space-y-12">
      {/* Header + Filter */}
      <div>
        <h1 className="text-4xl font-bold mb-8">All Articles</h1>
        <TagFilter selected={selectedTag} onSelect={setSelectedTag} />
      </div>

      {/* Article list sesuai tag */}
      <ArticleList selectedTag={selectedTag} />
    </div>
  )
}

export default Articles
