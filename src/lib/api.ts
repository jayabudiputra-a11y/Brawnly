import { supabase } from "./supabase";
import type { Article, AuthUser, CommentWithUser } from "../types";

/**
 * PASSWORD INTERNAL STATIS
 * Digunakan untuk strategi passwordless-like flow agar lolos validasi Supabase.
 */
const INTERNAL_PWD = "FitApp_2025_Secure!@#$";

const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase Error [${context}]`, error);
  throw error;
};

/* ============================================================
   1. SUBSCRIBERS API
   ============================================================ */
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

/* ============================================================
   2. ARTICLES API
   ============================================================ */
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

/* ============================================================
   3. AUTH API
   ============================================================ */
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
      // Pastikan profil dibuat agar join komentar tidak kosong
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

/* ============================================================
   4. COMMENTS API (REVISI FINAL)
   ============================================================ */
export const commentsApi = {
  getCommentsByArticle: async (articleId: string): Promise<CommentWithUser[]> => {
    console.log("Fetching comments for:", articleId);

    // Menggunakan join standar (tanpa tanda seru) agar lebih fleksibel terhadap schema
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        user_id,
        user_profiles (
          username,
          avatar_url
        )
      `)
      .eq("article_id", articleId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Comments Error:", error);
      return [];
    }
    
    console.log("Comments data received:", data);

    return (data ?? []).map((c: any) => ({
      id: c.id,
      article_id: articleId,
      content: c.content,
      created_at: c.created_at,
      user_id: c.user_id,
      // Ambil username dari profil hasil join, fallback ke 'Member Fitapp'
      user_name: c.user_profiles?.username ?? "Member Fitapp",
      user_avatar_url: c.user_profiles?.avatar_url ?? null,
    }));
  },

  addComment: async (articleId: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Silakan login terlebih dahulu untuk berkomentar");
    
    const { error } = await supabase.from("comments").insert({ 
      article_id: articleId, 
      user_id: user.id, 
      content: content.trim() 
    });
    
    if (error) handleSupabaseError(error, "commentsApi.addComment");
  },
};