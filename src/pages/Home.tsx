import ArticleList from '@/components/features/ArticleList'
import centralGif from '@/assets/fitapp (1).gif'
import leftGif from '@/assets/fitapp3-ezgif.com-gif-maker.gif'
import rightGif from '@/assets/fitapp2-ezgif.com-gif-maker.gif'
import prideMustache from '@/assets/myPride.gif'

const Home = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      
      {/* HERO SECTION */}
      <section className="relative pt-8 border-b border-gray-100 dark:border-neutral-900 bg-white dark:bg-black">
        <div className="max-w-[1100px] mx-auto px-4">
          
          <div className="flex flex-row items-start justify-center gap-2 md:gap-6">
            <div className="hidden md:flex flex-col items-center w-1/4">
              <img 
                src={leftGif} 
                alt="Left" 
                className="w-full h-auto mix-blend-multiply dark:mix-blend-normal" 
              />
              <img src={prideMustache} alt="Pride" className="h-5 mt-1 opacity-50 dark:opacity-70" />
            </div>

            <div className="flex flex-col items-center w-full md:w-1/2">
              <img 
                src={centralGif} 
                alt="Main" 
                className="w-full h-auto mix-blend-multiply dark:mix-blend-normal" 
              />
              <img src={prideMustache} alt="Pride" className="h-7 mt-1" />
            </div>

            <div className="hidden md:flex flex-col items-center w-1/4">
              <img 
                src={rightGif} 
                alt="Right" 
                className="w-full h-auto mix-blend-multiply dark:mix-blend-normal" 
              />
              <img src={prideMustache} alt="Pride" className="h-5 mt-1 opacity-50 dark:opacity-70" />
            </div>
          </div>

          <div className="pt-10 pb-12 text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <span className="bg-[#00a354] text-white text-[10px] font-black px-2 py-0.5 tracking-[.2em] uppercase">
                TOP STORY
              </span>
            </div>
            
            {/* PERBAIKAN UTAMA: Kita paksa text-black secara eksplisit untuk Light Mode */}
            <h1 className="text-[36px] md:text-[64px] leading-[0.85] font-black uppercase tracking-tighter mb-6 text-black dark:text-white">
              The Sexiest Men Photos Handpicked By Me: Fitapp Author
            </h1>
            
            <p className="text-neutral-500 dark:text-neutral-400 text-[11px] font-bold uppercase tracking-[.25em]">
              By Fitapp Editor
            </p>
          </div>
        </div>
      </section>

      {/* ARTICLE FEED */}
      <section className="py-12 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-[1000px] mx-auto px-4">
          <ArticleList selectedTag={null} searchTerm="" />
        </div>
      </section>
    </main>
  )
}

export default Home