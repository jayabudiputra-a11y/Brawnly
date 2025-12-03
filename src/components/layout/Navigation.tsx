// src/components/layout/Navigation.tsx
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/articles', label: 'Articles' },
  { to: '/category/fitness', label: 'Fitness' },
  { to: '/category/lgbtq', label: 'LGBTQ+' },
  { to: '/category/admiration', label: 'Admiration' },
  { to: '/category/mindset', label: 'Mindset' },
]

const Navigation = () => {
  return (
    <nav className="flex items-center space-x-8">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `font-medium transition-colors ${
              isActive
                ? 'text-emerald-600 font-bold'
                : 'text-gray-700 hover:text-emerald-600'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default Navigation