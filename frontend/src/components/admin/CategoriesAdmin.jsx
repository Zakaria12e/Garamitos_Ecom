import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { categoriesApi } from '../../lib/api'

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  const load = () => {
    setLoading(true)
    categoriesApi.list()
      .then(d => setCategories(d.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold">Categories ({categories.length})</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2" />
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {categories.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{c.name}</p>
                <p className="text-[10px] text-gray-400">/{c.slug}{c.parent ? ` · parent: ${c.parent.name}` : ''}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 dark:bg-green-950 text-green-600' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}>
                {c.isActive ? 'active' : 'inactive'}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
