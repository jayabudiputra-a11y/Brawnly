// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Articles from './pages/Articles'
import ArticlePage from './pages/ArticlePage'
import Category from './pages/Category'
import About from './pages/About'
import Contact from './pages/Contact'
import Author from './pages/Author' // ✅ Tambahkan ini
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      {/* Routes dengan Layout (Header + Footer) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="articles" element={<Articles />} />
        <Route path="article/:slug" element={<ArticlePage />} />
        <Route path="category/:slug" element={<Category />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="author" element={<Author />} /> {/* ✅ Tambahkan ini */}
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
