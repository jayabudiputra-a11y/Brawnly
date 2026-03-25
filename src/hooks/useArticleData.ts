import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { generateFullImageUrl } from "@/utils/helpers";
import { autoIndex } from "@/lib/autoIndex";

const _SITE_URL = "https://www.brawnly.online";

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

function extractBodyContent(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const raw = bodyMatch ? bodyMatch[1] : html;
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .trim();
}

function isFullHtmlDocument(text: string): boolean {
  return /<!doctype\s+html/i.test(text) || /<html[\s>]/i.test(text);
}

function parseContentToParagraphs(content: string): string[] {
  if (!content) return [];

  if (isFullHtmlDocument(content)) {
    const body = extractBodyContent(content);
    if (!body) return [];
    return [body];
  }

  return content
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n")
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
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

      // ── Auto-index: submit article URL to IndexNow + ping sitemaps ──────────
      if (data?.slug) {
        const articleUrl = `${_SITE_URL}/article/${data.slug}`;
        setTimeout(() => {
          autoIndex(articleUrl).catch(() => {});
        }, 2500);
      }

      return data as Article | null;
    },
    enabled: !!slug,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const processedData = useMemo(() => {
    if (!article) return null;

    const title = article.title || "Untitled Article";
    const excerpt = article.excerpt || "";
    const content = article.content || "";

    const rawPaths = article.featured_image_url || article.featured_image || "";

    const allLines = rawPaths
      .split(/[\r\n]+/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 10 && l.startsWith("http"));

    let coverImage = "";
    if (allLines.length > 0) {
      coverImage = generateFullImageUrl(allLines[0]);
    }

    const galleryPaths = allLines.slice(1).map((path: string) => generateFullImageUrl(path));
    const midGallery = galleryPaths.slice(0, 5).join("\r\n");
    const bottomGallery = galleryPaths.slice(5).join("\r\n");

    const paragraphs = parseContentToParagraphs(content);

    return {
      article,
      title,
      excerpt,
      content,
      paragraphs,
      coverImage,
      midGallery,
      bottomGallery,
      allImages: allLines,
    };
  }, [article]);

  return { processedData, isLoading, error, article };
};

export const LANGS = ["en"] as const;