import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Shield, Search, Sun, Moon } from 'lucide-react'

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate('/catalog?search=' + encodeURIComponent(search.trim()))
      setSearch('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <motion.div whileHover={{ scale: 1.1 }} className="w-7 h-7 bg-black dark:bg-white rounded flex items-center justify-center">
            <Shield size={14} className="text-white dark:text-black" />
          </motion.div>
          <span className="font-semibold text-sm tracking-tight">Garamitos</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 ml-4">
          <Link to="/catalog" className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Catalog</Link>
          <Link to="/compare" className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Compare</Link>
          <Link to="/orders" className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Orders</Link>
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs ml-auto">
          <div className="relative w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cameras, security..." className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-900 rounded-md border border-transparent focus:border-gray-300 dark:focus:border-gray-700 focus:outline-none transition-colors" />
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto md:ml-0">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            {mounted ? (isDark ? <Sun size={15} /> : <Moon size={15} />) : <Moon size={15} />}
          </motion.button>
        </div>

      </div>
    </header>
  )
}
