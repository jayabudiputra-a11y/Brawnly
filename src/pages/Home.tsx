import ArticleList from '@/components/features/ArticleList'
import masculineLogo from '@/assets/masculine-logo.svg' // ✅ Import logo lokal

const Home = () => {
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-white text-center">
        <div className="max-w-xl mx-auto px-4"> {/* ✅ Container lebih kecil */}
          <img
            src={masculineLogo}
            alt="Fitapp Logo"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold mb-2">
            Fit<span className="text-emerald-600">app</span>
          </h1>
          <p className="text-base text-gray-700">
            LGBTQ+ Fitness • Muscle Worship • Mindset • Wellness
          </p>
          <p className="text-sm text-emerald-600 font-semibold mt-2">
            Built by fellow gay, for gays.
          </p>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Latest Inspiration</h2>
          <ArticleList selectedTag={null} />
        </div>
      </section>
    </>
  )
}

export default Home
