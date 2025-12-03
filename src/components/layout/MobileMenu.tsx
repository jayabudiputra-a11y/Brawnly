// src/components/layout/MobileMenu.tsx
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  const links = [
    'Home', 'Articles', 'Fitness', 'LGBTQ+', 'Admiration', 'Mindset', 'Wellness', 'About', 'Contact'
  ]

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fitapp</h2>
        <button onClick={onClose} className="p-2">
          <X className="w-8 h-8" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col items-center justify-center space-y-8 text-2xl font-medium">
        {links.map((link) => {
          const path = link === 'Home' ? '/' : `/${link.toLowerCase().replace('+', '')}`
          return (
            <Link key={link} to={path} onClick={onClose} className="hover:text-emerald-600 transition">
              {link}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default MobileMenu