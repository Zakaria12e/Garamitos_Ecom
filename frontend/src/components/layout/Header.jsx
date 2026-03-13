import React from 'react'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-black dark:bg-white rounded flex items-center justify-center">
            <Shield size={14} className="text-white dark:text-black" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Garamitos</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 ml-4">
          <Link to="/catalog">Catalog</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/orders">Orders</Link>
        </nav>

      </div>
    </header>
  )
}