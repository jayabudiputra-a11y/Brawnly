import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { generateFullImageUrl } from '@/utils/helpers'

// --- KONFIGURASI REPO ---
const _0xrepo = [
    'articles_denormalized', 
    'article_view_counts',    
    'tags',                  
    'article_id',           
    'total_views',           
    'published_at'           
] as const;

const _r = (i: number) => _0xrepo[i] as any;
const CACHE_KEY = "brawnly_lib_cache"; // Key yang sama dengan Library.tsx

// --- LOGIC: MEMORY MANAGEMENT (1/4 QUOTA) ---
const _saveToSmartCache = (key: string, data: any) => {
    try {
        const payload = JSON.stringify(data);
        
        // Batas aman 1.25 MB
        if (payload.length > 625000) {
            console.warn("[CACHE] Data too large, attempting cleanup...");
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith("brawnly_article_")) {
                    localStorage.removeItem(k);
                }
            }
        }

        localStorage.setItem(key, payload);
    } catch (e) {
        console.error("[CACHE] Quota exceeded. Purging old assets...");
        localStorage.clear(); // Extreme measure: clear all to save latest list
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (err) { /* Give up */ }
    }
};

export const useArticles = (tag?: string | null) => {
  return useQuery({
    queryKey: ['articles', tag],
    queryFn: async () => {
        const _cached = localStorage.getItem(CACHE_KEY);
        
        if (!navigator.onLine && _cached) {
            return JSON.parse(_cached);
        }

        // [2] FETCH NETWORK (Background Sync)
        try {
            let articleQuery = (supabase.from(_r(0)) as any).select('*'); 

            if (tag) {
                articleQuery = articleQuery.contains(_r(2), [tag]);
            }

            const { data: rawArticles, error: articleError } = await articleQuery;

            if (articleError) throw new Error('NODE_SYNC_FAILED');
            
            const { data: rawViews, error: viewsError } = await (supabase.from(_r(1)) as any)
                .select(`${_r(3)}, ${_r(4)}`);

            if (viewsError) throw new Error('METRIC_SYNC_FAILED');

            const viewsMap = (rawViews ?? []).reduce((acc: any, viewRow: any) => {
                acc[viewRow[_r(3)]] = viewRow[_r(4)];
                return acc;
            }, {} as Record<string, number>);

            let processedData = (rawArticles ?? []).map((article: any) => {
                const liveViews = viewsMap[article.id];
                
                let rawPath = article.featured_image;

                if (!rawPath) {
                     rawPath = article.featured_image_url_clean || article.featured_image_path_clean;
                }

                const processedCover = rawPath ? generateFullImageUrl(rawPath.split(/[\r\n]+/)[0]) : null;

                return {
                    ...article,
                    featured_image: processedCover, 
                    thumbnail_url: processedCover,
                    views: liveViews !== undefined ? liveViews : article.views, 
                };
            });
          
            processedData.sort((a: any, b: any) => {
                const _p = _r(5);
                const dateA = a[_p] ? new Date(a[_p]).getTime() : 0;
                const dateB = b[_p] ? new Date(b[_p]).getTime() : 0;
                return dateB - dateA;
            });

            _saveToSmartCache(CACHE_KEY, processedData);

            return processedData;

        } catch (error) {
            if (_cached) {
                if (import.meta.env.DEV) console.warn("[OFFLINE] Network failed, serving cached data.");
                return JSON.parse(_cached);
            }
            throw error;
        }
    },
    staleTime: 0, // Selalu coba fetch data baru (agar sync terjadi)
    refetchOnWindowFocus: true, 
    retry: 1
  })
}