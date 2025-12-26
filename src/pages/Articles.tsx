import { useState } from "react";
import { motion } from "framer-motion";
import TagFilter from "@/components/features/TagFilter";
import ArticleList from "@/components/features/ArticleList";

const Articles = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchTerm] = useState<string>("");

  return (
    <main className="bg-white dark:bg-black min-h-screen pb-20 text-black dark:text-white transition-colors duration-500">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-10"> {/* REVISI: pt-12 ke pt-10 */}
        
        {/* REVISI HEADER: 
            - mb-12 menjadi mb-6 untuk merapatkan ke arah list.
            - pb-8 menjadi pb-4 agar border tidak terlalu jauh dari TagFilter.
        */}
        <header className="mb-6 border-b border-gray-100 dark:border-neutral-900 pb-4 text-center md:text-left">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            /* REVISI: mb-6 menjadi mb-2 agar TagFilter lebih dekat dengan Judul */
            className="mb-2 text-[40px] md:text-[64px] font-black uppercase tracking-tighter bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent cursor-default select-none active:scale-95 transition-transform duration-150"
          >
            All Articles
          </motion.h1>

          <div className="flex justify-center md:justify-start">
            <TagFilter selected={selectedTag} onSelect={setSelectedTag} />
          </div>
        </header>

        {/* REVISI FEED CONTAINER:
            - Menambahkan -mt-2 jika diperlukan untuk kompensasi spasi internal dari ArticleList.
        */}
        <div className="article-feed-container active:opacity-90 transition-opacity duration-200">
          <ArticleList selectedTag={selectedTag} searchTerm={searchTerm} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 opacity-30 pointer-events-none" />
    </main>
  );
};

export default Articles;