import { supabase } from "./supabase";
import type { Article, AuthUser, CommentWithUser } from "../types";
import { generateFullImageUrl } from "../utils/helpers";

const _0xdb = [
  "subscribers",   
  "articles",      
  "user_profiles", 
  "comments",      
  "email",         
  "published_at",  
  "slug",          
  "article_id",    
  "Brawnly_2026_Secure!@#$", 
  "reverse",       
  "split",         
  "join"           
] as const;

const _v = (i: number) => _0xdb[i];

const _INTERNAL_KEY = _v(8);

const handleSupabaseError = (error: any, context: string) => {
  if (import.meta.env.DEV) console.error(`[SYSTEM_FAULT_${context}]`, error);
  throw error;
};

export const subscribersApi = {
  insertIfNotExists: async (email: string, name?: string): Promise<void> => {
    if (!email) return;
    try {
      await (supabase.from(_v(0) as string) as any).upsert(
        [{ [_v(4) as string]: email.toLowerCase(), name: name ?? null }],
        { onConflict: _v(4) }
      );
    } catch (error) { /* Silent drop */ }
  },
};

export const articlesApi = {
  getAll: async (limit = 10, offset = 0): Promise<Article[]> => {
    const { data, error } = await (supabase.from(_v(1) as string) as any)
      .select("id, title, slug, thumbnail_url, published_at, category, views, description")
      .order(_v(5) as string, { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) handleSupabaseError(error, "0x1"); 
    
    return (data || []).map((art: any) => ({
      ...art,
      thumbnail_url: art.thumbnail_url ? generateFullImageUrl(art.thumbnail_url) : ""
    })) as Article[];
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const { data, error } = await (supabase.from(_v(1) as string) as any)
      .select("*")
      .eq(_v(6) as string, slug)
      .single();
    
    if (error || !data) handleSupabaseError(error, "0x2");
    
    void (async () => {
      await supabase.rpc("increment_views", { [_v(7) as string]: data.id });
    })();
    
    return {
      ...data,
      featured_image: data.featured_image ? generateFullImageUrl(data.featured_image) : ""
    } as Article;
  },
};

export const authApi = {
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          avatar_url: user.user_metadata?.avatar_url ? generateFullImageUrl(user.user_metadata.avatar_url) : null
        }
      } as unknown as AuthUser;
    }
    return null;
  },

  signUp: async ({ email, name }: { email: string; name: string }) => {
    if (!name || name.trim().length < 2) throw new Error("IDENT_SHORT");
    
    // Gunakan OTP (Magic Link) agar tidak bentrok dengan kebijakan password Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) handleSupabaseError(error, "0x3");
    
    // Catatan: user_profile di-update via AuthCallback.tsx setelah email diklik
    return data;
  },

  signInWithEmailOnly: async (email: string) => {
    // GANTI signInWithPassword ke signInWithOtp
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) handleSupabaseError(error, "0x4");
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) handleSupabaseError(error, "0x5");
  }
};

export const commentsApi = {
  getCommentsByArticle: async (articleId: string): Promise<CommentWithUser[]> => {
    const { data, error } = await (supabase.from(_v(3) as string) as any)
      .select(`
        id, content, created_at, user_id, parent_id,
        ${_v(2) as string} ( username, avatar_url )
      `)
      .eq(_v(7) as string, articleId)
      .order("created_at", { ascending: true });

    if (error) return [];
    
    return (data ?? []).map((c: any) => ({
      id: c.id,
      article_id: articleId,
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
      parent_id: c.parent_id,
      user_name: c[_v(2) as string]?.username ?? "Member",
      user_avatar_url: c[_v(2) as string]?.avatar_url 
        ? `${generateFullImageUrl(c[_v(2) as string].avatar_url)}?v=${new Date(c.created_at).getTime()}` 
        : null,
    }));
  },

  addComment: async (articleId: string, content: string, parentId: string | null = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("0xAUTH_REQ");
    
    const { error } = await (supabase.from(_v(3) as string) as any).insert({ 
      [_v(7) as string]: articleId, 
      user_id: user.id, 
      content: content.trim(),
      parent_id: parentId 
    });
    
    if (error) handleSupabaseError(error, "0x6");
  },
};