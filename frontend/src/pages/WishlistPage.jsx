import React from 'react'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingCart } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTranslation } from 'react-i18next'

export default function WishlistPage() {
  const { state, dispatch } = useApp()
  const { t } = useTranslation()

  if (state.wishlist.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-gray-400 mb-4">{t('wishlist.empty')}</p>
      <Link to="/catalog" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md text-sm font-medium">
        {t('wishlist.browseProducts')}
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-6">{t('wishlist.title', { count: state.wishlist.length })}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {state.wishlist.map(product => (
          <div key={product.id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <Link to={'/product/' + product.id}>
              <img
                src={product.image}
                alt={product.name}
                className="w-full aspect-square object-cover bg-gray-50 dark:bg-gray-950 hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <div className="p-3">
              <p className="text-[10px] text-gray-400">{product.brand}</p>
              <Link to={'/product/' + product.id}>
                <h3 className="text-xs font-medium hover:underline line-clamp-2">{product.name}</h3>
              </Link>
              <p className="text-sm font-semibold mt-1 mb-3">{product.price} {t('common.currency')}</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    dispatch({ type: 'ADD_TO_CART', product })
                    dispatch({ type: 'TOGGLE_WISHLIST', product })
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <ShoppingCart size={11} /> {t('wishlist.addToCart')}
                </button>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', product })}
                  className="p-1.5 border border-gray-200 dark:border-gray-800 rounded hover:border-red-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
