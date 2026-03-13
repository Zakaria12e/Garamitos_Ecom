import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Heart, BarChart2, Sun, Moon, Search, Shield, User, LogOut, Settings } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { state } = useApp()
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => setMounted(true), [])

  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0)
  const isDark = mounted && resolvedTheme === 'dark'

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate('/catalog?search=' + encodeURIComponent(search.trim()))
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
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
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">Admin</Link>
          )}
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

          <Link to="/wishlist" className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <Heart size={15} />
            <AnimatePresence>{state.wishlist.length > 0 && <motion.span initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 dark:bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{state.wishlist.length}</motion.span>}</AnimatePresence>
          </Link>

          <Link to="/compare" className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <BarChart2 size={15} />
            <AnimatePresence>{state.compareList.length > 0 && <motion.span initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold rounded-full flex items-center justify-center">{state.compareList.length}</motion.span>}</AnimatePresence>
          </Link>

          <Link to="/cart" className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <ShoppingCart size={15} />
            <AnimatePresence>{cartCount > 0 && <motion.span initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</motion.span>}</AnimatePresence>
          </Link>

          <div className="relative">
            {user ? (
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                <div className="w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white dark:text-black">{user.name?.[0]?.toUpperCase()}</span>
                </div>
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <User size={13} /> Login
              </Link>
            )}
            <AnimatePresence>
              {userMenuOpen && user && (
                <motion.div initial={{opacity:0,y:6,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:6,scale:0.97}} transition={{duration:0.15}}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-xs font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <ShoppingCart size={12} /> My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <Settings size={12} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-gray-200 dark:border-gray-800">
                    <LogOut size={12} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </header>
  )
}
