import { Routes, Route } from 'react-router-dom'
import React from 'react'

import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Articles from '@/pages/Articles'
import ArticlePage from '@/pages/ArticlePage'
import Category from '@/pages/Category'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Author from '@/pages/Author'
import NotFound from '@/pages/NotFound'

import Subscription from '@/pages/Subscription'
import Profile from '@/pages/Profile' 

import SignUpForm from '@/components/SignUpForm'
import SignInForm from '@/components/common/SignInForms'
import IframeA11yFixer from '@/components/common/IframeA11yFixer'
import AuthCallback from "@/pages/AuthCallback";

import type { AuthPageLayoutProps } from '@/types'

/* =========================
    AUTH LAYOUT (LOCAL)
    Tetap menggunakan gaya gelap (Dark Style) untuk konsistensi branding
    saat proses Login/Register.
========================= */
const AuthLayout: React.FC<AuthPageLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black text-center mb-8 uppercase tracking-tighter bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}

/* =========================
    APP ROUTES
========================= */
function App() {
  return (
    /**
     * REVISI UTAMA:
     * 1. Mengganti 'bg-black' menjadi 'bg-white dark:bg-black' agar background berubah.
     * 2. Menambahkan 'text-black dark:text-white' agar semua teks default mengikuti tema.
     * 3. Menambahkan 'transition-colors' agar perpindahan mode terasa halus (smooth).
     */
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-green-500 selection:text-black transition-colors duration-300">
      
      {/* Fixer diletakkan paling atas agar tidak menumpuk event touch */}
      <IframeA11yFixer />

      <Routes>
        {/* MAIN SITE (Menggunakan Layout yang berisi Header, Footer, dan Outlet) */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="articles" element={<Articles />} />
          <Route path="subscribe" element={<Subscription />} />
          <Route path="profile" element={<Profile />} />
          
          <Route path="article/:slug" element={<ArticlePage />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="author" element={<Author />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>

        {/* AUTH PAGES (Gaya Full Dark tetap dipertahankan di sini) */}
        <Route
          path="/signup"
          element={
            <AuthLayout title="Join Fitapp">
              <SignUpForm />
            </AuthLayout>
          }
        />

        <Route
          path="/signin"
          element={
            <AuthLayout title="Welcome Back">
              <SignInForm />
            </AuthLayout>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App