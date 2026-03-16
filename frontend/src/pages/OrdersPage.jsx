import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Package, MapPin, CreditCard, Loader2, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ordersApi } from '../lib/api'

function CancelModal({ orderNumber, onConfirm, onClose, loading }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
            <XCircle size={18} className="text-red-500" />
          </div>
          <h2 className="text-sm font-semibold">{t('orders.cancelOrder')}</h2>
        </div>
        <p className="text-xs text-gray-500 mb-1">{t('orders.cancelConfirm')}</p>
        <p className="text-xs font-mono text-gray-400 mb-5">{orderNumber}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-200 dark:border-gray-800 py-2 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-xs font-medium disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {loading ? t('orders.cancelling') : t('orders.cancelOrder')}
          </button>
        </div>
      </div>
    </div>
  )
}

const STATUS_STYLES = {
  Processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Shipped:    'bg-blue-100  text-blue-800  dark:bg-blue-900/30  dark:text-blue-400',
  Delivered:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Cancelled:  'bg-red-100   text-red-800   dark:bg-red-900/30   dark:text-red-400',
}

function OrderCard({ order, onCancelled }) {
  const { t } = useTranslation()
  const [open, setOpen]             = useState(false)
  const [showModal, setShowModal]   = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const currency = t('common.currency')

  const confirmCancel = async () => {
    setCancelling(true)
    try {
      const data = await ordersApi.cancelOrder(order._id)
      onCancelled(data.order)
      setShowModal(false)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <>
    {showModal && (
      <CancelModal
        orderNumber={order.orderNumber}
        onConfirm={confirmCancel}
        onClose={() => setShowModal(false)}
        loading={cancelling}
      />
    )}
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-mono font-semibold text-black dark:text-white">
            {order.orderNumber}
          </span>
          <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + (STATUS_STYLES[order.status] || '')}>
            {t(`orders.${order.status}`)}
          </span>
          {order.status === 'Processing' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 transition-colors"
            >
              <XCircle size={11} />
              {t('orders.cancelOrder')}
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold hidden sm:block">
            {order.total.toFixed(2)} {currency}
          </span>
          <span className="text-[10px] text-gray-400 hidden sm:block">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={() => setOpen(o => !o)}
            className="text-[10px] flex items-center gap-1 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            {open ? t('orders.hideDetails') : t('orders.viewDetails')}
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Mobile total + date */}
      <div className="flex items-center justify-between px-4 py-2 sm:hidden text-xs text-gray-500 border-b border-gray-100 dark:border-gray-900">
        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        <span className="font-semibold text-black dark:text-white">{order.total.toFixed(2)} {currency}</span>
      </div>

      {/* Items preview (always visible) */}
      <div className="px-4 py-3 flex gap-2 flex-wrap">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <img src={item.image} alt={item.name} className="w-9 h-9 rounded object-cover bg-gray-100 dark:bg-gray-900 shrink-0" />
            {!open && <span className="text-xs text-gray-500 truncate max-w-[120px]">{item.name} ×{item.qty}</span>}
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-900 px-4 py-4 space-y-4 text-xs">

          {/* Items */}
          <div>
            <p className="font-semibold mb-2 flex items-center gap-1.5"><Package size={13} />{t('orders.orderItems')}</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover bg-gray-100 dark:bg-gray-900 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.brand} · ×{item.qty}</p>
                  </div>
                  <span className="font-medium shrink-0">{(item.price * item.qty).toFixed(2)} {currency}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="border border-gray-100 dark:border-gray-900 rounded-lg p-3 space-y-1.5">
            <div className="flex justify-between text-gray-500"><span>{t('orders.subtotal')}</span><span>{order.subtotal.toFixed(2)} {currency}</span></div>
            <div className="flex justify-between text-gray-500">
              <span>{t('orders.shipping')}</span>
              <span>{order.shippingCost === 0 ? t('orders.free') : `${order.shippingCost.toFixed(2)} ${currency}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>{t('orders.discount')}</span>
                <span>-{order.discount.toFixed(2)} {currency}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-sm pt-1 border-t border-gray-100 dark:border-gray-900">
              <span>{t('orders.total')}</span>
              <span>{order.total.toFixed(2)} {currency}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shipping address */}
            <div>
              <p className="font-semibold mb-1.5 flex items-center gap-1.5"><MapPin size={13} />{t('orders.shippingAddress')}</p>
              <p className="text-gray-500 leading-relaxed">
                {order.shipping.fullName}<br />
                {order.shipping.address}, {order.shipping.city}{order.shipping.zip ? ` ${order.shipping.zip}` : ''}<br />
                {order.shipping.country}<br />
                {order.shipping.phone}
              </p>
            </div>

            {/* Payment */}
            <div>
              <p className="font-semibold mb-1.5 flex items-center gap-1.5"><CreditCard size={13} />{t('orders.paymentMethod')}</p>
              <p className="text-gray-500">{order.paymentMethod}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

const PAGE_SIZE = 3

export default function OrdersPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [page, setPage]       = useState(1)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    ordersApi.myOrders()
      .then(data => setOrders(data.orders || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  const totalPages  = Math.ceil(orders.length / PAGE_SIZE)
  const paginated   = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-gray-400 mb-4">{t('orders.loginRequired')}</p>
      <Link to="/login" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md text-sm font-medium">
        {t('nav.login')}
      </Link>
      <p className="text-xs text-gray-400 mt-6 mb-2">{t('orders.guestCheckout')}</p>
      <Link to="/track-order" className="text-xs font-medium underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors">
        {t('orders.trackOrder')}
      </Link>
    </div>
  )

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <Loader2 size={20} className="animate-spin text-gray-400" />
    </div>
  )

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-sm text-red-500">{error}</p>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-lg font-semibold mb-6">{t('orders.title')}</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-gray-400 mb-1">{t('orders.empty')}</p>
          <p className="text-xs text-gray-400 mb-6">{t('orders.emptyDesc')}</p>
          <Link to="/catalog" className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-md text-sm font-medium">
            {t('orders.shopNow')}
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                onCancelled={updated =>
                  setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 text-xs">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-950 disabled:opacity-40 transition-colors"
              >
                {t('orders.prev')}
              </button>
              <span className="text-gray-400">{t('orders.page', { current: page, total: totalPages })}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-950 disabled:opacity-40 transition-colors"
              >
                {t('orders.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
