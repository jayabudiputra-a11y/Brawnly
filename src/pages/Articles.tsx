// D:\projects\fitapp-2025\src\pages\Articles.tsx
import { useState } from 'react'
import TagFilter from '@/components/features/TagFilter'
import ArticleList from '@/components/features/ArticleList'

const Articles = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchTerm] = useState<string>('')

  return (
    /* 1. Paksa background selalu hitam (bg-black) agar selaras dengan globals.css */
    <main className="bg-black min-h-screen pb-20 text-white">
      
      {/* Container dibuat lebih ramping (max-w-[1000px]) agar artikel tidak melebar */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-12">
        
        {/* HEADER SECTION */}
        <header className="mb-12 border-b border-neutral-900 pb-8 text-center md:text-left">
          <h1
            className="
              mb-6 text-[32px] md:text-[48px] font-black uppercase tracking-tighter
              /* Efek Pelangi Billboard pada teks */
              bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 
              bg-clip-text text-transparent
            "
          >
            All Articles
          </h1>

          {/* Tag Filter - Memastikan navigasi kategori tetap bersih di atas background hitam */}
          <div className="flex justify-center md:justify-start">
            <TagFilter selected={selectedTag} onSelect={setSelectedTag} />
          </div>
        </header>

        {/* ARTICLE LIST 
            Interaksi warna (grayscale ke berwarna) saat disentuh di HP 
            akan ditangani otomatis oleh globals.css melalui class di dalam ArticleList.
        */}
        <div className="article-feed-container">
          <ArticleList selectedTag={selectedTag} searchTerm={searchTerm} />
        </div>

      </div>
    </main>
  )
}

export default Articles