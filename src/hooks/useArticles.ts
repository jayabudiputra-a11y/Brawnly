// D:\projects\fitapp-2025\src\hooks\useArticles.ts (SOLUSI FINAL: Dual Query + Client-Side Merge)

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useArticles = (tag?: string | null) => {
  return useQuery({
    queryKey: ['articles', tag],
    queryFn: async () => {
      
        // 1. Ambil semua artikel (data dasar) dari articles_denormalized
        let articleQuery = supabase
            .from('articles_denormalized') 
            // KRITIS: Hapus .select('*, article_view_counts(total_views)')
            .select('*'); 

        if (tag) {
            articleQuery = articleQuery.contains('tags', [tag]);
        }

        const { data: rawArticles, error: articleError } = await articleQuery;

        if (articleError) {
            console.error('Supabase error in useArticles (articles):', articleError);
            throw new Error('Gagal fetch data artikel: ' + articleError.message);
        }
        
        // 2. Ambil data views terbaru dari tabel view counts terpisah
        const { data: rawViews, error: viewsError } = await supabase
            .from('article_view_counts') 
            .select('article_id, total_views');

        if (viewsError) {
            console.error('Supabase error in useArticles (views):', viewsError);
            // Kita biarkan error views ini tidak memblokir loading jika article data berhasil
            // Namun, untuk debugging, kita tetap throw.
            throw new Error('Gagal fetch data view counts: ' + viewsError.message);
        }


        // 3. Proses dan Gabungkan Data (Client-Side Merge)
        const viewsMap = (rawViews ?? []).reduce((acc, viewRow: any) => {
            acc[viewRow.article_id] = viewRow.total_views;
            return acc;
        }, {} as Record<string, number>);

        let processedData = (rawArticles ?? []).map((article: any) => {
            // Ambil views terbaru dari map, fallback ke views lama jika tidak ada (meskipun views lama stale)
            const liveViews = viewsMap[article.id];
            
            return {
                ...article,
                views: liveViews !== undefined ? liveViews : article.views, 
            };
        });
      
        // 4. Lakukan Sorting di Sisi Klien (Client-Side Sorting)
        // Kita tidak bisa menggunakan order di query Supabase, jadi kita sort di JS.
        processedData.sort((a, b) => {
            // Mengatasi kasus `published_at` yang mungkin null atau undefined
            const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
            const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
            return dateB - dateA; // DESCENDING
        });

        return processedData;
    },
    // Tetapkan staleTime ke 0 (atau kecil) dan refetchOnWindowFocus agar cepat diperbarui
    staleTime: 0, 
    refetchOnWindowFocus: true, 
  })
}
