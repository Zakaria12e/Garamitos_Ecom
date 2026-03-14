import React from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AuthPage   from './pages/AuthPage'
import AdminPage    from './pages/AdminPage'
import SettingsPage from './pages/SettingsPage'

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
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
              <Route path="/login"     element={<PageWrapper><AuthPage /></PageWrapper>} />
              <Route path="/admin/*"    element={<PageWrapper><AdminPage /></PageWrapper>} />
              <Route path="/settings"  element={<PageWrapper><SettingsPage /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <Analytics />
      </div>
    </AppProvider>
  )
}
