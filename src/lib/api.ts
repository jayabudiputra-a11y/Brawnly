import { supabase } from './supabase'
import type { Article, Subscriber } from '../types'

// Articles API
export const articlesApi = {
  getAll: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data as Article[]
  },

  getBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    
    // Increment views
    await supabase.rpc('increment_views', { article_id: data.id })
    
    return data as Article
  },

  getByCategory: async (category: string) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .order('published_at', { ascending: false })

    if (error) throw error
    return data as Article[]
  },

  search: async (query: string) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .textSearch('title', query, {
        type: 'websearch',
        config: 'english',
      })
      .order('published_at', { ascending: false })

    if (error) throw error
    return data as Article[]
  },
}

// Subscribers API
export const subscribersApi = {
  subscribe: async (subscriber: Subscriber) => {
    const { data, error } = await supabase
      .from('subscribers')
      .insert(subscriber)
      .select()
      .single()

    if (error) throw error
    return data
  },

  checkEmail: async (email: string) => {
    const { data, error } = await supabase
      .from('subscribers')
      .select('email')
      .eq('email', email)
      .single()

    return { exists: !!data, error }
  },
}

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error
    return data
  },
}