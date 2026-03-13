import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ordersApi, productsApi } from '../../lib/api'

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
    </motion.div>
  )
}
