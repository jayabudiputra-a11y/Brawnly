import { useState as _s } from "react";
import { motion as _m } from "framer-motion";
import TagFilter from "@/components/features/TagFilter";
import ArticleList from "@/components/features/ArticleList";

const Articles = () => {
  const [_sT, _ssT] = _s<string | null>(null);
  const [_sTm] = _s<string>("");

  const _jLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Brawnly Editorial - All Articles",
    "description": "Explore the latest smart fitness, wellness tracker intelligence, and sonic waves archived for Brawnly users.",
    "url": "https://brawnly.online/articles",
    "author": {
      "@type": "Person",
      "name": "Budi Putra Jaya"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Brawnly"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": []
    }
  };

  return (
    <main className="bg-white dark:bg-black min-h-screen pb-20 text-black dark:text-white transition-colors duration-500">
      <script type="application/ld+json">{JSON.stringify(_jLd)}</script>
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-10">
        <header className="mb-6 border-b border-gray-100 dark:border-neutral-900 pb-4 text-center md:text-left">
          <_m.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="mb-2 text-[40px] md:text-[64px] font-black uppercase tracking-tighter bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 bg-clip-text text-transparent cursor-default select-none active:scale-95 transition-transform duration-150"
          >
            All Articles
          </_m.h1>
          <div className="flex justify-center md:justify-start">
            <TagFilter selected={_sT} onSelect={_ssT} />
          </div>
        </header>
        <div className="article-feed-container active:opacity-90 transition-opacity duration-200">
          <ArticleList selectedTag={_sT} searchTerm={_sTm} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-600 opacity-30 pointer-events-none" />
    </main>
  );
};

export default Articles;