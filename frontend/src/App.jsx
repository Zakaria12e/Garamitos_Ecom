import React, { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { Analytics } from '@vercel/analytics/react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import { SaleProvider } from './context/SaleContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AuthPage   from './pages/AuthPage'
import AdminPage    from './pages/AdminPage'
import SettingsPage  from './pages/SettingsPage'
import CatalogPage   from './pages/CatalogPage'
import ProductPage   from './pages/ProductPage'
import CartPage      from './pages/CartPage'
import WishlistPage  from './pages/WishlistPage'
import CheckoutPage  from './pages/CheckoutPage'
import OrdersPage    from './pages/OrdersPage'
import GuestOrdersPage from './pages/GuestOrdersPage'

const DemoBanner = () => {
  const [visible, setVisible] = useState(() => sessionStorage.getItem('demoBannerDismissed') !== '1')
  if (!visible) return null
  return (
    <div className="bg-black dark:bg-white text-white dark:text-black text-xs text-center py-2 px-4 flex items-center justify-center gap-3">
      <span>
        <span className="font-semibold">Portfolio Demo</span>
        {' '}— data may reset periodically.{' '}
        <a href="/login" className="underline underline-offset-2 hover:opacity-70">Try demo accounts →</a>
      </span>
      <button
        onClick={() => { sessionStorage.setItem('demoBannerDismissed', '1'); setVisible(false) }}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity leading-none"
        aria-label="Dismiss"
      >✕</button>
    </div>
  )
}

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.22 }}
  >
    {children}
  </motion.div>
)

export default function App() {
  const location = useLocation()

  /* ── Lenis smooth scroll ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])
  const pageKey = '/' + location.pathname.split('/')[1]
  return (
    <AppProvider>
      <SaleProvider>
      <div className="min-h-screen flex flex-col">
        <DemoBanner />
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={pageKey}>
              <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
              <Route path="/catalog"    element={<PageWrapper><CatalogPage /></PageWrapper>} />
              <Route path="/product/:id" element={<PageWrapper><ProductPage /></PageWrapper>} />
              <Route path="/cart"       element={<PageWrapper><CartPage /></PageWrapper>} />
              <Route path="/wishlist"   element={<PageWrapper><WishlistPage /></PageWrapper>} />
              <Route path="/checkout"  element={<PageWrapper><CheckoutPage /></PageWrapper>} />
              <Route path="/orders"   element={<PageWrapper><OrdersPage /></PageWrapper>} />
              <Route path="/track-order" element={<PageWrapper><GuestOrdersPage /></PageWrapper>} />
              <Route path="/login"     element={<PageWrapper><AuthPage /></PageWrapper>} />
              <Route path="/admin/*"    element={<PageWrapper><AdminPage /></PageWrapper>} />
              <Route path="/settings"  element={<PageWrapper><SettingsPage /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <Analytics />
      </div>
      </SaleProvider>
    </AppProvider>
  )
}
