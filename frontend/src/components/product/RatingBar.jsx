import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function RatingBar({ star, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right text-gray-500">{star}</span>
      <Star size={10} className="fill-gray-400 text-gray-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-black dark:bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: pct + '%' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
      </div>
      <span className="w-6 text-gray-400 text-right">{count}</span>
    </div>
  )
}
