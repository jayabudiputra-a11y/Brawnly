import { useState as _s, useEffect as _e } from "react";
import { motion as _m } from "framer-motion";
import TagFilter from "@/components/features/TagFilter";
import ArticleList from "@/components/features/ArticleList";
import { useArticles as _uAs } from "@/hooks/useArticles";
import { loadSnap as _lS, saveSnap as _sS, type SnapArticle as _SA } from "@/lib/storageSnap";
import { registerSW as _rSW } from "@/pwa/swRegister";
import { 
  warmupEnterpriseStorage as _wES, 
  saveArticlesSnap as _sAS, 
  setCookieHash as _sCH, 
  mirrorQuery as _mQ 
} from "@/lib/enterpriseStorage";
import { syncArticles as _sA } from "@/lib/supabaseSync";
import { detectBestFormat as _dBF } from "@/lib/imageFormat";

const Articles = () => {
  const [_sT, _ssT] = _s<string | null>(null);
  const [_sTm] = _s<string>("");
  const [_arts, _sArts] = _s<any[]>(() => _lS());

  const { data: _dF } = _uAs();

  _e(() => {
    _rSW();
    _wES();
    _dBF();
  }, []);

  _e(() => {
    if (_dF) {
      _sArts(_dF);
      
      const _sD: _SA[] = _dF.slice(0, 10).map((a: any) => ({
        title: a.title,
        slug: a.slug,
        image: a.featured_image_url
      }));
      
      _sS(_sD);
      _sAS(_dF);
      _sA(async () => _dF);

      _dF.forEach((a: any) => {
        if (a.slug) {
          _sCH(a.slug);
          _mQ({ type: "ARTICLE_SNAP", id: a.id, slug: a.slug, ts: Date.now() });
        }
      });
    }
  }, [_dF]);

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