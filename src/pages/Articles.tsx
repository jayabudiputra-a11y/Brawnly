import { useState } from 'react'
import TagFilter from '@/components/features/TagFilter'
import ArticleList from '@/components/features/ArticleList'

const Articles = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  return (
    <div className="space-y-12">
      <div>
        <h1
          className="
            mb-8 text-4xl font-serif font-bold uppercase tracking-wide
            text-transparent bg-clip-text
            [background-image:linear-gradient(90deg,#ff004c,#ff8a00,#ffe600,#00d26a,#00c2ff,#7a5cff,#ff2bd6)]
            [text-shadow:0_0_18px_rgba(255,255,255,0.14)]
          "
        >
          All Articles
        </h1>

        <TagFilter selected={selectedTag} onSelect={setSelectedTag} />
      </div>

      <ArticleList selectedTag={selectedTag} searchTerm={searchTerm} />
    </div>
  )
}

export default Articles
