// src/components/layout/Layout.tsx
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Splash from '../features/Splash'

const Layout = () => {
  const location = useLocation()
  const isHome = location.pathname === "/"  // ← hanya splash di halaman utama

  const [showSplash, setShowSplash] = useState(isHome)

  useEffect(() => {
    if (isHome) {
      // Splash hanya berjalan jika di homepage
      const timer = setTimeout(() => setShowSplash(false), 5000)
      return () => clearTimeout(timer)
    } else {
      // Jika bukan homepage → splash langsung mati
      setShowSplash(false)
    }
  }, [isHome])

  if (showSplash) {
    return <Splash />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
