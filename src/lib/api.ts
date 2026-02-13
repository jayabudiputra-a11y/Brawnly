import { supabase as _sb } from "./supabase";
import type { Article as _At, AuthUser as _Au, CommentWithUser as _Cu } from "../types";

const _0xD = [
  "subscribers",
  "articles_denormalized",
  "user_profiles",
  "comments",
  "email",
  "published_at",
  "slug",
  "article_id",
  "increment_views",
  "songs",
  "created_at",
] as const;

const _v = (_i: number) => _0xD[_i];
const _CB = "https://res.cloudinary.com/dtkiwn8i4/image/upload/";

export interface Song {
  id: number;
  title: string;
  artist: string;
  url: string;
  thumbnail_url: string;
  created_at: string;
}

/**
 * REVISI: Logika Media URL yang cerdas. 
 * Tidak akan menambahkan prefix jika URL sudah valid (HTTP/Blob).
 */
const _oM = (_u?: string | null): string => {
  if (!_u) return "";
  // Jika sudah URL lengkap (http) atau blob lokal, jangan tambahkan prefix
  if (_u.startsWith("http") || _u.startsWith("blob:") || _u.startsWith("data:")) return _u;
  // Hanya tambahkan Cloudinary jika itu hanya ID/Path
  return _CB + _u;
};

const _sC = (_k: string, _d: any) => {
  try {
    const _pL = JSON.stringify({ ts: Date.now(), data: _d });
    // Hindari caching jika data mengandung error string tertentu
    if (_pL.includes('mmwxnbhyhu6yewzmy6d0') || _pL.includes('ž')) return;
    localStorage.setItem(`brawnly_api_${_k}`, _pL);
  } catch {
    Object.keys(localStorage).filter(_x => _x.startsWith("brawnly_api_")).forEach(_x => localStorage.removeItem(_x));
  }
};

const _gC = (_k: string) => {
  try {
    const _r = localStorage.getItem(`brawnly_api_${_k}`);
    if (!_r) return null;
    const _parsed = JSON.parse(_r);
    // Cache valid selama 24 jam
    if (navigator.onLine && (Date.now() - _parsed.ts > 864e5)) return null;
    return _parsed.data;
  } catch (e) {
    localStorage.removeItem(`brawnly_api_${_k}`);
    return null;
  }
};

const _hE = (_e: any, _c: string) => {
  if (!navigator.onLine) return null;
  // Abaikan error abort karena itu normal saat perpindahan halaman
  if (_e?.name === 'AbortError') return null;
  if (import.meta.env.DEV) console.error(`[SYS_API_FAULT_${_c}]`, _e);
  throw _e;
};

export const articlesApi = {
  getAll: async (_l = 10, _o = 0): Promise<_At[]> => {
    const _k = `list_${_l}_${_o}`;
    const _cached = _gC(_k);
    if (!navigator.onLine && _cached) return _cached;
    const { data: _d, error: _e } = await _sb.from(_v(1)).select("*").eq('published', true).order(_v(5), { ascending: false }).range(_o, _o + _l - 1);
    if (_e) { if (_cached) return _cached; _hE(_e, "A1"); return []; }
    const _p = _d?.map(_a => ({ ..._a, featured_image: _oM(_a.featured_image) })) ?? [];
    _sC(_k, _p);
    return _p as _At[];
  },
  getBySlug: async (_s: string): Promise<_At> => {
    const _k = `article_${_s}`;
    const _cached = _gC(_k);
    if (!navigator.onLine && _cached) return _cached;
    const { data: _d, error: _e } = await _sb.from(_v(1)).select("*").eq(_v(6), _s).single();
    if (_e || !_d) { if (_cached) return _cached; _hE(_e, "A2"); }
    if (navigator.onLine && _d) { void _sb.rpc(_v(8), { [_v(7)]: _d.id }).match(() => null); }
    const _p = { ..._d, featured_image: _oM(_d.featured_image) } as _At;
    _sC(_k, _p);
    return _p;
  },
};

