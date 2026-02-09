import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/masculineLogo.svg'
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
        bg-white dark:bg-black 
        border-b border-gray-100 dark:border-neutral-900
      "
    >
      <div className="absolute inset-x-0 top-0 h-1 flex" aria-hidden="true">
        <div className="flex-1 bg-red-500" />
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-purple-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        <div className="flex items-center justify-between">

          <Link to="/" className="flex items-center space-x-3 group outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
            <img 
              src={logo} 
              alt="Brawnly Logo" 
              width="32" 
              height="32"
              className="h-8 w-8 dark:brightness-125 transition-transform group-hover:scale-110" 
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-black dark:text-white uppercase leading-none">
                Brawnly
              </h1>
              <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 tracking-widest uppercase mt-0.5">
                LGBTQ+ • Muscle Worship • Kings Only
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <nav className="hidden md:block" aria-label="Main navigation">
              <Navigation />
            </nav>

            <div className="border-l border-gray-200 dark:border-neutral-800 pl-4 flex items-center h-8">
               <ThemeToggle />
            </div>

            <button
              onClick={toggleMenu}
              className="md:hidden text-black dark:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full transition-colors"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              <span className="text-2xl" aria-hidden="true">
                {isOpen ? "✕" : "☰"}
              </span>
            </button>
          </div>
        </div>

        {isOpen && <MobileMenu onClose={closeMenu} />}
      </div>
    </header>
  )
}