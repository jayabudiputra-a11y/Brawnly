// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom'
import { Dumbbell, Heart, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Dumbbell className="w-8 h-8 text-emerald-500" />
              <span className="text-2xl font-bold">Fitapp</span>
            </div>
            <p className="text-gray-400">
              LGBTQ+ Fitness Inspiration • Muscle Worship • Mindset • Wellness
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/about" className="hover:text-emerald-500 transition">About</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-500 transition">Contact</Link></li>
              <li><Link to="/articles" className="hover:text-emerald-500 transition">All Articles</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Stay Connected</h3>
            <p className="text-gray-400 mb-4">
              Made with <Heart className="inline w-5 h-5 text-red-500" /> for the community
            </p>
            <a href="mailto:budiputrajaya@outlook.com" className="flex items-center gap-2 text-gray-400 hover:text-emerald-500">
              <Mail className="w-5 h-5" />
              budiputrajaya@outlook.com
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          © 2025 Fitapp. All rights reserved. Built with love & protein.
        </div>
      </div>
    </footer>
  )
}

export default Footer