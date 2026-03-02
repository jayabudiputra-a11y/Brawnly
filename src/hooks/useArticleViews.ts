import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/* ======================
    Obfuscated Keys
   ====================== */
const _0xview = [
    'article_view_counts',      
    'total_views',              
    'article_id',               
    'increment_article_views',  
    'article_id_input',         
    'public'                    
] as const;

// OPTIMASI: Pastikan parameter 'i' secara spesifik mengarah ke index dari array _0xview
// Ini akan menenangkan TypeScript yang rewel soal "implicitly has an 'any' type"
type ViewKeyIndex = 0 | 1 | 2 | 3 | 4 | 5;
const _v = (i: ViewKeyIndex) => _0xview[i];

/**
 * Fungsi untuk mencatat view baru
 */
async function trackPageView(articleId: string) { 
    if (!articleId) return;
    
    // Hanya panggil RPC untuk update angka di database.
    // Kita TIDAK meng-invalidate seluruh cache 'articles' di sini 
    // agar halaman Home tidak berat saat user sedang membaca.
    await supabase.rpc(_v(3), {
        [_v(4)]: articleId
    });
}

interface ArticleIdentifiers {
    id: string;
    slug: string;
    initialViews?: number; 
}

export const useArticleViews = (articleIds: ArticleIdentifiers) => {
    const { id: articleId, initialViews = 0 } = articleIds; 
    const queryClient = useQueryClient();

    /**
     * OPTIMASI: Jadikan useQuery sebagai satu-satunya sumber data (Single Source of Truth).
     * Tidak perlu lagi menggunakan useState (liveViewCount).
     */
    const { data: viewCount } = useQuery<number>({
        queryKey: ["viewCount", articleId],
        queryFn: async () => {
            if (!articleId) return 0;
            
            const { data: countsRow } = await supabase
                .from(_v(0))
                .select(_v(1))
                .eq(_v(2), articleId)
                .maybeSingle();

            // Pengecekan aman untuk TypeScript saat menggunakan dynamic key
            if (countsRow && typeof countsRow === 'object' && _v(1) in countsRow) {
                return (countsRow as Record<string, any>)[_v(1)] as number;
            }
            
            return initialViews; 
        },
        enabled: !!articleId,
        initialData: initialViews, 
        // Matikan auto-refetch karena kita sudah pakai WebSocket!
        staleTime: Infinity, 
    });

    /**
     * Sinkronisasi Real-time via Supabase Channel
     */
    useEffect(() => {
        if (!articleId) return;
        
        const channelName = `view_sync_${articleId}`; 

        const channel = supabase
            .channel(channelName) 
            .on(
                "postgres_changes",
                { 
                    event: "UPDATE", 
                    schema: _v(5), 
                    table: _v(0), 
                    filter: `${_v(2)}=eq.${articleId}` 
                }, 
                (payload) => {
                    const rec = (payload as any).new;
                    const totalViewsKey = _v(1);
                    const articleIdKey = _v(2);
                    
                    if (rec?.[totalViewsKey] && rec[articleIdKey] === articleId) { 
                        const newViews = rec[totalViewsKey];
                        queryClient.setQueryData(["viewCount", articleId], newViews);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [articleId, queryClient]);

    /**
     * Hitung View (Cukup 1x saat komponen dipasang)
     */
    const hasTrackedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!articleId || hasTrackedRef.current === String(articleId)) return;
        
        trackPageView(String(articleId)).catch(() => {}); 
        hasTrackedRef.current = String(articleId);
    }, [articleId]); 

    return { viewCount: viewCount ?? initialViews };
};