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
    <div className="group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-gray-400 dark:hover:border-gray-600 transition-colors bg-white dark:bg-black" />
  )
}
