import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { navItems } from '@/config/navItems'

const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-yellow-300">

      <div className="p-6 border-b-4 border-[#800000] flex justify-between items-center">
        <h2 className="text-2xl font-extrabold text-[#800000]">
          Brawnly
        </h2>

        <button
          onClick={onClose}
          className="p-2 text-[#800000]"
          aria-label="Tutup menu mobile"
          type="button"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col items-center justify-center space-y-10 text-3xl font-bold">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className="
              text-[#800000]
              transition-all
              hover:bg-gradient-to-r
              hover:from-red-500
              hover:via-yellow-400
              hover:to-purple-600
              hover:bg-clip-text
              hover:text-transparent
            "
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default MobileMenu
