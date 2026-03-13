import { useState, useEffect } from 'react'
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

  return (
    <div>
      <h2 className="text-base font-semibold mb-5">Dashboard</h2>
    </div>
  )
}
