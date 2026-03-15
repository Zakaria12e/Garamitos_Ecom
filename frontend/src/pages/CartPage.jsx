import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, Minus, Tag, X, Loader2, Truck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useSettings } from '../context/SettingsContext'
import { promoApi } from '../lib/api'

export default function CartPage() {
  const { state, dispatch } = useApp()
  const { settings, loading: settingsLoading, calcShipping } = useSettings()
  const navigate = useNavigate()
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
      setPromoError(err.message || 'Invalid promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  if (state.cart.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-gray-400 mb-4">Your cart is empty</p>
      <Link to="/catalog" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md text-sm font-medium">
        Browse Products
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-6">
        Shopping Cart ({state.cart.reduce((s, i) => s + i.qty, 0)} items)
      </h1>

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
                  <p className="text-xs font-semibold mt-0.5">{item.price} MAD</p>
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
                <p className="text-xs font-semibold w-16 text-right">{(item.price * item.qty).toFixed(2)} MAD</p>
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
            <h2 className="text-sm font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                  {settingsLoading ? '…' : shipping === 0 ? 'Free' : shipping.toFixed(2) + ' MAD'}
                </span>
              </div>
              {state.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount ({state.promoCode?.code})</span>
                  <span>-{state.discount.toFixed(2)} MAD</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between font-semibold text-sm mb-4">
              <span>Total</span>
              <span>{total.toFixed(2)} MAD</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Checkout
            </button>
            {!settingsLoading && toFree > 0 && (
              <p className="text-[10px] text-gray-400 text-center mt-2">
                Free shipping on orders over {settings.freeShippingAt} MAD
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
