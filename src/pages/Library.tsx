import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, BookOpen, ArrowLeft, Hexagon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useArticles } from "@/hooks/useArticles";
import { getOptimizedImage } from "@/lib/utils";

export default function Library() {
  const { data: allArticles, isLoading } = useArticles();
  const [savedArticles, setSavedArticles] = useState<any[]>([]);

  useEffect(() => {
    if (allArticles) {
      const saved = allArticles.filter((article: any) => {
        return localStorage.getItem(`brawnly_saved_${article.slug}`) === "true";
      });
      setSavedArticles(saved);
    }
  }, [allArticles]);

  const removeItem = (slug: string) => {
    localStorage.removeItem(`brawnly_saved_${slug}`);
    setSavedArticles((prev) => prev.filter((a) => a.slug !== slug));
  };

  const _x = {
    root: "min-h-screen bg-white dark:bg-[#0a0a0a] pt-32 pb-24 text-black dark:text-white",
    container: "max-w-[1320px] mx-auto px-5 md:px-10",
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
    card: "group relative bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-full",
    empty: "flex flex-col items-center justify-center py-32 text-center",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className={_x.root}>
      <div className={_x.container}>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 mb-6 transition-all">
              <ArrowLeft size={14} /> Back to Feed
            </Link>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">
              Library
            </h1>
            <p className="text-sm font-bold opacity-60 mt-4 tracking-wide">
              Your curated collection of Brawnly intelligence and features.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-black text-white dark:bg-white dark:text-black px-6 py-4 rounded-xl">
            <Bookmark size={20} fill="currentColor" />
            <span className="text-2xl font-black italic">{savedArticles.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Saved Items</span>
          </div>
        </div>

        {savedArticles.length === 0 ? (
          <div className={_x.empty}>
            <div className="mb-8 opacity-10">
              <Hexagon size={160} strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">The Archive is Empty</h2>
            <p className="text-neutral-500 max-w-xs mb-10 text-sm font-medium">You haven't saved any articles to your collection yet.</p>
            <Link to="/articles" className="px-10 py-4 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
              Browse Articles
            </Link>
          </div>
        ) : (
          <div className={_x.grid}>
            <AnimatePresence mode="popLayout">
              {savedArticles.map((article) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={article.id}
                  className={_x.card}
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={getOptimizedImage(article.featured_image_path_clean || "", 600)}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-3 block">
                      {article.category || "Collection"}
                    </span>
                    <h3 className="text-xl font-black uppercase leading-tight tracking-tight mb-4 group-hover:text-red-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
                      <Link
                        to={`/article/${article.slug}`}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:gap-4 transition-all"
                      >
                        <BookOpen size={14} /> Read Entry
                      </Link>
                      <button
                        onClick={() => removeItem(article.slug)}
                        className="text-neutral-400 hover:text-red-600 transition-colors"
                        title="Remove from collection"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}