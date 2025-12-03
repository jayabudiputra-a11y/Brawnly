import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useArticles = (tag?: string | null) => {
  return useQuery({
    queryKey: ['articles', tag],
    queryFn: async () => {
      // Pastikan koneksi Supabase valid
      let query = supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })

      // Filter berdasarkan tag jika ada
      if (tag) {
        query = query.contains('tags', [tag])
      }

      const { data, error } = await query

      // Logging untuk debugging
      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw new Error('Gagal fetch artikel dari Supabase')
      }

      return data ?? []
    },
    staleTime: 1000 * 60 * 5,
  })
}
