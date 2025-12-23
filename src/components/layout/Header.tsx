import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/masculine-logo.svg'
import MobileMenu from './MobileMenu'
import Navigation from './Navigation'
import { useAuth } from '@/hooks/useAuth'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth() // Get user state

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <header className="relative overflow-hidden border-b border-gray-200 bg-white">
      
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
              <p className="text-xs text-gray-600 tracking-wider">
                LGBTQ+ • Muscle Worship • Kings Only
              </p>
            </div>
          </Link>

          {/* MOBILE BUTTON */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-emerald-600"
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          {/* NAVIGATION AREA */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main Menu (Home, Articles, Subscribe, Profile jika ada di Navigation) */}
            <Navigation />
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && <MobileMenu onClose={closeMenu} />}
      </div>
    </header>
  )
}
