import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { generateFullImageUrl } from "@/utils/helpers"; 

const _0xquery = ["articles_denormalized", "slug", "reverse", "split", "join"] as const;
const _q = (i: number) => _0xquery[i] as any;

export interface Article {
  id: string;
  slug: string;
  author?: string;
  published_at: string;
  // Updated: Prioritaskan kolom baru, fallback ke kolom lama jika migrasi belum selesai
  featured_image_url?: string;
  featured_image?: string;
  views?: number;
  tags?: string[];
  [key: string]: any; 
}

export const useArticleData = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: article, isLoading } = useQuery<Article | null>({ 
    queryKey: ["article", slug],
    queryFn: async () => {
      const { data } = await (supabase.from(_q(0) as string) as any)
        .select("*")
        .eq(_q(1) as string, slug!)
        .maybeSingle();
      return data as Article | null;
    },
    enabled: !!slug,
    retry: false,
  });
  
  const processedData = useMemo(() => {
    if (!article) return null;

    // Direct field access (No translation logic)
    const title = article.title || "Untitled Article";
    const excerpt = article.excerpt || "";
    const content = article.content || "";

    // UPDATED LOGIC: Mengambil data dari featured_image_url (sesuai DB baru)
    // Fallback ke featured_image jika kosong
    const rawPaths = (article.featured_image_url || article.featured_image || "");
    
    // Split berdasarkan baris baru (\r\n) atau spasi URL
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

    const paragraphs = content
      .replace(/\r\n/g, "\n")
      .replace(/\\n/g, "\n")
      .split("\n")
      .filter(Boolean);

    return {
      article, 
      title, 
      excerpt, 
      content, 
      paragraphs,
      coverImage, 
      midGallery, 
      bottomGallery,
      // Helper tambahan jika komponen butuh array raw
      allImages: allLines
    };
  }, [article]);

  return { processedData, isLoading, article };
};

export const LANGS = ["en"] as const;