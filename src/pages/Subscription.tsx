import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Subscription = () => {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // 1. Simpan email ke LocalStorage agar ditangkap oleh SignUpForm
    localStorage.setItem("pending_subscribe_email", email)

    // 2. Beri pesan manis kepada user
    toast.success("Hampir selesai!", {
      description: "Lengkapi nama Anda untuk mengaktifkan fitur diskusi."
    })

    // 3. Arahkan ke /signup, bukan cuma submit newsletter
    // Dengan begini user akan melewati proses pembuatan akun otomatis
    navigate('/signup')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-black">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-neutral-800">
        <div className="text-center">
          {/* Badge Design */}
          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full">
            Fitapp 2025
          </span>
          <h2 className="mt-4 text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Subscribe
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Dapatkan update artikel & mulai berdiskusi dengan member lainnya.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-5 py-4 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-gray-300"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Get Access Now
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              ⚡ No Password Required • Fast Setup
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Subscription