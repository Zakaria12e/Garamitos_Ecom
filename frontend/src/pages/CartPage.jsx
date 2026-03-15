import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, Tag, X, Loader2, Truck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useSettings } from '../context/SettingsContext'
import { promoApi } from '../lib/api'
import { useTranslation } from 'react-i18next'

export default function CartPage() {
  const { state, dispatch } = useApp()
  const { settings, loading: settingsLoading, calcShipping } = useSettings()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const subtotal = state.cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shipping  = calcShipping(subtotal)
  const total     = Math.max(0, subtotal + shipping - state.discount)
  const toFree    = Math.max(0, settings.freeShippingAt - subtotal)

  const applyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoError('')
    setPromoLoading(true)
    try {
      const data = await promoApi.validate(promoInput.trim(), subtotal)
      dispatch({ type: 'APPLY_PROMO', promo: data.promo, discount: data.promo.discount })
      setPromoInput('')
    } catch (err) {
      setPromoError(err.message || t('cart.invalidPromo'))
    } finally {
      setPromoLoading(false)
    }
  }

  if (state.cart.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-gray-400 mb-4">{t('cart.empty')}</p>
      <Link to="/catalog" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md text-sm font-medium">
        {t('cart.browseProducts')}
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-6">
        {t('cart.titleCount', { count: state.cart.reduce((s, i) => s + i.qty, 0) })}
      </h1>

      {/* Free shipping progress */}
      {!settingsLoading && toFree > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 border border-gray-200 dark:border-gray-800 rounded-lg p-3 flex items-center gap-3"
        >
          <Truck size={15} className="text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
              {t('cart.freeShippingProgress', { amount: toFree.toFixed(2) })}
            </p>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-black dark:bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (subtotal / settings.freeShippingAt) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
      {!settingsLoading && toFree === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg p-3 flex items-center gap-2"
        >
          <Truck size={15} className="text-green-600 dark:text-green-400" />
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">{t('cart.freeShippingUnlocked')}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {state.cart.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                className="flex items-center gap-4 border border-gray-200 dark:border-gray-800 rounded-lg p-3"
              >
                <Link to={'/product/' + item.id}>
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-gray-100 dark:bg-gray-900" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={'/product/' + item.id}>
                    <p className="text-xs font-medium truncate hover:underline">{item.name}</p>
                  </Link>
                  <p className="text-xs text-gray-400">{item.brand}</p>
                  <p className="text-xs font-semibold mt-0.5">{item.price} {t('common.currency')}</p>
                </div>
                <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.qty - 1 })}
                    className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="px-3 text-xs font-medium">{item.qty}</span>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.qty + 1 })}
                    className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-900"
                  >
                    <Plus size={11} />
                  </button>
                </div>
                <p className="text-xs font-semibold w-16 text-right">{(item.price * item.qty).toFixed(2)} {t('common.currency')}</p>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_FROM_CART', id: item.id })}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          {/* Order summary */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-4">{t('cart.orderSummary')}</h2>
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cart.subtotal')}</span>
                <span>{subtotal.toFixed(2)} {t('common.currency')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cart.shipping')}</span>
                <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  {settingsLoading ? '…' : shipping === 0 ? t('cart.free') : `${shipping.toFixed(2)} ${t('common.currency')}`}
                </span>
              </div>
              {state.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>{t('cart.discount')} ({state.promoCode?.code})</span>
                  <span>-{state.discount.toFixed(2)} {t('common.currency')}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-semibold text-sm mb-4">
              <span>{t('cart.total')}</span>
              <span>{total.toFixed(2)} {t('common.currency')}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              {t('cart.checkout')}
            </button>
            {!settingsLoading && toFree > 0 && (
              <p className="text-[10px] text-gray-400 text-center mt-2">
                {t('cart.freeShippingNote', { amount: settings.freeShippingAt })}
              </p>
            )}
          </div>
          {/* Promo code */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <h3 className="text-xs font-semibold mb-3 flex items-center gap-1.5">
              <Tag size={12} /> {t('cart.promoCode')}
            </h3>
            {state.promoCode ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 rounded-md px-3 py-2">
                <div>
                  <span className="text-xs font-mono font-semibold text-green-700 dark:text-green-400">{state.promoCode.code}</span>
                  <span className="text-[10px] text-green-600 dark:text-green-500 ml-2">{state.promoCode.label}</span>
                </div>
                <button onClick={() => dispatch({ type: 'REMOVE_PROMO' })}>
                  <X size={12} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyPromo()}
                  placeholder={t('cart.enterCode')}
                  className="flex-1 text-xs border border-gray-200 dark:border-gray-800 rounded-md px-3 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                />
                <button
                  onClick={applyPromo}
                  disabled={promoLoading}
                  className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-md font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {promoLoading ? <Loader2 size={11} className="animate-spin" /> : t('cart.apply')}
                </button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-500 mt-1">{promoError}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
