import { Helmet } from "react-helmet-async"
import masculineLogo from "@/assets/masculineLogo.svg"

interface ArticleStructuredData {
  title: string
  excerpt?: string
  featured_image_url?: string | null
  featured_image?: string | string[] | null
  published_at: string
  author?: string | null
}

interface StructuredDataProps {
  article: ArticleStructuredData
}

const StructuredData: React.FC<StructuredDataProps> = ({ article }) => {
  if (!article) return null

  const getFirstImage = () => {
    const rawImageSource = article.featured_image_url || article.featured_image
    if (!rawImageSource) return undefined
    
    if (Array.isArray(rawImageSource)) return rawImageSource[0]
    
    const urls = rawImageSource
      .split(/[\n\r|,|\s+]+/)
      .map(s => s.trim())
      .filter(Boolean)
      
    return urls.find(u => u.startsWith("http")) || undefined
  }

  const authorName = article.author?.trim()
    ? article.author.trim()
    : "Budi Putra Jaya"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: getFirstImage(),
    datePublished: article.published_at,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Brawnly",
      logo: {
        "@type": "ImageObject",
        url: masculineLogo,
      },
    },
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData, null, 2)}
      </script>
    </Helmet>
  )
}

export default StructuredData