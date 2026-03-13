import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ordersApi, productsApi } from '../../lib/api'
import { STATUS_COLORS } from '../../constants/admin'

export default function Dashboard() {
  const [stats, setStats]       = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([ordersApi.stats(), productsApi.list({ limit: 100 })])
      .then(([statsRes, prodRes]) => {
        setStats(statsRes.stats)
        setProducts(prodRes.products || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <Loader2 size={18} className="animate-spin mr-2" />
    </div>
  )

  const cards = [
    { label: 'Total Revenue', value: `${(stats?.totalRevenue || 0).toFixed(2)} MAD` },
    { label: 'Total Orders',  value: stats?.totalOrders || 0 },
    { label: 'Products',      value: products.length },
    { label: 'Processing',    value: stats?.statusBreakdown?.Processing || 0 },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-base font-semibold mb-5">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
          >
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-semibold">Recent Orders</h3>
        </div>

        {(stats?.recentOrders || []).length === 0 ? (
          <p className="text-center py-8 text-xs text-gray-400">No orders yet</p>
        ) : (
          stats.recentOrders.map(order => (
            <div
              key={order._id}
              className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 last:border-0"
            >
              <span className="text-xs font-mono">{order.orderNumber}</span>
              <span className="text-xs text-gray-500">{order.shipping?.email}</span>
              <span className="text-xs font-semibold">MAD {order.total.toFixed(2)}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.Processing}`}>
                {order.status}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
