import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/masculine-logo.svg'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="relative overflow-hidden border-b border-gray-200 bg-white">
      {/* Rainbow subtle stripe */}
      <div className="absolute inset-x-0 top-0 h-1 flex">
        <div className="flex-1 bg-red-500"></div>
        <div className="flex-1 bg-orange-500"></div>
        <div className="flex-1 bg-yellow-400"></div>
        <div className="flex-1 bg-green-500"></div>
        <div className="flex-1 bg-blue-500"></div>
        <div className="flex-1 bg-purple-600"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="flex items-center justify-between">
          {/* Logo + tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={logo} alt="Fitapp Logo" className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold text-emerald-600">Fitapp</h1>
              <p className="text-xs text-gray-600 tracking-wider">
                LGBTQ+ • Muscle Worship • Kings Only
              </p>
            </div>
          </Link>

          {/* Toggle button (mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-emerald-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Navigation (desktop) */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-emerald-600 font-medium transition">
              Home
            </Link>
            <Link to="/articles" className="text-gray-700 hover:text-emerald-600 font-medium transition">
              Articles
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-emerald-600 font-medium transition">
              Contact
            </Link>
            <Link to="/author" className="text-gray-700 hover:text-emerald-600 font-medium transition">
              Author
            </Link>
          </nav>
        </div>

        {/* Navigation (mobile dropdown) */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link to="/" className="block text-gray-700 hover:text-emerald-600 font-medium">
              Home
            </Link>
            <Link to="/articles" className="block text-gray-700 hover:text-emerald-600 font-medium">
              Articles
            </Link>
            <Link to="/contact" className="block text-gray-700 hover:text-emerald-600 font-medium">
              Contact
            </Link>
            <Link to="/author" className="block text-gray-700 hover:text-emerald-600 font-medium">
              Author
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
