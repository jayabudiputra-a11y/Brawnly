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
  // index 11: movies table
  "brawnly_movies",
  // index 12: movie view tracking rpc
  "increment_movie_views",
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

// ─── Movie Types ──────────────────────────────────────────────────────────

export interface MovieItem {
  id: string;
  title: string;
  /** "movie" | "series" */
  type: "movie" | "series";
  quality: string;
  genre: string[];
  director?: string;
  creators?: string;
  starring: string[];
  writers?: string;
  release_date?: string;
  release_year?: number;
  country?: string;
  language?: string;
  runtime?: string;
  description?: string;
  poster_url?: string;
  /** External m4uhd watch URL */
  m4uhd_url: string;
  /** For series: number of seasons */
  total_seasons?: number;
  /** For series: season/episode info JSON */
  seasons_meta?: Record<string, number>;
  views?: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Ad/tracker URL patterns to block (obfuscated base64) ─────────────────
// Covers: v2006.com/link2, hatcheskoeri.shop, hatcheskoeri (all subdomains),
//         doubleclick.net, googlesyndication, adserver, popads,
//         trafficjunkie, adcash.com, exosrv.com, popcash.net,
//         juicyads.com, propellerads.com, hilltopads.net, adsterra.com
const _0xAD = [
  "djYyMDA2LmNvbS9saW5rMg==",     // v2006.com/link2
  "aGF0Y2hlc2tvZXJpLnNob3A=",    // hatcheskoeri.shop
  "aGF0Y2hlc2tvZXJp",             // hatcheskoeri (catch all subdomains)
  "aWsuaGF0Y2hlc2tvZXJp",        // ik.hatcheskoeri (exact subdomain used in ad)
  "ZG91YmxlY2xpY2submV0",        // doubleclick.net
  "Z29vZ2xlc3luZGljYXRpb24=",   // googlesyndication
  "YWRzZXJ2ZXI=",                 // adserver
  "cG9wYWRz",                     // popads
  "dHJhZmZpY2p1bmtpZQ==",        // trafficjunkie
  "YWRjYXNoLmNvbQ==",             // adcash.com
  "ZXhvc3J2LmNvbQ==",             // exosrv.com
  "cG9wY2FzaC5uZXQ=",             // popcash.net
  "anVpY3lhZHMuY29t",             // juicyads.com
  "cHJvcGVsbGVyYWRzLmNvbQ==",    // propellerads.com
  "aGlsbHRvcGFkcy5uZXQ=",         // hilltopads.net
  "YWRzdGVycmEuY29t",             // adsterra.com
  "djYyMDA2LmNvbQ==",              // v2006.com (domain level catch-all)
] as const;

// Query-param patterns that signal ad redirect (not base64 — checked separately)
const _0xADQ = ["var=", "ymid=", "var_3="] as const;

/** 
 * Check if a URL matches known ad/tracker patterns.
 * Blocks: v2006.com/link2, hatcheskoeri.shop subdomains, doubleclick,
 * googlesyndication, popads, trafficjunkie, adcash, exosrv, popcash,
 * juicyads, propellerads, hilltopads, adsterra.
 * Also blocks URLs whose query string contains ad redirect params (var=, ymid=).
 */
export function isAdUrl(_u: string): boolean {
  if (!_u) return false;
  // base64 domain/path patterns
  const _domainHit = _0xAD.some((_enc) => {
    try { return _u.includes(atob(_enc)); } catch { return false; }
  });
  if (_domainHit) return true;
  // query param heuristic — v2006 uses var=, ymid=, var_3= as fingerprints
  try {
    const _url = new URL(_u);
    const _qHit = _0xADQ.every((_q) => _url.search.includes(_q.split("=")[0]));
    if (_qHit) return true;
  } catch { /* non-parseable URL — skip */ }
  return false;
}

/**
 * Logika Media URL yang cerdas.
 * Tidak akan menambahkan prefix jika URL sudah valid (HTTP/Blob).
 */
const _oM = (_u?: string | null): string => {
  if (!_u) return "";
  if (_u.startsWith("http") || _u.startsWith("blob:") || _u.startsWith("data:")) return _u;
  return _CB + _u;
};

const _sC = (_k: string, _d: any) => {
  try {
    const _pL = JSON.stringify({ ts: Date.now(), data: _d });
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
    if (navigator.onLine && (Date.now() - _parsed.ts > 864e5)) return null;
    return _parsed.data;
  } catch (e) {
    localStorage.removeItem(`brawnly_api_${_k}`);
    return null;
  }
};

const _hE = (_e: any, _c: string) => {
  if (!navigator.onLine) return null;
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

// ─── Movies API ───────────────────────────────────────────────────────────

export const moviesApi = {
  /**
   * Get all movies/series from Supabase.
   * Cache: 24h localStorage. Falls back to cache when offline.
   */
  getAll: async (): Promise<MovieItem[]> => {
    const _k = "movies_all";
    const _cached = _gC(_k);
    if (!navigator.onLine && _cached) return _cached;

    const { data: _d, error: _e } = await _sb
      .from(_v(11))
      .select("*")
      .order(_v(10), { ascending: false });

    if (_e) {
      if (_cached) return _cached;
      if (import.meta.env.DEV) console.error("[MOVIES_API_FAIL]", _e);
      return [];
    }

    const _p: MovieItem[] = (_d || []).map((_m: any) => ({
      ..._m,
      poster_url: _oM(_m.poster_url),
      genre: Array.isArray(_m.genre)
        ? _m.genre
        : (_m.genre ? String(_m.genre).split(",").map((g: string) => g.trim()) : []),
      starring: Array.isArray(_m.starring)
        ? _m.starring
        : (_m.starring ? String(_m.starring).split(",").map((s: string) => s.trim()) : []),
    }));

    _sC(_k, _p);
    return _p;
  },

  /**
   * Get single movie by id.
   */
  getById: async (_id: string): Promise<MovieItem | null> => {
    const _k = `movie_${_id}`;
    const _cached = _gC(_k);
    if (!navigator.onLine && _cached) return _cached;

    const { data: _d, error: _e } = await _sb
      .from(_v(11))
      .select("*")
      .eq("id", _id)
      .single();

    if (_e || !_d) {
      if (_cached) return _cached;
      return null;
    }

    const _p: MovieItem = {
      ..._d,
      poster_url: _oM(_d.poster_url),
      genre: Array.isArray(_d.genre)
        ? _d.genre
        : (_d.genre ? String(_d.genre).split(",").map((g: string) => g.trim()) : []),
      starring: Array.isArray(_d.starring)
        ? _d.starring
        : (_d.starring ? String(_d.starring).split(",").map((s: string) => s.trim()) : []),
    };

    _sC(_k, _p);
    return _p;
  },

  /**
   * Track view for a movie.
   * SILENT FAIL on ALL errors — tracking is non-critical.
   * PGRST202 = RPC function not found (migration not run yet) → skip silently.
   * Network errors → skip silently.
   * No console.error in production to avoid noise.
   */
  trackView: async (_id: string): Promise<void> => {
    if (!navigator.onLine || !_id) return;
    try {
      const { error: _e } = await _sb.rpc(_v(12), { movie_id: _id });
      if (_e) {
        // PGRST202 = function does not exist → migration pending, fully silent
        if (_e.code === "PGRST202") return;
        // Any other error → dev-only warn, never throw
        if (import.meta.env.DEV) console.warn("[MOVIE_TRACK]", _e.code, _e.message);
        return;
      }
      // Success: invalidate cache so views count refreshes on next load
      localStorage.removeItem(`brawnly_api_movie_${_id}`);
      localStorage.removeItem("brawnly_api_movies_all");
    } catch {
      // Network abort / fetch error — always silent, tracking is non-critical
    }
  },

  /**
   * Get movies by type filter.
   */
  getByType: async (_type: "movie" | "series"): Promise<MovieItem[]> => {
    const _k = `movies_type_${_type}`;
    const _cached = _gC(_k);
    if (!navigator.onLine && _cached) return _cached;

    const { data: _d, error: _e } = await _sb
      .from(_v(11))
      .select("*")
      .eq("type", _type)
      .order(_v(10), { ascending: false });

    if (_e) {
      if (_cached) return _cached;
      return [];
    }

    const _p: MovieItem[] = (_d || []).map((_m: any) => ({
      ..._m,
      poster_url: _oM(_m.poster_url),
      genre: Array.isArray(_m.genre)
        ? _m.genre
        : (_m.genre ? String(_m.genre).split(",").map((g: string) => g.trim()) : []),
      starring: Array.isArray(_m.starring)
        ? _m.starring
        : (_m.starring ? String(_m.starring).split(",").map((s: string) => s.trim()) : []),
    }));

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