// src/pages/ArticlePage.tsx
import ArticleDetail from '../components/features/ArticleDetail';
import StructuredData from '../components/seo/StructuredData';
import MetaTags from '../components/seo/MetaTags';
import { useParams } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';

const ArticlePage = () => {
  const { slug } = useParams();
  const { data: articles } = useArticles();
  const article = articles?.find(a => a.slug === slug);

  if (!article) return <div>Not Found</div>;

  return (
    <div className="container mx-auto py-8">
      <MetaTags title={article.title} description={article.excerpt} url={window.location.href} image={article.featured_image} />
      <StructuredData article={article} />
      <ArticleDetail />
    </div>
  );
};

export default ArticlePage;