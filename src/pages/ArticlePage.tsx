import React from 'react';
import { useParams } from 'react-router-dom';
import ArticleDetail from '../components/features/ArticleDetail';
import StructuredData from '../components/seo/StructuredData';
import MetaTags from '../components/seo/MetaTags';
import { useArticles } from '../hooks/useArticles';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: _d, isLoading: _l } = useArticles();

  const _s = _d?.find((item: any) => item.slug === slug);

  if (_l) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="w-10 h-10 border-t-2 border-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!_s) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div className="opacity-5 text-[120px] font-black italic select-none">VOID</div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] -mt-10 text-neutral-400">
          Sequence Integrity Compromised
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-8 text-[11px] font-black uppercase border-b-2 border-black dark:border-white pb-1"
        >
          Re-establish Feed
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-all">
      <MetaTags 
        title={`${_s.title} | Brawnly Online`} 
        description={_s.excerpt} 
        url={window.location.href} 
        image={_s.featured_image_url_clean || _s.featured_image} 
      />
      
      <StructuredData article={_s} />
      
      <div className="w-full">
         <ArticleDetail />
      </div>
    </main>
  );
};

export default ArticlePage;