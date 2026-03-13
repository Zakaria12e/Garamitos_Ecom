import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, BarChart2, ShoppingCart, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ProductCard({ product }) {
  const { state, dispatch } = useApp()
  const inWishlist = state.wishlist.some(i => i.id === product.id)
  const inCompare = state.compareList.some(i => i.id === product.id)
  const inCart = state.cart.some(i => i.id === product.id)

  return (
    <div className="group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-white dark:bg-black">
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-950">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.originalPrice > product.price && (
          <span className="absolute top-2 left-2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-semibold px-2 py-0.5 rounded">
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
        {product.stock <= 5 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded">Low Stock</span>
        )}
      </Link>
    </div>
  )
}
