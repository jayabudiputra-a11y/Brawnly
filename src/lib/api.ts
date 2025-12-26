import { supabase } from "./supabase";
import type { Article, AuthUser, CommentWithUser } from "../types";

const INTERNAL_PWD = "FitApp_2025_Secure!@#$";

const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase Error [${context}]`, error);
  throw error;
};

export const subscribersApi = {
  insertIfNotExists: async (email: string, name?: string): Promise<void> => {
    if (!email) return;
    try {
      await supabase.from("subscribers").upsert(
        [{ email: email.toLowerCase(), name: name ?? null }],
        { onConflict: 'email' }
      );
    } catch (error) {
      console.warn("subscribersApi catch:", error);
    }
  },
};

export const articlesApi = {
  getAll: async (limit = 10, offset = 0): Promise<Article[]> => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) handleSupabaseError(error, "articlesApi.getAll");
    return data ?? [];
  },
  getBySlug: async (slug: string): Promise<Article> => {
    const { data, error } = await supabase.from("articles").select("*").eq("slug", slug).single();
    if (error || !data) handleSupabaseError(error, "articlesApi.getBySlug");
    void (async () => {
      await supabase.rpc("increment_views", { article_id: data.id });
    })();
    return data;
  },
};

export const authApi = {
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return (user as AuthUser) ?? null;
  },
  signUp: async ({ email, name }: { email: string; name: string }) => {
    if (!name || name.trim().length < 2) throw new Error("Nama wajib diisi");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: INTERNAL_PWD,
      options: { data: { full_name: name.trim() } },
    });
    if (error) handleSupabaseError(error, "authApi.signUp");
    if (data.user) {
      await subscribersApi.insertIfNotExists(data.user.email!, name.trim());
      await supabase.from("user_profiles").upsert({
        id: data.user.id,
        username: name.trim(),
        avatar_url: null
      });
    }
    return data;
  },
  signInWithEmailOnly: async (email: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: INTERNAL_PWD,
    });
    if (error) handleSupabaseError(error, "authApi.signInWithEmailOnly");
    return data;
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) handleSupabaseError(error, "authApi.signOut");
  }
};

export const commentsApi = {
  getCommentsByArticle: async (articleId: string): Promise<CommentWithUser[]> => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        user_id,
        parent_id,
        user_profiles (
          username,
          avatar_url
        )
      `)
      .eq("article_id", articleId)
      .order("created_at", { ascending: true }); // Ascending agar alur reply logis (atas ke bawah)

    if (error) {
      console.error("Fetch Comments Error:", error);
      return [];
    }
    
    return (data ?? []).map((c: any) => ({
      id: c.id,
      article_id: articleId,
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
      parent_id: c.parent_id,
      user_name: c.user_profiles?.username ?? "Member Fitapp",
      user_avatar_url: c.user_profiles?.avatar_url ?? null,
    }));
  },

  addComment: async (articleId: string, content: string, parentId: string | null = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Silakan login terlebih dahulu untuk berkomentar");
    
    const { error } = await supabase.from("comments").insert({ 
      article_id: articleId, 
      user_id: user.id, 
      content: content.trim(),
      parent_id: parentId 
    });
    
    if (error) handleSupabaseError(error, "commentsApi.addComment");
  },
};