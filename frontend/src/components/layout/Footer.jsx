import React from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
              <Shield size={12} className="text-white dark:text-black" />
            </div>
            <span className="font-semibold text-sm">Garamitos</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Premium surveillance and smart home tech for professionals and enthusiasts.</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider">Shop</h4>
          {['Surveillance Cameras', 'Drones', 'Smart Home', 'Audio Equipment'].map(c => (
            <Link key={c} to={"/catalog?category=" + encodeURIComponent(c)} className="block text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-1.5 transition-colors">{c}</Link>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider">Account</h4>
          {[['Orders', '/orders'], ['Wishlist', '/wishlist'], ['Compare', '/compare'], ['Cart', '/cart']].map(([l, p]) => (
            <Link key={p} to={p} className="block text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white mb-1.5 transition-colors">{l}</Link>
          ))}
        </div>
       
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 py-4 px-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Garamitos. All rights reserved.
      </div>
    </footer>
  )
}
