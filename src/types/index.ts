/* =========================
   Article & Content
========================= */
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string;
  author: string;
  published_at: string;
  updated_at: string;
  views: number;
  reading_time: number;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
}

/* =========================
   Subscriber
========================= */
export interface Subscriber {
  id?: string;
  email: string;
  name?: string;
  subscribed_at?: string;
  is_active?: boolean;
  preferences?: {
    categories: string[];
    frequency: string;
  };
}

/* =========================
   User & Auth
========================= */
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

/* =========================
   Comments
========================= */
export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  auth: {
    users: {
      name: string | null;
      raw_user_meta_data: {
        avatar_url: string | null;
      } | null;
    };
  };
}

export interface NewComment {
  article_id: string;
  content: string;
}

export interface CommentWithUser {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string | null;
  user_avatar_url: string | null;
}

/* =========================
   Preferences
========================= */
export interface SaveDataPreference {
  enabled: boolean;
  quality: "low" | "medium" | "high";
}
