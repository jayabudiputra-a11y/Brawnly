import React from "react"
import { Helmet } from "react-helmet-async"
import masculineLogo from "@/assets/masculineLogo.svg"
import { resolveAuthorName } from "@/components/features/ArticleCard"

interface ArticleStructuredData {
  title: string
  excerpt?: string
  featured_image_url?: string | null
  featured_image?: string | string[] | null
  published_at: string
  // ✅ Widened from `string | null` to `any` — Supabase may return an object
  //    shape like { username: string; name?: string } from a joined query.
  author?: any
  author_name?: string | null
  url?: string
}

interface StructuredDataProps {
  article: ArticleStructuredData
}

const StructuredData: React.FC<StructuredDataProps> = ({ article }) => {
  if (!article) return null

  const baseUrl = "https://brawnly.online"

  const getFirstImage = () => {
    const rawImageSource = article.featured_image_url || article.featured_image
    if (!rawImageSource) return undefined
    
    if (Array.isArray(rawImageSource)) return rawImageSource[0]
    
    const urls = String(rawImageSource)
      .split(/[\n\r|,|\s+]+/)
      .map(s => s.trim())
      .filter(Boolean)
      
    const firstUrl = urls.find(u => u.startsWith("http"))
    return firstUrl || undefined
  }

  // ✅ Use the shared helper — handles string | object | null without crashing
  const authorName = resolveAuthorName(article, "Budi Putra Jaya")

  const articleUrl = article.url || baseUrl
  const imageUrl = getFirstImage()

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    headline: article.title,
    description: article.excerpt,
    image: imageUrl,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: {
      "@type": "Person",
      name: authorName,
      url: baseUrl
    },
    publisher: {
      "@type": "Organization",
      name: "Brawnly",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}${masculineLogo}`,
      },
    },
  }

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Trik SEO & LLM SPA:
        Microdata HTML mentah yang disembunyikan secara visual. 
        Bot AI dan Crawler sederhana yang mengabaikan <script> JSON-LD 
        PASTI akan membaca data ini karena menyatu dengan struktur DOM HTML.
      */}
      <div className="sr-only" itemScope itemType="https://schema.org/Article">
        <h2 itemProp="headline">{article.title}</h2>
        {article.excerpt && <p itemProp="description">{article.excerpt}</p>}
        
        <span itemProp="author" itemScope itemType="https://schema.org/Person">
          Ditulis oleh <span itemProp="name">{authorName}</span>
        </span>
        
        <time itemProp="datePublished" dateTime={article.published_at}>
          {new Date(article.published_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>
        
        {imageUrl && <link itemProp="image" href={imageUrl} />}
      </div>
    </>
  )
}

export default StructuredData