import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingCart, Heart, BarChart2, Star,
  ChevronRight, Minus, Plus, Loader2,
} from 'lucide-react'
import { productsApi, normaliseProduct } from '../lib/api'
import { useApp } from '../context/AppContext'
import { useSettings } from '../context/SettingsContext'
import { useTranslation } from 'react-i18next'
import ProductCard from '../components/ui/ProductCard'
import ReviewsSection from '../components/product/ReviewsSection'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const { settings } = useSettings()
  const { t } = useTranslation()

  const [product,   setProduct]   = useState(null)
  const [related,   setRelated]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [qty,       setQty]       = useState(1)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setLoading(true)
    setActiveImg(0)
    setQty(1)
    Promise.all([productsApi.get(id), productsApi.related(id)])
      .then(([pRes, rRes]) => {
        setProduct(normaliseProduct(pRes.product))
        setRelated((rRes.products || []).map(normaliseProduct))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleReviewSubmitted = () => {
    productsApi.get(id).then(r => setProduct(normaliseProduct(r.product))).catch(console.error)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400">
      <Loader2 size={20} className="animate-spin mr-2" /> {t('common.loading')}
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">
      {t('productPage.notFound')}
    </div>
  )

  const inWishlist = state.wishlist.some(i => i.id === product.id)
  const inCompare  = state.compareList.some(i => i.id === product.id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link to="/" className="hover:text-black dark:hover:text-white">{t('nav.home')}</Link>
        <ChevronRight size={11} />
        <Link to="/catalog" className="hover:text-black dark:hover:text-white">{t('nav.catalog')}</Link>
        <ChevronRight size={11} />
        <Link
          to={'/catalog?category=' + encodeURIComponent(product.category?.slug || product.category)}
          className="hover:text-black dark:hover:text-white"
        >
          {product.category?.name || product.category}
        </Link>
        <ChevronRight size={11} />
        <span className="text-black dark:text-white truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">

        {/* Gallery */}
        <div>
          <div className="aspect-square border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-950 mb-3">
            <motion.img
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              src={product.images?.[activeImg] || product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mb-6">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={
                    'w-16 h-16 rounded border-2 overflow-hidden transition-all ' +
                    (activeImg === i
                      ? 'border-black dark:border-white'
                      : 'border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100')
                  }
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Specifications */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500 dark:text-gray-400">
                {t('productPage.specifications')}
              </h2>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {Object.entries(product.specs).map(([key, val], i) => (
                  <div
                    key={key}
                    className={'flex ' + (i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-950' : 'bg-white dark:bg-black')}
                  >
                    <div className="w-36 px-3 py-2 text-[11px] font-medium text-gray-500 shrink-0 border-r border-gray-200 dark:border-gray-800">
                      {key}
                    </div>
                    <div className="px-3 py-2 text-[11px]">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <p className="text-xs text-gray-400 mb-1">
            {product.brand} · {product.category?.name || product.category}
          </p>
          <h1 className="text-xl font-bold mb-3">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.round(product.rating)
                      ? 'fill-yellow-500 dark:fill-yellow-400 text-yellow-500 dark:text-yellow-400'
                      : 'text-gray-300 dark:text-gray-700'
                  }
                />
              ))}
            </div>
            <a href="#reviews-section" className="text-xs text-gray-500 hover:underline">
              {product.rating > 0 ? `${product.rating} · ` : ''}{product.reviews} review{product.reviews !== 1 ? 's' : ''}
            </a>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold">{product.price} MAD</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-sm text-gray-400 line-through">{product.originalPrice} MAD</span>
                <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded font-medium">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Stock badge */}
          <div className="mb-4">
            <span className={
              'text-xs px-2 py-1 rounded font-medium ' +
              (product.stock > 10
                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                : product.stock > 0
                  ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400')
            }>
              {product.stock > 10 ? t('productPage.inStock') : product.stock > 0 ? t('productPage.onlyLeft', { count: product.stock }) : t('productPage.outOfStock')}
            </span>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Qty + Actions */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="px-4 text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { dispatch({ type: 'ADD_TO_CART', product, qty }); navigate('/cart') }}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-40"
            >
              <ShoppingCart size={14} /> {t('productPage.addToCart')}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', product })}
              className={'p-2 border rounded-md transition-colors ' + (inWishlist
                ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                : 'border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white')}
            >
              <Heart size={14} className={inWishlist ? 'fill-current' : ''} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_COMPARE', product })}
              className={'p-2 border rounded-md transition-colors ' + (inCompare
                ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                : 'border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white')}
            >
              <BarChart2 size={14} />
            </motion.button>
          </div>

          <p className="text-[10px] text-gray-400 mt-2">
            {t('productPage.freeShipping', { amount: settings.freeShippingAt })}
          </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">{t('productPage.relatedProducts')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <ReviewsSection productId={id} product={product} onReviewSubmitted={handleReviewSubmitted} />
    </div>
  )
}
