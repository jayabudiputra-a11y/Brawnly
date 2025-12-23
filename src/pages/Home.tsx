import { useState } from 'react'
import ArticleList from '@/components/features/ArticleList'
import centralGif from '@/assets/fitapp (1).gif'
import leftGif from '@/assets/fitapp3-ezgif.com-gif-maker.gif'
import rightGif from '@/assets/fitapp2-ezgif.com-gif-maker.gif'
import prideMustache from '@/assets/myPride.gif'
import SearchBar from '@/components/features/SearchBar'

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase())
  }

  return (
    <>
      {/* =========================
          HERO / BRAND SECTION
      ========================== */}
      <section
        className="
          relative
          py-20
          text-center
          overflow-hidden
          bg-gradient-to-br
          from-pink-600/20
          via-purple-600/20
          to-emerald-500/20
          dark:from-pink-500/10
          dark:via-purple-500/10
          dark:to-emerald-400/10
        "
      >
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto flex justify-center items-center gap-0">
          <img
            src={leftGif}
            alt="Fitapp Left Decoration"
            className="w-1/4 h-auto hidden md:block opacity-90"
          />

          <img
            src={centralGif}
            alt="Fitapp Main Inspiration GIF"
            className="w-1/2 h-auto drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]"
          />

          <img
            src={rightGif}
            alt="Fitapp Right Decoration"
            className="w-1/4 h-auto hidden md:block opacity-90"
          />
        </div>
      </section>

      {/* =========================
          LATEST INSPIRATION
      ========================== */}
      <section className="py-20 relative">
        {/* Soft rainbow background */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-b
            from-transparent
            via-pink-500/5
            to-transparent
            dark:via-purple-500/5
            pointer-events-none
          "
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* PRIDE MUSTACHE GIF */}
          <div className="flex justify-center mb-4">
            <img
              src={prideMustache}
              alt="Pride Mustache"
              className="h-16 w-auto"
            />
          </div>

          {/* GRADIENT TITLE */}
          <h2
            className="
              text-4xl sm:text-5xl font-extrabold text-center mb-8
              bg-gradient-to-r
              from-red-500
              via-yellow-400
              via-green-400
              via-blue-500
              to-purple-600
              bg-clip-text text-transparent
            "
          >
            Latest Inspiration
          </h2>

          <div className="max-w-xl mx-auto mb-12">
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
