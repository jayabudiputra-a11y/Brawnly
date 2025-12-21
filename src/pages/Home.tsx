import { useState } from 'react'
import ArticleList from '@/components/features/ArticleList'
import centralGif from '@/assets/fitapp (1).gif'
import leftGif from '@/assets/fitapp3-ezgif.com-gif-maker.gif'
import rightGif from '@/assets/fitapp2-ezgif.com-gif-maker.gif'
import SearchBar from '@/components/features/SearchBar'

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase())
  }

  return (
    <>
    
      <section className="py-16 text-center">
        <div className="max-w-5xl mx-auto flex justify-center items-center gap-0">
          <img 
            src={leftGif} 
            alt="Fitapp Left Decoration" 
            className="w-1/4 h-auto hidden md:block"
          />
          <img 
            src={centralGif} 
            alt="Fitapp Main Inspiration GIF" 
            className="w-1/2 h-auto"
          />
          <img 
            src={rightGif} 
            alt="Fitapp Right Decoration" 
            className="w-1/4 h-auto hidden md:block"
          />
        </div>
      </section>


      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-6">Latest Inspiration</h2>

          <div className="max-w-xl mx-auto mb-10">
            <SearchBar onSearch={handleSearch} />
          </div>

          <ArticleList 
            selectedTag={null}
            searchTerm={searchTerm}
          />
        </div>
      </section>
    </>
  )
}

export default Home
