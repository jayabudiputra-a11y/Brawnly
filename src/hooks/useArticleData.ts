import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { generateFullImageUrl } from "@/utils/helpers"; 

const _0xquery = ["articles_denormalized", "slug", "reverse", "split", "join"] as const;
const _q = (i: number) => _0xquery[i] as string;

export interface Article {
  id: string;
  slug: string;
  title?: string;
  excerpt?: string;
  content?: string;
  author?: string;
  published_at: string;
  featured_image_url?: string;
  featured_image?: string;
  views?: number;
  tags?: string[];
  [key: string]: any; 
}

export const useArticleData = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: article, isLoading, error } = useQuery<Article | null>({ 
    queryKey: ["article", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from(_q(0))
        .select("*")
        .eq(_q(1), slug)
        .maybeSingle();
        
      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }
      return data as Article | null;
    },
    enabled: !!slug,
    retry: 1, // Hanya coba 1x jika gagal agar tidak loading terus menerus
    staleTime: 5 * 60 * 1000, // OPTIMASI SPEED: Cache data selama 5 menit
    gcTime: 10 * 60 * 1000, // Simpan di memori sampah selama 10 menit
  });
  
  const processedData = useMemo(() => {
    if (!article) return null;

    const title = article.title || "Untitled Article";
    const excerpt = article.excerpt || "";
    const content = article.content || "";

    // Prioritaskan kolom baru, fallback ke kolom lama
    const rawPaths = (article.featured_image_url || article.featured_image || "");
    
    // Split berdasarkan baris baru (\r\n) dan bersihkan URL
    const allLines = rawPaths
      .split(/[\r\n]+/) 
      .map(l => l.trim())
      .filter(l => l.length > 10 && l.startsWith('http')); 

    let coverImage = "";
    if (allLines.length > 0) {
      coverImage = generateFullImageUrl(allLines[0]);
    }
    
    const galleryPaths = allLines.slice(1).map(path => generateFullImageUrl(path));
    const midGallery = galleryPaths.slice(0, 5).join('\r\n'); 
    const bottomGallery = galleryPaths.slice(5).join('\r\n'); 

    // Perbaikan pemotongan paragraf yang lebih bersih
    const paragraphs = content
      .replace(/\r\n/g, "\n")
      .replace(/\\n/g, "\n")
      .split("\n")
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return {
      article, 
      title, 
      excerpt, 
      content, 
      paragraphs,
      coverImage, 
      midGallery, 
      bottomGallery,
      allImages: allLines
    };
  }, [article]);

  return { processedData, isLoading, error, article };
};

export const LANGS = ["en"] as const;