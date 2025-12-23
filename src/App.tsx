// src/App.tsx
import { Routes, Route } from 'react-router-dom'

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

// Import ThemeToggle dihapus karena sudah tidak digunakan di sini
// import ThemeToggle from '@/components/common/ThemeToggle'

import type { AuthPageLayoutProps } from '@/types'

/* =========================
   AUTH LAYOUT (LOCAL)
========================= */
const AuthLayout: React.FC<AuthPageLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
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
    <>
      <IframeA11yFixer />

      {/* Bagian GLOBAL THEME TOGGLE dihapus agar tidak double dan tidak muncul di splash */}

      <Routes>
        {/* MAIN SITE (PAKAI Layout + Outlet) */}
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

        {/* AUTH PAGES (TANPA Layout UTAMA) */}
        <Route
          path="/signup"
          element={
            <AuthLayout title="Sign Up">
              <SignUpForm />
            </AuthLayout>
          }
        />

        <Route
          path="/signin"
          element={
            <AuthLayout title="Sign In">
              <SignInForm />
            </AuthLayout>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App