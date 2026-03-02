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

// OPTIMASI: Gunakan tipe 'string' agar tidak terjadi bug saat query Supabase
const _r = (i: number) => _0xrepo[i] as string; 
const CACHE_KEY = "brawnly_lib_cache";

const _saveToSmartCache = (key: string, data: any) => {
  try {
    const payload = JSON.stringify(data);
    // Jika ukuran mendekati batas kuota browser, bersihkan cache lama
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
    } catch (err) { 
      console.warn("Brawnly Cache is completely full.");
    }
  }
};

// OPTIMASI: Helper aman untuk parsing JSON
const _getSmartCache = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
};

export const useArticles = (tag?: string | null, initialData?: any[]) => {
  return useQuery({
    queryKey: ['articles', tag],
    queryFn: async () => {
      const cachedData = _getSmartCache(CACHE_KEY);
      
      if (!navigator.onLine && cachedData) {
        return cachedData;
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

        const viewsMap = (rawViews ?? []).reduce((acc: Record<string, number>, viewRow: any) => {
          acc[viewRow[_r(3)]] = viewRow[_r(4)];
          return acc;
        }, {});

        const processedData = (rawArticles ?? []).map((article: any) => {
          const liveViews = viewsMap[article.id];
          
          // CLEANUP & OPTIMASI KEAMANAN STRING
          const rawPath = article.featured_image_url || article.featured_image || "";
          
          // Memastikan hanya mengambil URL yang valid (dimulai dengan http)
          const validUrls = rawPath
            .split(/[\r\n]+/)
            .map((url: string) => url.trim())
            .filter((url: string) => url.startsWith('http'));

          const processedCover = validUrls.length > 0 ? generateFullImageUrl(validUrls[0]) : null;

          return {
            ...article, 
            featured_image: processedCover, 
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
        if (cachedData) {
          console.warn("Jaringan tidak stabil, menggunakan data cache...");
          return cachedData;
        }
        throw error;
      }
    },
    initialData: initialData,
    staleTime: 1000 * 60 * 5, // 5 Menit
    gcTime: 1000 * 60 * 10, // OPTIMASI: 10 menit Garbage Collection agar memori browser tidak bocor
    refetchOnWindowFocus: false, // SANGAT PENTING: Matikan ini agar tidak re-render berat saat user pindah tab
    retry: 1
  });
};