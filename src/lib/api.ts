import { supabase } from "./supabase";
import type { Article, AuthUser, CommentWithUser } from "../types";
import { generateFullImageUrl } from "../utils/helpers";

const _0xdb = [
  "subscribers",    // 0
  "articles",       // 1
  "user_profiles",  // 2
  "comments",       // 3
  "email",          // 4
  "published_at",   // 5
  "slug",           // 6
  "article_id",     // 7
  "Brawnly_2026_Secure!@#$", 
  "reverse",        
  "split",          
  "join",
  "songs"           // 12
] as const;

const _v = (i: number) => _0xdb[i];

const _INTERNAL_KEY = _v(8);

export interface Song {
  id: number;
  title: string;
  artist: string;
  url: string;
  thumbnail_url: string;
  created_at: string;
}

// --- SMART CACHE SYSTEM (1/4 Memory Allocation) ---
// Menyimpan data API ke localStorage dengan key unik
const setSmartCache = (key: string, data: any) => {
  try {
    const payload = JSON.stringify({
      ts: Date.now(),
      data: data
    });
    // Cek kuota memori, hapus cache lama jika penuh
    try {
      localStorage.setItem(`brawnly_api_${key}`, payload);
    } catch (e) {
      // Jika localStorage penuh, hapus cache artikel lama
      console.warn("Cache Full, cleaning up...");
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("brawnly_api_article_") && k !== `brawnly_api_${key}`) {
          localStorage.removeItem(k);
        }
      }
      localStorage.setItem(`brawnly_api_${key}`, payload);
    }
  } catch (err) {
    // Ignore if completely failed
  }
};

// Mengambil cache instan
const getSmartCache = (key: string) => {
  try {
    const cached = localStorage.getItem(`brawnly_api_${key}`);
    if (!cached) return null;
    const { data } = JSON.parse(cached);
    return data;
  } catch (e) {
    return null;
  }
};

const handleSupabaseError = (error: any, context: string) => {
  // Jika error network (offline), jangan throw error fatal, tapi return null biar UI bisa handle fallback
  if (error?.message?.includes('Failed to fetch') || !navigator.onLine) {
    return null; 
  }
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
    } catch (error) {}
  },
};

export const articlesApi = {
  getAll: async (limit = 10, offset = 0): Promise<Article[]> => {
    const cacheKey = `list_${limit}_${offset}`;
    
    // 1. Cek Offline/Cache dulu (INSTANT LOAD)
    const cachedData = getSmartCache(cacheKey);
    if (!navigator.onLine && cachedData) {
      return cachedData;
    }

    // 2. Fetch Network
    const { data, error } = await (supabase.from(_v(1) as string) as any)
      .select("id, title, slug, thumbnail_url, published_at, category, views, description, featured_image") // Tambah featured_image agar cache list punya gambar
      .order(_v(5) as string, { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      // Jika offline dan ada cache, kembalikan cache. Jika tidak, throw.
      if (cachedData) return cachedData;
      handleSupabaseError(error, "0x1");
      return [];
    }
    
    const processed = (data || []).map((art: any) => ({
      ...art,
      // Prioritaskan featured_image jika thumbnail kosong (logic fix)
      thumbnail_url: art.thumbnail_url 
        ? generateFullImageUrl(art.thumbnail_url) 
        : (art.featured_image ? generateFullImageUrl(art.featured_image) : "")
    })) as Article[];

    // 3. Update Cache (Background)
    setSmartCache(cacheKey, processed);

    return processed;
  },

  getBySlug: async (slug: string): Promise<Article> => {
    const cacheKey = `article_${slug}`;

    // 1. Cek Offline/Cache dulu
    const cachedData = getSmartCache(cacheKey);
    if (!navigator.onLine && cachedData) {
      return cachedData;
    }

    // 2. Fetch Network
    const { data, error } = await (supabase.from(_v(1) as string) as any)
      .select("*")
      .eq(_v(6) as string, slug)
      .single();
    
    if (error || !data) {
      if (cachedData) return cachedData; // Fallback ke cache jika network gagal
      handleSupabaseError(error, "0x2");
    }
    
    // Increment view async (jangan tunggu)
    if (navigator.onLine) {
      void (async () => {
        await supabase.rpc("increment_views", { [_v(7) as string]: data.id });
      })();
    }
    
    const processed = {
      ...data,
      featured_image: data.featured_image ? generateFullImageUrl(data.featured_image) : ""
    } as Article;

    // 3. Update Cache
    setSmartCache(cacheKey, processed);

    return processed;
  },
};

export const songsApi = {
  getAll: async (): Promise<Song[]> => {
    const cacheKey = 'all_songs';
    
    // 1. Cek Cache
    const cachedData = getSmartCache(cacheKey);
    if (!navigator.onLine && cachedData) {
      return cachedData;
    }

    const { data, error } = await (supabase.from(_v(12) as string) as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
       if (cachedData) return cachedData;
       handleSupabaseError(error, "0x7");
       return [];
    }

    const processed = data as Song[];
    setSmartCache(cacheKey, processed); // Simpan Cache

    return processed;
  }
};

export const authApi = {
  getCurrentUser: async (): Promise<AuthUser | null> => {
    // Auth session biasanya dihandle oleh Supabase Client (localStorage: sb-xxxx-auth-token)
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
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) handleSupabaseError(error, "0x3");
    
    return data;
  },

  signInWithEmailOnly: async (email: string) => {
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
    // Clear API caches on logout if needed
    // localStorage.clear(); // Optional: Hati-hati ini menghapus semua cache offline
  }
};

export const commentsApi = {
  getCommentsByArticle: async (articleId: string): Promise<CommentWithUser[]> => {
    const cacheKey = `comments_${articleId}`;
    
    // Komentar boleh stale (agak lama), cek cache dulu
    const cachedData = getSmartCache(cacheKey);
    if (!navigator.onLine && cachedData) return cachedData;

    const { data, error } = await (supabase.from(_v(3) as string) as any)
      .select(`
        id, content, created_at, user_id, parent_id,
        ${_v(2) as string} ( username, avatar_url )
      `)
      .eq(_v(7) as string, articleId)
      .order("created_at", { ascending: true });

    if (error) {
       if (cachedData) return cachedData;
       return [];
    }
    
    const processed = (data || []).map((c: any) => ({
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

    setSmartCache(cacheKey, processed);
    return processed;
  },

  addComment: async (articleId: string, content: string, parentId: string | null = null) => {
    if (!navigator.onLine) throw new Error("OFFLINE_COMMENT"); // Gak bisa komen kalau offline

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("0xAUTH_REQ");
    
    const { error } = await (supabase.from(_v(3) as string) as any).insert({ 
      [_v(7) as string]: articleId, 
      user_id: user.id, 
      content: content.trim(),
      parent_id: parentId 
    });
    
    if (error) handleSupabaseError(error, "0x6");
    
    localStorage.removeItem(`brawnly_api_comments_${articleId}`);
  },
};