import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/masculine-logo.svg'
import MobileMenu from './MobileMenu' 


export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false) 

  return (
    <header className="relative overflow-hidden border-b border-gray-200 bg-white">
      
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
          
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={logo} alt="Fitapp Logo" className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold text-emerald-600">Fitapp</h1>
              <p className="text-xs text-gray-600 tracking-wider">
                LGBTQ+ • Muscle Worship • Kings Only
              </p>
            </div>
          </Link>


          <button
            onClick={toggleMenu} 
            className="md:hidden text-gray-600 hover:text-emerald-600 focus:outline-none"
            type="button" 
            aria-label={isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={isOpen}
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


          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-emerald-600 font-medium transition">Home</Link>
            <Link to="/articles" className="text-gray-700 hover:text-emerald-600 font-medium transition">Articles</Link>
            <Link to="/contact" className="text-gray-700 hover:text-emerald-600 font-medium transition">Contact</Link>
            <Link to="/author" className="text-gray-700 hover:text-emerald-600 font-medium transition">Author</Link>
          </nav>
        </div>


        {isOpen && (
           <MobileMenu onClose={closeMenu} /> 
        )}
        
      </div>
    </header>
  )
}
