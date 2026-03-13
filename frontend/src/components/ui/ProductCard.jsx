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
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className="text-[10px] text-gray-400 mb-0.5">{product.brand}</p>
            <Link to={`/product/${product.id}`}>
              <h3 className="text-xs font-medium leading-snug hover:underline line-clamp-2">{product.name}</h3>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-1 mb-2 mt-1">
          <Star size={10} className="fill-yellow-500 dark:fill-yellow-400 text-yellow-500 dark:text-yellow-400" />
          <span className="text-[10px] font-medium">{product.rating}</span>
          <span className="text-[10px] text-gray-400">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold">{product.price} MAD</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">{product.originalPrice} MAD</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch({ type: 'ADD_TO_CART', product })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors ${inCart ? 'bg-gray-100 dark:bg-gray-900 text-gray-500' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'}`}
          >
            <ShoppingCart size={11} />
            {inCart ? 'In Cart' : 'Add'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }}
            onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', product })}
            className={`p-1.5 rounded border transition-colors ${inWishlist ? 'border-gray-300 dark:border-gray-600 text-red-500 dark:text-red-600' : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'}`}
          >
            <Heart size={11} className={inWishlist ? 'fill-current' : ''} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.85 }}
            onClick={() => dispatch({ type: 'TOGGLE_COMPARE', product })}
            className={`p-1.5 rounded border transition-colors ${inCompare ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'}`}
          >
            <BarChart2 size={11} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
