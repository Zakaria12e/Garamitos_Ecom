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
  return <div />
}
