import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { ArrowRight, Shield, Truck, RotateCcw, Star, Zap } from 'lucide-react'
import { productsApi, normaliseProduct } from '../lib/api'
import ProductCard from '../components/ui/ProductCard'

const CATEGORY_ICONS = {
  'Surveillance Cameras': '📷',
  'Smart Home': '🏠',
  'Security Systems': '🔒',
  'Audio Equipment': '🎧',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function ProductSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-gray-900" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-1/2" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [featured, setFeatured] = useState([])
  const [security, setSecurity] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    Promise.all([
      productsApi.featured(),
      productsApi.list({ category: 'Surveillance Cameras,Security Systems', limit: 4 }),
      productsApi.categories(),
    ]).then(([featuredRes, securityRes, catsRes]) => {
      setFeatured((featuredRes.products || []).map(normaliseProduct))
      setSecurity((securityRes.products || []).map(normaliseProduct))
      setCategories(catsRes.categories || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-gray-200 dark:border-gray-800 overflow-hidden relative min-h-[420px] md:min-h-[500px] px-8">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-28 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl">
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full font-medium mb-6">
              <Zap size={11} /> Professional Security Solutions — 2025
            </motion.span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-none">
              Protect What<br /><span className="text-gray-400">Matters Most.</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
              Professional-grade surveillance cameras, smart security systems, and home protection solutions for homes and businesses.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to="/catalog" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                Shop Security <ArrowRight size={14} />
              </Link>
              <Link to="/catalog?category=Surveillance+Cameras" className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-800 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                View Cameras
              </Link>
            </div>
          </motion.div>

          {/* Camera illustration — switches with theme */}
          {mounted && (
            <motion.div
              className="hidden md:block absolute right-0 bottom-0 top-0 w-[380px] pointer-events-none select-none"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            >
              <img
                key={resolvedTheme}
                src='/camera-light.png'
                alt=""
                className="w-full h-full object-contain object-right dark:hidden"
              />
              <img
                key={resolvedTheme}
                src='/camera-dark.png'
                alt=""
                className="w-full h-full object-contain object-right hidden dark:block"
              />
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
