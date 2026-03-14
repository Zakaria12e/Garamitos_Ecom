import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'
import { ordersApi } from '../../lib/api'
import OrderCard from './OrderCard'
import { useTranslation } from 'react-i18next'

export default function OrdersAdmin() {
  const { t } = useTranslation()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  const load = (q = '') => {
    setLoading(true)
    ordersApi.all({ limit: 50, ...(q ? { search: q } : {}) })
      .then(d => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(() => load(), [])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-5 gap-3">
        <h2 className="text-base font-semibold shrink-0">{t('admin.orders.title')} ({orders.length})</h2>
        <div className="relative max-w-xs w-full">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); load(e.target.value) }}
            placeholder={t('admin.orders.searchPlaceholder')}
            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-md pl-3 pr-3 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-7 w-28 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <ShoppingBag size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-xs text-gray-400">{t('admin.orders.noOrders')}</p>
        </div>
      ) : (
        orders.map(order => <OrderCard key={order._id} order={order} />)
      )}
    </motion.div>
  )
}
