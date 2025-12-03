export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  category: string
  author: string
  published_at: string
  updated_at: string
  views: number
  reading_time: number
  tags: string[]
}

export interface Subscriber {
  id?: string
  email: string
  name?: string
  subscribed_at?: string
  is_active?: boolean
  preferences?: {
    categories: string[]
    frequency: string
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  order_index: number
}

export interface SaveDataPreference {
  enabled: boolean
  quality: 'low' | 'medium' | 'high'
}