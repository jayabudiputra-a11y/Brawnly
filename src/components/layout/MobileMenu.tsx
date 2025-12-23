import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { navItems } from '@/config/navItems'

const MobileMenu = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 transition-colors">
      
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-emerald-600">Fitapp</h2>

        <button
          onClick={onClose}
          className="p-2 text-gray-700 dark:text-gray-300"
          aria-label="Tutup menu mobile"
          type="button"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      <nav className="flex-1 flex flex-col items-center justify-center space-y-8 text-2xl font-medium">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className="hover:text-emerald-600 transition text-gray-800 dark:text-gray-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default MobileMenu