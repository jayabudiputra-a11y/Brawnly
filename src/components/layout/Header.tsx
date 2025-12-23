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
        relative overflow-hidden
        border-b border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900
        transition-colors
      "
    >
      {/* Rainbow bar */}
      <div className="absolute inset-x-0 top-0 h-1 flex">
        <div className="flex-1 bg-red-500" />
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-purple-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={logo} alt="Fitapp Logo" className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold text-emerald-600">Fitapp</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 tracking-wider">
                LGBTQ+ • Muscle Worship • Kings Only
              </p>
            </div>
          </Link>

          {/* RIGHT AREA */}
          <div className="flex items-center gap-4">
            {/* DESKTOP NAV */}
            <div className="hidden md:block">
              <Navigation />
            </div>

            {/* THEME TOGGLE */}
            <ThemeToggle />

            {/* MOBILE BUTTON */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 dark:text-gray-300 hover:text-emerald-600"
              aria-label="Toggle navigation"
            >
              ☰
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && <MobileMenu onClose={closeMenu} />}
      </div>
    </header>
  )
}
