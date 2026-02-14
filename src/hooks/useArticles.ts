import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { generateFullImageUrl } from '@/utils/helpers';

const _0xrepo = [
  'articles_denormalized',
  'article_view_counts',
  'tags',
  'article_id',
  'total_views',
  'published_at'
] as const;

const _r = (i: number) => _0xrepo[i] as any;
const CACHE_KEY = "brawnly_lib_cache";

const _saveToSmartCache = (key: string, data: any) => {
  try {
    const payload = JSON.stringify(data);
    if (payload.length > 625000) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("brawnly_article_")) {
          localStorage.removeItem(k);
        }
      }
    }
    localStorage.setItem(key, payload);
  } catch (e) {
    localStorage.clear(); 
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) { }
  }
};

export const useArticles = (tag?: string | null, initialData?: any[]) => {
  return useQuery({
    queryKey: ['articles', tag],
    queryFn: async () => {
      const _cached = localStorage.getItem(CACHE_KEY);
      
      if (!navigator.onLine && _cached) {
        return JSON.parse(_cached);
      }

      try {
        let articleQuery = supabase
          .from(_r(0))
          .select('*');

        if (tag) {
          articleQuery = articleQuery.contains(_r(2), [tag]);
        }

        const { data: rawArticles, error: articleError } = await articleQuery.order(_r(5), { ascending: false });

        if (articleError) {
          const { data: fallback, error: fallbackErr } = await supabase
            .from('articles')
            .select('*, author:profiles(username, avatar_url)')
            .eq('published', true)
            .order('published_at', { ascending: false });

          if (fallbackErr) throw fallbackErr;
          return fallback;
        }

        const { data: rawViews } = await supabase
          .from(_r(1))
          .select(`${_r(3)}, ${_r(4)}`);

        const viewsMap = (rawViews ?? []).reduce((acc: any, viewRow: any) => {
          acc[viewRow[_r(3)]] = viewRow[_r(4)];
          return acc;
        }, {} as Record<string, number>);

        const processedData = (rawArticles ?? []).map((article: any) => {
          const liveViews = viewsMap[article.id];
          
          // CLEANUP: Hanya ambil dari featured_image_url atau fallback ke featured_image lama
          // Menghapus featured_image_url_clean / path_clean karena sudah tidak dipakai
          let rawPath = article.featured_image_url || article.featured_image;
          
          const processedCover = rawPath ? generateFullImageUrl(rawPath.split(/[\r\n]+/)[0]) : null;

          return {
            ...article, // Penting: Ini meneruskan 'featured_image_url' asli ke ArticlePage/Detail
            featured_image: processedCover, // Ini untuk cover card (single image)
            thumbnail_url: processedCover,
            views: liveViews !== undefined ? liveViews : (article.views || 0),
            author: article.author || { 
              username: article.author_name || "Brawnly Editorial", 
              avatar_url: article.author_avatar || null 
            }
          };
        });

        _saveToSmartCache(CACHE_KEY, processedData);
        return processedData;

      } catch (error) {
        if (_cached) {
          return JSON.parse(_cached);
        }
        throw error;
      }
    },
    initialData: initialData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true, 
    retry: 1
  });
};