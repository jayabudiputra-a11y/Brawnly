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

const _r = (i: number) => _0xrepo[i] as string;
const _CK = "brawnly_lib_cache_v2";

const _sC = (key: string, data: any) => {
  try {
    const payload = JSON.stringify(data);
    if (payload.length > 625000) {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("brawnly_article_")) localStorage.removeItem(k);
      }
    }
    localStorage.removeItem("brawnly_lib_cache");
    localStorage.setItem(key, payload);
  } catch {
    localStorage.clear();
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
  }
};

const _gC = (key: string) => {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch { return null; }
};

function _rFI(raw: string): string | null {
  if (!raw) return null;
  const lines = raw.split(/[\r\n]+/).map(l => l.trim()).filter(l => l.startsWith("http"));
  return lines[0] || null;
}

export const useArticles = (tag?: string | null, initialData?: any[]) => {
  return useQuery({
    queryKey: ['articles', tag],
    queryFn: async () => {
      const cachedData = _gC(_CK);

      if (!navigator.onLine && cachedData) return cachedData;

      try {
        let articleQuery = supabase
          .from(_r(0))
          .select('*')
          .not('published_at', 'is', null);

        if (tag) articleQuery = articleQuery.contains(_r(2), [tag]);

        const { data: rawArticles, error: articleError } = await articleQuery.order(_r(5), { ascending: false });

        if (articleError) {
          const { data: fallback, error: fallbackErr } = await supabase
            .from('articles')
            .select('*')
            .not('published_at', 'is', null)
            .order('published_at', { ascending: false });
          if (fallbackErr) throw fallbackErr;
          return fallback;
        }

        const { data: rawViews } = await supabase
          .from(_r(1))
          .select(`${_r(3)}, ${_r(4)}`);

        const viewsMap = (rawViews ?? []).reduce((acc: Record<string, number>, row: any) => {
          acc[row[_r(3)]] = row[_r(4)];
          return acc;
        }, {});

        const processedData = (rawArticles ?? []).map((article: any) => {
          const liveViews = viewsMap[article.id];

          const rawPath = article.featured_image_url || article.featured_image || "";
          const firstUrl = _rFI(rawPath);
          const processedCover = firstUrl ? generateFullImageUrl(firstUrl) : null;

          return {
            ...article,
            featured_image_url: processedCover,
            featured_image:     processedCover,
            thumbnail_url:      processedCover,
            views: liveViews !== undefined ? liveViews : (article.views || 0),
            author: article.author && typeof article.author === 'object'
              ? article.author
              : { username: article.author || "Brawnly Editorial", avatar_url: article.author_avatar || null },
          };
        });

        _sC(_CK, processedData);
        return processedData;

      } catch (error) {
        if (cachedData) return cachedData;
        throw error;
      }
    },
    initialData,
    staleTime:           1000 * 60 * 5,
    gcTime:              1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};