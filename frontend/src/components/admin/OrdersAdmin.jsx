import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ShoppingBag } from 'lucide-react'
import { ordersApi } from '../../lib/api'
import OrderCard from './OrderCard'

export default function OrdersAdmin() {
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
        <h2 className="text-base font-semibold shrink-0">Orders ({orders.length})</h2>
        <div className="relative max-w-xs w-full">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); load(e.target.value) }}
            placeholder="Search by order # or email…"
            className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-md pl-3 pr-3 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
          <ShoppingBag size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-xs text-gray-400">No orders yet</p>
        </div>
      ) : (
        orders.map(order => <OrderCard key={order._id} order={order} />)
      )}
    </motion.div>
  )
}
