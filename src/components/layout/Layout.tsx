// src/components/layout/Layout.tsx
import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Splash from '../features/Splash' // ✅ buat komponen Splash.tsx seperti contoh sebelumnya

const Layout = () => {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 5000) // splash tampil 5 detik
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <Splash /> // ✅ tampilkan splash dulu
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
