import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import FormattedDate from '@/components/features/FormattedDate' 
import FormattedTime from '@/components/features/FormattedTime' 

const Author = () => {
  const { data: author, isLoading, error } = useQuery({
    queryKey: ['author'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('author')
        .select('*')
        .limit(1)
      if (error) throw error
      return data?.[0] ?? null
    },
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading author...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-50 rounded-xl">
        <p className="text-red-600 text-xl font-bold">Gagal connect ke Supabase</p>
        <p className="text-gray-700 mt-2">Cek console (F12) → Network → pastikan .env benar</p>
      </div>
    )
  }

  if (!author) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-gray-600">Author belum tersedia</p>
      </div>
    )
  }

  return (

<div className="max-w-2xl mx-auto px-4 py-10 space-y-8 text-center"> 
      
              {/* */}
      <h1 className="text-5xl font-bold mb-6 text-emerald-600">
        {author.name}
      </h1>

                {/* */}      <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line mx-auto">
        {author.bio}
      </p>

      {/*  */}
      {/* */}
      <div className="flex justify-center space-x-6 mt-8">
        <a
          href={author.flickr_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 text-2xl font-semibold hover:underline flex items-center gap-2"
        >
          📸 Gallery
        </a>
        <a
          href={author.linktree_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 text-2xl font-semibold hover:underline flex items-center gap-2"
        >
          🔗 Linktree
        </a>
      </div>

      <div className="text-sm text-gray-500 mt-12">
        Created at: 
        <FormattedDate 
            dateString={ author.created_at } 
        />
        &nbsp;
        <FormattedTime 
            dateString={ author.created_at } 
        />
      </div>
    </div>
  )
}

export default Author
