import type { ReactNode } from "react";

// ── Article ───────────────────────────────────────────────────────────────────
// Field lengkap sesuai schema articles_denormalized di Supabase.
// ArticleDetail.tsx mengakses: featured_image_url, featured_image,
// tweet_url_1, tweet_url_2, youtube_shorts_url, author_name, updated_at.
// useArticles.ts meng-overwrite featured_image_url dengan URL tunggal (cover).
// StructuredData.tsx membaca: tags, content, content_en, slug, category.
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;

  // Konten artikel — bisa HTML penuh, plain text, atau journal HTML fragment
  content: string | null;
  // Versi konten bahasa Inggris (opsional, untuk keyword extraction SEO)
  content_en?: string | null;

  // Cover image + galeri — multi-line URL dipisah newline (\r\n)
  // Baris pertama = cover, baris berikutnya = galeri, GIF, video, tweet
  featured_image: string | null;
  featured_image_url?: string | null;

  // URL tweet tambahan (di luar yang ada di featured_image_url multi-line)
  tweet_url_1?: string | null;
  tweet_url_2?: string | null;

  // URL YouTube Shorts — multi-line atau koma-separated
  youtube_shorts_url?: string | null;

  category: string | null;
  author: string | null;
  // Nama author terpisah (beberapa artikel dari denormalized view pakai ini)
  author_name?: string | null;
  // Avatar author jika tersedia dari denormalized view
  author_avatar?: string | null;

  published_at: string;
  updated_at: string | null;

  views: number;
  reading_time?: number;
  tags: string[] | null;

  // Thumbnail eksplisit (diisi oleh useArticles setelah processing)
  thumbnail_url?: string | null;

  // Index record dari Supabase full-text search
  url?: string | null;
}

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
}

// ── Subscriber ────────────────────────────────────────────────────────────────
export interface Subscriber {
  id?: string;
  email: string;
  name?: string | null;
  subscribed_at?: string;
  is_active?: boolean;
  preferences?: {
    categories: string[];
    frequency: string;
  };
}

// ── UserProfile ───────────────────────────────────────────────────────────────
export interface UserProfile {
  id?: string;
  username: string;
  avatar_url: string | null;
  updated_at?: string;
}

// ── AuthUser ──────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// ── Auth forms ────────────────────────────────────────────────────────────────
export interface SignUpData {
  email: string;
  name: string;
}

export interface AuthPageLayoutProps {
  children: ReactNode;
  title: string;
}

// ── Comments ──────────────────────────────────────────────────────────────────
export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export interface NewComment {
  article_id: string;
  content: string;
}

// CommentWithUser — dipakai di ArticleDetail.tsx sebagai _Cu
// parent_id mendukung threaded replies
export interface CommentWithUser {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar_url: string | null;
  parent_id?: string | null;
}

// ── Data preferences ──────────────────────────────────────────────────────────
export interface SaveDataPreference {
  enabled: boolean;
  quality: "low" | "medium" | "high";
}

// ── AutoIndex ─────────────────────────────────────────────────────────────────
// Tipe untuk localStorage cache deduplication di autoIndex.ts
// Key = URL, Value = timestamp (ms) kapan URL terakhir di-submit
export interface AutoIndexCache {
  [url: string]: number;
}

// ── Service Worker Messages ───────────────────────────────────────────────────
// Pesan yang dikirim antara klien ↔ SW.
// Tag "sync-articles" harus konsisten di:
//   swRegister.ts → reg.sync.register("sync-articles")
//   sw.ts         → event.tag === "sync-articles"
//   ArticleDetail.tsx → reg.sync.register('sync-articles')

export type SWMessageType =
  | { type: "SW_ACTIVATED" }
  | { type: "SKIP_WAITING" }
  | { type: "TRACK_VIEW"; articleId: string }
  | { type: "iframeHeight"; scopeId: string; height: number };

// ── RSS Feed (ArticleDetail internal) ────────────────────────────────────────
// Dipakai oleh useRSSFeed dan useYouTubeFeed di ArticleDetail.tsx
export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail: string;
  videoId?: string;
}

// ── Processed Article Data (useArticleData output) ───────────────────────────
// Shape dari processedData yang dikembalikan useArticleData.ts
export interface ProcessedArticleData {
  article: Article;
  title: string;
  excerpt: string;
  content: string;
  paragraphs: string[];
  coverImage: string;
  midGallery: string;
  bottomGallery: string;
  allImages: string[];
}