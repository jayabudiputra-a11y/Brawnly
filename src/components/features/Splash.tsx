import { useEffect, useState } from "react"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

const texts = [
  "I am Budi Putra Jaya",
  "I am here for you babe",
  "I am gay like you",
]

const photos = [
  `${SUPABASE_URL}/storage/v1/object/public/Shawty/bbUBA8bbYBjuh8Bb8BBgb8GVrrv.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/Shawty/B8b1bsjuannomnnsNHGAB.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/Shawty/Hguba8b1u19hb.jpg`,
  `${SUPABASE_URL}/storage/v1/object/public/Shawty/hb81V78BNjubBUHBBUB.jpg`,
]

const videoSrc = `${SUPABASE_URL}/storage/v1/object/public/Shawty/Bbu8h19BiuJJnG.mp4`

export default function Splash() {
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length)
    }, 1400)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="fixed inset-0 bg-gradient-to-br from-emerald-50 to-white flex flex-col items-center justify-center z-50">
      {/* Teks + Video */}
      <div className="flex items-center gap-6">
        <div className="relative h-20 flex items-center justify-center">
          <h1
            key={textIndex}
            className="text-4xl md:text-6xl font-bold text-emerald-600 text-center animate-slide-in"
          >
            {texts[textIndex]}
          </h1>
        </div>

        <div className="video-card shadow-lg transform rotate-3">
          <video
            src={videoSrc}
            autoPlay
            loop
            controls
            className="w-48 h-32 object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="rounded-full border-4 border-emerald-500 p-1 w-32 h-32 overflow-hidden shadow-md animate-from-top delay-100">
          <img src={photos[0]} alt="Avatar" className="w-full h-full object-cover rounded-full" />
        </div>

        <div className="w-32 h-32 relative overflow-hidden animate-from-right delay-200">
          <div className="absolute inset-0 clip-hexagon shadow-lg">
            <img src={photos[1]} alt="Hex" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="w-32 h-32 rounded-[30%] overflow-hidden shadow-lg animate-from-bottom delay-300">
          <img src={photos[2]} alt="Squircle" className="w-full h-full object-cover" />
        </div>

        <div className="w-32 h-32 overflow-hidden transform rotate-3 shadow-xl rounded-lg animate-from-left delay-400">
          <img src={photos[3]} alt="Tilted" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  )
}
