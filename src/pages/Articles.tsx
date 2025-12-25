import { useState } from 'react'
import { motion } from 'framer-motion' // Pastikan framer-motion terinstal, jika tidak pakai div biasa
import TagFilter from '@/components/features/TagFilter'
import ArticleList from '@/components/features/ArticleList'

const Articles = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchTerm] = useState<string>('')

  return (
    /* 1. Background Dinamis: Putih di Light Mode, Hitam di Dark Mode */
    <main className="bg-white dark:bg-black min-h-screen pb-20 text-black dark:text-white transition-colors duration-500">
      
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-12">
        
        {/* HEADER SECTION */}
        <header className="mb-12 border-b border-gray-100 dark:border-neutral-900 pb-8 text-center md:text-left">
          
          {/* Animasi Kembang saat Muncul & Pelangi Billboard */}
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="
              mb-6 text-[40px] md:text-[64px] font-black uppercase tracking-tighter
              bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 
              bg-clip-text text-transparent
              cursor-default select-none
              active:scale-95 transition-transform duration-150
            "
          >
            All Articles
          </motion.h1>

          {/* Tag Filter - Kotak-kotak kategori dengan efek interaksi */}
          <div className="flex justify-center md:justify-start">
            <TagFilter selected={selectedTag} onSelect={setSelectedTag} />
          </div>
        </header>

        {/* ARTICLE FEED CONTAINER 
            Memberikan efek "Ripple" sederhana saat area list ditekan
        */}
        <div className="article-feed-container active:opacity-90 transition-opacity duration-200">
          <ArticleList selectedTag={selectedTag} searchTerm={searchTerm} />
        </div>

      </div>

      {/* Tambahan Dekorasi Pelangi di bawah Header agar selaras dengan ArticleDetail */}
      <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 opacity-30 pointer-events-none" />
    </main>
  )
}

export default Articles