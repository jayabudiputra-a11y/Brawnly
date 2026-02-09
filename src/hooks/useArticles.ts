import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { generateFullImageUrl } from '@/utils/helpers' // Import helper untuk memproses URL

/* ======================
    
   ====================== */
const _0xrepo = [
    'articles_denormalized', 
    'article_view_counts',    
    'tags',                  
    'article_id',           
    'total_views',           
    'published_at'           
] as const;

const _r = (i: number) => _0xrepo[i] as any;

export const useArticles = (tag?: string | null) => {
  return useQuery({
    queryKey: ['articles', tag],
    queryFn: async () => {
        let articleQuery = (supabase.from(_r(0)) as any).select('*'); 

        if (tag) {
            articleQuery = articleQuery.contains(_r(2), [tag]);
        }

        const { data: rawArticles, error: articleError } = await articleQuery;

        if (articleError) {
            if (import.meta.env.DEV) console.error('SYSTEM_ERR_0x01:', articleError);
            throw new Error('NODE_SYNC_FAILED');
        }
        
        const { data: rawViews, error: viewsError } = await (supabase.from(_r(1)) as any)
            .select(`${_r(3)}, ${_r(4)}`);

        if (viewsError) {
            if (import.meta.env.DEV) console.error('SYSTEM_ERR_0x02:', viewsError);
            throw new Error('METRIC_SYNC_FAILED');
        }

        const viewsMap = (rawViews ?? []).reduce((acc: any, viewRow: any) => {
            acc[viewRow[_r(3)]] = viewRow[_r(4)];
            return acc;
        }, {} as Record<string, number>);

        let processedData = (rawArticles ?? []).map((article: any) => {
            const liveViews = viewsMap[article.id];
            
            const rawPath = article.featured_image_url_clean || article.featured_image_path_clean;
            const processedCover = rawPath ? generateFullImageUrl(rawPath.split(/[\r\n]+/)[0]) : '';

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

        return processedData;
    },
    staleTime: 0, 
    refetchOnWindowFocus: true, 
  })
}