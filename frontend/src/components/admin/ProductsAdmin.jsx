import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { productsApi, normaliseProduct } from '../../lib/api'
import { EMPTY_PRODUCT_FORM } from '../../constants/admin'

export default function ProductsAdmin() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY_PRODUCT_FORM)

  const load = () => {
    setLoading(true)
    productsApi.list({ limit: 100 })
      .then(d => setProducts((d.products || []).map(normaliseProduct)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-base font-semibold mb-5">Products ({products.length})</h2>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2" />
        </div>
      )}
    </motion.div>
  )
}