export const songsApi = {
  getAll: async (): Promise<Song[]> => {
    const _k = "songs";
    const _cached = _gC(_k);
    if (!navigator.onLine && _cached) return _cached;
    const { data: _d, error: _e } = await _sb.from(_v(9)).select("*").order(_v(10), { ascending: false });
    if (_e) { if (_cached) return _cached; _hE(_e, "S1"); return []; }
    const _p = _d?.map(_s => ({ ..._s, thumbnail_url: _oM(_s.thumbnail_url) })) ?? [];
    _sC(_k, _p);
    return _p as Song[];
  },
};

export const subscribersApi = {
  insertIfNotExists: async (_em: string, _n?: string) => {
    if (!_em) return;
    await _sb.from(_v(0)).upsert([{ [_v(4)]: _em.toLowerCase(), name: _n ?? null }], { onConflict: _v(4) });
  },
};

export const authApi = {
  getCurrentUser: async (): Promise<_Au | null> => {
    const { data: _d } = await _sb.auth.getUser();
    if (!_d?.user) return null;
    // REVISI: Pastikan metadata avatar_url diproses dengan _oM yang sudah diperbaiki
    return { 
      ..._d.user, 
      user_metadata: { 
        ..._d.user.user_metadata, 
        avatar_url: _oM(_d.user.user_metadata?.avatar_url) 
      } 
    } as unknown as _Au;
  },
  signUp: async ({ email: _em, name: _n }: { email: string; name: string }) => {
    const { data: _d, error: _e } = await _sb.auth.signInWithOtp({ 
      email: _em.trim(), 
      options: { 
        data: { full_name: _n.trim() }, 
        emailRedirectTo: `${window.location.origin}/auth/callback` 
      } 
    });
    if (_e) _hE(_e, "AUTH1");
    return _d;
  },
  signInWithEmailOnly: async (_em: string) => {
    const { data: _d, error: _e } = await _sb.auth.signInWithOtp({ 
      email: _em.trim(), 
      options: { 
        emailRedirectTo: `${window.location.origin}/auth/callback` 
      } 
    });
    if (_e) _hE(_e, "AUTH2");
    return _d;
  },
  signOut: async () => {
    await _sb.auth.signOut();
  },
};

export const commentsApi = {
  getCommentsByArticle: async (_aId: string): Promise<_Cu[]> => {
    const _k = `comments_${_aId}`;
    const _cached = _gC(_k);
    if (!navigator.onLine && _cached) return _cached;
    const { data: _d, error: _e } = await _sb.from(_v(3)).select(`id, content, created_at, user_id, parent_id, user_profiles ( username, avatar_url )`).eq(_v(7), _aId).order("created_at", { ascending: true });
    if (_e) return _cached || [];
    const _p = (_d as any[])?.map(_c => ({ 
      id: _c.id, 
      article_id: _aId, 
      content: _c.content, 
      created_at: _c.created_at, 
      user_id: _c.user_id, 
      parent_id: _c.parent_id, 
      user_name: _c.user_profiles?.username ?? "Member", 
      user_avatar_url: _oM(_c.user_profiles?.avatar_url) 
    })) ?? [];
    _sC(_k, _p);
    return _p as _Cu[];
  },
  addComment: async (_aId: string, _c: string, _pId: string | null = null) => {
    const { data: _uD } = await _sb.auth.getUser();
    if (!_uD?.user) throw new Error("AUTH_REQUIRED");
    
    // REVISI: Gunakan UPSERT sederhana untuk profil agar tidak bentrok dengan Profile.tsx
    await _sb.from(_v(2)).upsert({ 
      id: _uD.user.id, 
      username: _uD.user.user_metadata?.full_name || "Member", 
      avatar_url: _uD.user.user_metadata?.avatar_url || null 
    }, { onConflict: 'id' });

    const { error: _e } = await _sb.from(_v(3)).insert({ 
      [_v(7)]: _aId, 
      user_id: _uD.user.id, 
      content: _c.trim(), 
      parent_id: _pId 
    });
    if (_e) _hE(_e, "C1");
    localStorage.removeItem(`brawnly_api_comments_${_aId}`);
  },
};