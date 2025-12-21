import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";


async function trackPageView(articleId: string, queryClient: any) { 
    if (!articleId) {
        console.warn("Tracking skipped: Article ID is empty or null.");
        return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    console.log(`DEBUG AUTH: User Session Active? ${!!session}. (RLS check context)`);
    
    console.log("DEBUG RPC: Sending Article ID for view increment:", articleId); 
    
    const { error } = await supabase.rpc('increment_article_views', {
        article_id_input: articleId
    });

    if (error) {
        if (error.code !== '42P01') {
            console.error("🔴 TRACKING FAILED - Supabase RPC Error:", { code: error.code, message: error.message });
        } else {
            console.warn("RPC increment_article_views is not yet defined in Supabase.");
        }
    } else {
        console.log(`🟢 View Tracked successfully for ID: ${articleId}`);
        
        queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
}
// --------------------

interface ArticleIdentifiers {
    id: string;
    slug: string;
    initialViews?: number; 
}

export const useArticleViews = (articleIds: ArticleIdentifiers) => {
    
    const { id: articleId, initialViews = 0 } = articleIds; 
    const queryClient = useQueryClient();
    
    console.log("DEBUG HOOK: Article ID received from ArticleDetail:", articleId);

    const [liveViewCount, setLiveViewCount] = useState<number>(initialViews);

    useEffect(() => {
        if (articleId && initialViews !== liveViewCount) {
             setLiveViewCount(initialViews);
        }
    }, [initialViews, articleId]); 


    const { data: fetchedViewCount } = useQuery<number>({
        queryKey: ["viewCount", articleId],
        queryFn: async () => {
            if (!articleId) return 0;
            
            const { data: countsRow } = await supabase
                .from("article_view_counts") 
                .select("total_views")
                .eq("article_id", articleId)
                .maybeSingle();

            return countsRow?.total_views ?? 0; 
        },
        enabled: !!articleId,
        placeholderData: initialViews, 
        refetchInterval: 4000, 
    });

    useEffect(() => {
        if (typeof fetchedViewCount === "number" && fetchedViewCount !== liveViewCount) {
            console.log(`DEBUG QUERY: Updating live view count from query to ${fetchedViewCount}`);
            setLiveViewCount(fetchedViewCount);
        }
    }, [fetchedViewCount, liveViewCount]); 
    
    
    useEffect(() => {
        if (!articleId) return;
        
        const channelName = `article_view_count_${articleId}`;

        const channel = supabase
            .channel(channelName) 
            .on(
                "postgres_changes",
                { 
                    event: "UPDATE", 
                    schema: "public", 
                    table: "article_view_counts", 
                    filter: `article_id=eq.${articleId}` 
                }, 
                (payload) => {
                    console.log("DEBUG REALTIME: Received view update payload", payload); 
                    
                    const rec = (payload as any).new;
                    
                    if (rec?.total_views && rec.article_id === articleId) { 
                        const newViews = rec.total_views;
                        console.log(`DEBUG REALTIME: Updating live view count to ${newViews}`);
                        setLiveViewCount(newViews); 
                        
                        queryClient.setQueryData(["viewCount", articleId], newViews);
                        
                        queryClient.invalidateQueries({ queryKey: ['articles'] });
                    }
                }
            )
            .subscribe((status) => {
                console.log("DEBUG REALTIME: Subscription Status:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [articleId, queryClient]);


    const hasTrackedRef = useRef<string | null>(null);
    useEffect(() => {
        if (!articleId) {
            console.warn("Tracking skipped: Article ID is empty.");
            return;
        }
        if (hasTrackedRef.current === String(articleId)) return;
        
        trackPageView(String(articleId), queryClient).catch(() => {}); 
        
        hasTrackedRef.current = String(articleId);
    }, [articleId, queryClient]); 

    return { viewCount: liveViewCount };
};