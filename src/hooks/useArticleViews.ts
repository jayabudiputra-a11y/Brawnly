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

type ViewKeyIndex = 0 | 1 | 2 | 3 | 4 | 5;
const _v = (i: ViewKeyIndex) => _0xview[i] as string;

/**
 * Fungsi untuk mencatat view baru
 */
async function trackPageView(articleId: string, queryClient: any) { 
    if (!articleId) return;
    
    // Panggil RPC untuk update angka di database.
    const { error } = await supabase.rpc(_v(3), {
        [_v(4)]: articleId
    });

    if (!error) {
        // PERBAIKAN: Secara spesifik hanya me-refresh cache angka view untuk artikel INI SAJA.
        // Angka akan langsung bertambah di layar tanpa perlu reload halaman!
        queryClient.invalidateQueries({ queryKey: ["viewCount", articleId] });
    }
}

interface ArticleIdentifiers {
    id: string;
    slug: string;
    initialViews?: number; 
}

export const useArticleViews = (articleIds: ArticleIdentifiers) => {
    const { id: articleId, initialViews = 0 } = articleIds; 
    const queryClient = useQueryClient();

    const { data: viewCount } = useQuery<number>({
        queryKey: ["viewCount", articleId],
        queryFn: async () => {
            if (!articleId) return 0;
            
            const { data: countsRow } = await supabase
                .from(_v(0))
                .select(_v(1))
                .eq(_v(2), articleId)
                .maybeSingle();

            // Pengecekan aman untuk TypeScript
            if (countsRow && typeof countsRow === 'object' && _v(1) in countsRow) {
                return (countsRow as Record<string, any>)[_v(1)] as number;
            }
            
            return initialViews; 
        },
        enabled: !!articleId,
        // JURUS RAHASIA: Selalu pakai initialViews dari halaman sebelumnya jika ada!
        initialData: initialViews > 0 ? initialViews : undefined,
        placeholderData: initialViews,
        // Ubah dari Infinity menjadi 1 menit, agar query bisa di-invalidate oleh trackPageView
        staleTime: 1000 * 60, 
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
                        // Update cache jika ada orang lain di ujung dunia yang membaca artikel yang sama
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
        
        trackPageView(String(articleId), queryClient).catch(() => {}); 
        hasTrackedRef.current = String(articleId);
    }, [articleId, queryClient]); 

    // Pastikan fallback ke initialViews jika query masih loading atau gagal
    return { viewCount: viewCount ?? initialViews };
};