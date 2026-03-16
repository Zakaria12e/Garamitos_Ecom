import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Heart, Globe, Sun, Moon, Search, Shield, Menu, X, User, LogOut, Settings, LayoutDashboard } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'ar', label: 'AR', flag: '🇲🇦' },
]

export default function Header() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { state } = useApp()
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
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
          <Link to="/catalog" className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t('nav.catalog')}</Link>
          <Link to="/orders" className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t('nav.orders')}</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t('nav.admin')}</Link>
          )}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs ml-auto">
          <div className="relative w-full">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('header.search')} className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-900 rounded-md border border-transparent focus:border-gray-300 dark:focus:border-gray-700 focus:outline-none transition-colors" />
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto md:ml-0">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            {mounted ? (isDark ? <Sun size={15} /> : <Moon size={15} />) : <Moon size={15} />}
          </motion.button>

          <Link to="/wishlist" className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <Heart size={15} />
            <AnimatePresence>{state.wishlist.length > 0 && <motion.span initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 dark:bg-red-600 text-white dark:text-white text-[9px] font-bold rounded-full flex items-center justify-center">{state.wishlist.length}</motion.span>}</AnimatePresence>
          </Link>

          <div className="relative">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setLangMenuOpen(o => !o); setUserMenuOpen(false) }} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
              <Globe size={15} />
            </motion.button>
            <AnimatePresence>
              {langMenuOpen && (
                <motion.div initial={{opacity:0,y:6,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:6,scale:0.97}} transition={{duration:0.15}}
                  className="absolute end-0 top-full mt-1.5 w-36 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                  {LANGS.map(({ code, label, flag }) => (
                    <button
                      key={code}
                      onClick={() => { i18n.changeLanguage(code); setLangMenuOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                        i18n.language === code
                          ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      <span>{flag}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/cart" className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <ShoppingCart size={15} />
            <AnimatePresence>{cartCount > 0 && <motion.span initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</motion.span>}</AnimatePresence>
          </Link>

          <div className="relative">
            {user ? (
              <button onClick={() => { setUserMenuOpen(o => !o); setLangMenuOpen(false) }} className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                <div className="w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white dark:text-black">{user.name?.[0]?.toUpperCase()}</span>
                </div>
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <User size={13} /> {t('nav.login')}
              </Link>
            )}
            <AnimatePresence>
              {userMenuOpen && user && (
                <motion.div initial={{opacity:0,y:6,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:6,scale:0.97}} transition={{duration:0.15}}
                  className="absolute end-0 top-full mt-1.5 w-48 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-xs font-semibold truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <ShoppingCart size={12} /> {t('auth.myOrders')}
                  </Link>
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <Settings size={12} /> {t('auth.settings')}
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <LayoutDashboard size={12} /> {t('auth.adminPanel')}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-gray-200 dark:border-gray-800">
                    <LogOut size={12} /> {t('auth.logout')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900">
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-4 py-3 flex flex-col gap-3 overflow-hidden">
            <form onSubmit={handleSearch} className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('header.search')} className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-900 rounded-md border border-transparent focus:outline-none" />
            </form>
            {[[t('nav.catalog'), '/catalog'], [t('nav.orders'), '/orders'], ...(user?.role === 'admin' ? [[t('nav.admin'), '/admin']] : [])].map(([label, path]) => (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)} className="text-sm text-gray-600 dark:text-gray-400">{label}</Link>
            ))}
            {user
              ? <button onClick={handleLogout} className="text-sm text-red-500 text-left">{t('auth.logout')} ({user.name})</button>
              : <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-gray-600 dark:text-gray-400">{t('nav.login')} / Register</Link>
            }
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
