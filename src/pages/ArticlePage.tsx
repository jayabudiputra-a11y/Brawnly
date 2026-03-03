import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ArticleDetail from '../components/features/ArticleDetail';
import StructuredData from '../components/seo/StructuredData';
import MetaTags from '../components/seo/MetaTags';
import { useArticles } from '../hooks/useArticles';
import { registerSW } from '../pwa/swRegister';
import { 
  setCookieHash, 
  mirrorQuery, 
  warmupEnterpriseStorage 
} from '../lib/enterpriseStorage';
import { detectBestFormat } from '../lib/imageFormat';

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: _d, isLoading: _l } = useArticles();

  useEffect(() => {
    registerSW();
    warmupEnterpriseStorage();
    detectBestFormat();
  }, []);

  useEffect(() => {
    if (slug) {
      setCookieHash(slug);
      mirrorQuery({
        type: "ARTICLE_VIEW",
        slug: slug,
        timestamp: Date.now()
      });
    }
  }, [slug]);

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

  const metaImage = _s.featured_image_url 
    ? _s.featured_image_url.split(/[\r\n]+/)[0] 
    : (_s.featured_image || "");

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-all">
      <MetaTags 
        title={`${_s.title} | Brawnly Online`} 
        description={_s.excerpt} 
        url={window.location.href} 
        image={metaImage} 
      />
      
      <StructuredData article={_s} />
      
      {/* ===== SEO HIDDEN CONTENT - OPTIMIZED KEYWORDS ===== */}
      <div className="hidden" aria-hidden="true">
        {/* Primary Keywords */}
        <span>Brawnly Online article {_s.title} {_s.excerpt}</span>
        
        {/* Article Metadata for Crawlers */}
        <div itemScope itemType="https://schema.org/Article">
          <meta itemProp="headline" content={_s.title} />
          <meta itemProp="description" content={_s.excerpt} />
          <meta itemProp="datePublished" content={_s.published_at || new Date().toISOString()} />
          <meta itemProp="author" content="Brawnly Editorial Team" />
          <meta itemProp="wordCount" content={_s.content?.split(/\s+/).length || "0"} />
        </div>
        
        {/* Topic Cluster - Supporting Long-tail Keywords */}
        <ul>
          <li>Fitness article {_s.category || "general"}</li>
          <li>Workout guide and tips</li>
          <li>Brawnly exclusive content</li>
          <li>Expert fitness insights</li>
          <li>Training methodology</li>
          <li>Nutrition advice from Brawnly</li>
        </ul>
        
        {/* Breadcrumb Trail for SEO */}
        <div itemScope itemType="https://schema.org/BreadcrumbList">
          <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content="1" />
            <meta itemProp="name" content="Home" />
            <meta itemProp="item" content="https://brawnly.online" />
          </div>
          <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content="2" />
            <meta itemProp="name" content="Articles" />
            <meta itemProp="item" content="https://brawnly.online/articles" />
          </div>
          <div itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content="3" />
            <meta itemProp="name" content={_s.title} />
            <meta itemProp="item" content={`https://brawnly.online/article/${slug}`} />
          </div>
        </div>
        
        {/* Reading Time Estimation */}
        <meta name="twitter:label1" content="Reading time" />
        <meta name="twitter:data1" content={`${Math.ceil((_s.content?.split(/\s+/).length || 0) / 200)} minutes`} />
        
        {/* Category & Tags */}
        <meta name="article:section" content={_s.category || "Fitness"} />
        {_s.tags?.map((tag: string, idx: number) => (
          <meta key={idx} name="article:tag" content={tag} />
        ))}
      </div>
      
      {/* ===== INVISIBLE SEO TEXT BLOCK ===== */}
      <div style={{ display: 'none' }}>
        {/* Extended Description */}
        <p>
          Brawnly Online presents "{_s.title}" – {_s.excerpt} 
          This comprehensive guide covers {_s.category || "fitness"} techniques, 
          expert recommendations, and practical insights for your fitness journey. 
          Read more exclusive content at Brawnly.online.
        </p>
        
        {/* Keywords Density */}
        <span>Brawnly, fitness, workout, exercise, health, {_s.title}, {_s.category}, training, muscle, strength, nutrition, wellness, gym, bodybuilding, recovery, supplements, motivation, fitness tips, workout plans, Brawnly Online, exclusive content, expert advice</span>
      </div>
      
      <div className="w-full">
         <ArticleDetail />
      </div>
    </main>
  );
};

export default ArticlePage;