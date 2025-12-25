import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/masculine-logo.svg'
import MobileMenu from './MobileMenu'
import Navigation from './Navigation'
import { useAuth } from '@/hooks/useAuth'
import ThemeToggle from '@/components/common/ThemeToggle'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <header
      className="
        relative overflow-hidden transition-colors duration-300
        /* Mengikuti tema: Putih di Light, Hitam di Dark */
        bg-white dark:bg-black 
        /* Border bawah tipis agar terlihat elegan seperti Billboard */
        border-b border-gray-100 dark:border-neutral-900
      "
    >
      {/* Rainbow top bar - Tetap dipertahankan sebagai ciri khas LGBTQ+ */}
      <div className="absolute inset-x-0 top-0 h-1 flex">
        <div className="flex-1 bg-red-500" />
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-purple-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Logo diberi filter agar tetap terlihat jelas di background gelap */}
            <img src={logo} alt="Fitapp Logo" className="h-8 w-8 dark:brightness-125 transition-transform group-hover:scale-110" />
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-black dark:text-white uppercase">
                Fitapp
              </h1>
              <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">
                LGBTQ+ • Muscle Worship • Kings Only
              </p>
            </div>
          </Link>

          {/* RIGHT AREA */}
          <div className="flex items-center gap-4 md:gap-8">
            {/* DESKTOP NAV */}
            <div className="hidden md:block">
              <Navigation />
            </div>

            {/* THEME TOGGLE */}
            <div className="border-l border-gray-200 dark:border-neutral-800 pl-4">
               <ThemeToggle />
            </div>

            {/* MOBILE BUTTON */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-black dark:text-white p-2"
              aria-label="Toggle navigation"
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && <MobileMenu onClose={closeMenu} />}
      </div>
    </header>
  )
}