import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'
import { ordersApi } from '../../lib/api'
import OrderCard from './OrderCard'
import { useTranslation } from 'react-i18next'

const STATUSES = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
const PAGE_SIZE = 5

export default function OrdersAdmin() {
  const { t } = useTranslation()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('All')
  const [page, setPage]       = useState(1)

  const load = (q = '') => {
    setLoading(true)
    ordersApi.all({ limit: 200, ...(q ? { search: q } : {}) })
      .then(d => setOrders(d.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const filtered = useMemo(() => {
    if (status === 'All') return orders
    return orders.filter(o => o.status === status)
  }, [orders, status])

  const handleStatus = (s) => { setStatus(s); setPage(1) }
  const handleSearch = (q) => { setSearch(q); setPage(1); load(q) }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="text-base font-semibold shrink-0">
          {t('admin.orders.title')} ({filtered.length})
        </h2>
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder={t('admin.orders.searchPlaceholder')}
          className="w-full max-w-xs text-xs border border-gray-200 dark:border-gray-800 rounded-md px-3 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
        />
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => handleStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              status === s
                ? 'bg-black dark:bg-white text-white dark:text-black'
                : 'border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {s === 'All' ? t('admin.orders.all') : t(`orders.${s}`)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => (
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
      ) : paginated.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <ShoppingBag size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-xs text-gray-400">{t('admin.orders.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map(order => <OrderCard key={order._id} order={order} />)}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-400">
            {t('admin.orders.page', { current: page, total: totalPages })}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ← {t('admin.orders.prev')}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                  n === page
                    ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                    : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('admin.orders.next')} →
            </button>
          </div>
        </div>
      )}

    </motion.div>
  )
}
