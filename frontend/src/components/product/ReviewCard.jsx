import React from 'react'
import { motion } from 'framer-motion'
import { Star, CheckCircle } from 'lucide-react'

export default function ReviewCard({ review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 dark:border-gray-800 rounded-xl p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white dark:text-black">
              {review.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold">{review.name}</span>
              {review.verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400">
              {new Date(review.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map(n => (
            <Star
              key={n}
              size={11}
              className={
                n <= review.rating
                  ? 'fill-yellow-500 dark:fill-yellow-400 text-yellow-500 dark:text-yellow-400'
                  : 'text-gray-200 dark:text-gray-800'
              }
            />
          ))}
        </div>
      </div>
      {review.title && <p className="text-xs font-semibold mb-1">{review.title}</p>}
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{review.body}</p>
    </motion.div>
  )
}
