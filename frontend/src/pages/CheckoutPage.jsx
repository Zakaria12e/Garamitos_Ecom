import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { ordersApi } from '../lib/api'
import ShippingForm from '../components/checkout/ShippingForm'
import PaymentStep from '../components/checkout/PaymentStep'
import OrderSummary from '../components/checkout/OrderSummary'
import OrderConfirmation from '../components/checkout/OrderConfirmation'

const STEPS = ['Shipping', 'Payment']

export default function CheckoutPage() {
  const { state, dispatch } = useApp()
  const { user } = useAuth()
  const { calcShipping } = useSettings()

  const [step, setStep]           = useState(1)
  const [done, setDone]           = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    email:    user?.email || '',
    phone:    '+212',
    city:     '',
    address:  '',
    zip:      '',
    country:  'Morocco',
  })

  const subtotal     = state.cart.reduce((s, i) => s + i.price * i.qty, 0)
  const shippingCost = calcShipping(subtotal)
  const total        = Math.max(0, subtotal + shippingCost - state.discount)

  if (state.cart.length === 0 && !done) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-gray-400 mb-4">Cart is empty</p>
      <Link to="/catalog" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md text-sm font-medium">
        Shop Now
      </Link>
    </div>
  )

  if (done && orderData) return (
    <OrderConfirmation orderNumber={orderData.orderNumber} email={shipping.email} />
  )

  const submitOrder = async () => {
    setLoading(true)
    setError('')
    try {
      const items = state.cart.map(i => ({ productId: i.id || i._id, qty: i.qty }))
      const data = await ordersApi.place({
        items,
        shipping,
        promoCode: state.promoCode?.code || null,
        shippingCost,
      })
      setOrderData(data.order)
      dispatch({ type: 'CLEAR_CART' })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-2">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 text-xs">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <span className={'font-medium ' + (step === i + 1 ? 'text-black dark:text-white' : 'text-gray-400')}>
              {i + 1}. {s}
            </span>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <ShippingForm
              shipping={shipping}
              setShipping={setShipping}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <PaymentStep
              shipping={shipping}
              total={total}
              loading={loading}
              error={error}
              onBack={() => setStep(1)}
              onSubmit={submitOrder}
            />
          )}
        </div>

        <OrderSummary
          cart={state.cart}
          subtotal={subtotal}
          shippingCost={shippingCost}
          discount={state.discount}
          total={total}
        />
      </div>
    </div>
  )
}
