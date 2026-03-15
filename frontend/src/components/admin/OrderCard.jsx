import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ChevronDown, ChevronUp, User, MapPin, CreditCard, Box } from 'lucide-react'
import { ordersApi } from '../../lib/api'
import { STATUS_COLORS, ALLOWED_TRANSITIONS } from '../../constants/admin'
import { useTranslation } from 'react-i18next'

export default function OrderCard({ order, onStatusChange }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus]     = useState(order.status)
  const [saving, setSaving]     = useState(false)

  const handleStatus = async (val) => {
    setSaving(true)
    try {
      await ordersApi.updateStatus(order._id, val)
      setStatus(val)
      onStatusChange?.(order._id, val)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div layout className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-3">
      <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors shrink-0">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <div className="min-w-0">
            <p className="text-xs font-mono font-semibold">{order.orderNumber}</p>
            <p className="text-[10px] text-gray-400">
              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {order.items?.length} {t('admin.orders.items')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold">{t('common.currency')} {order.total.toFixed(2)}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_COLORS[status] || STATUS_COLORS.Processing}`}>
            {t(`orders.${status}`, status)}
          </span>
          {ALLOWED_TRANSITIONS[status]?.length > 0 && (
            <div className="relative">
              <select
                value=""
                onChange={e => e.target.value && handleStatus(e.target.value)}
                disabled={saving}
                className="text-xs border border-gray-200 dark:border-gray-800 rounded px-2 py-1 bg-white dark:bg-black focus:outline-none disabled:opacity-50"
              >
                <option value="" disabled>{t(`orders.${status}`, status)}</option>
                {ALLOWED_TRANSITIONS[status].map(s => (
                  <option key={s} value={s}>{t(`orders.${s}`, s)}</option>
                ))}
              </select>
              {saving && <Loader2 size={10} className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800">

                {/* Customer */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <User size={11} className="text-gray-400" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t('admin.orders.customer')}</p>
                  </div>
                  <p className="text-xs font-semibold">{order.shipping?.fullName}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{order.shipping?.email}</p>
                  {order.shipping?.phone && <p className="text-[11px] text-gray-500">{order.shipping.phone}</p>}
                </div>

                {/* Shipping */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={11} className="text-gray-400" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t('admin.orders.shipping')}</p>
                  </div>
                  <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-relaxed">
                    {order.shipping?.address}<br />
                    {order.shipping?.city}{order.shipping?.zip ? `, ${order.shipping.zip}` : ''}<br />
                    {order.shipping?.country}
                  </p>
                </div>

                {/* Payment */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CreditCard size={11} className="text-gray-400" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t('admin.orders.payment')}</p>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]"><span className="text-gray-500">{t('admin.orders.subtotal')}</span><span>{t('common.currency')} {order.subtotal?.toFixed(2)}</span></div>
                    {order.discount > 0 && <div className="flex justify-between text-[11px] text-green-600"><span>{t('admin.orders.discount')}</span><span>-{t('common.currency')} {order.discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-[11px]"><span className="text-gray-500">{t('admin.orders.shipping')}</span><span>{order.shippingCost === 0 ? t('admin.orders.free') : `${t('common.currency')} ${order.shippingCost?.toFixed(2)}`}</span></div>
                    <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-100 dark:border-gray-800"><span>{t('admin.orders.total')}</span><span>{t('common.currency')} {order.total.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <Box size={11} className="text-gray-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t('admin.orders.itemsSection')} ({order.items?.length})</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-950 rounded-lg p-2">
                      <img
                        src={item.image} alt={item.name}
                        className="w-12 h-12 rounded object-cover bg-gray-200 dark:bg-gray-800 shrink-0"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&q=60' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold leading-tight truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400">{item.brand}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[10px] text-gray-500">{t('admin.orders.qty')}: {item.qty}</span>
                          <span className="text-[11px] font-bold">{t('common.currency')} {(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
