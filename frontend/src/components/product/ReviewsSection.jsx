import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Loader2 } from 'lucide-react'
import { reviewsApi } from '../../lib/api'
import { useTranslation } from 'react-i18next'
import RatingBar from './RatingBar'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'

export default function ReviewsSection({ productId, product, onReviewSubmitted }) {
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [sort,     setSort]     = useState('newest')
  const [page,     setPage]     = useState(1)
  const [showForm, setShowForm] = useState(false)
  const { t } = useTranslation()

  const load = (s = sort, p = page) => {
    setLoading(true)
    reviewsApi.list(productId, { sort: s, page: p, limit: 5 })
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [productId])

  const handleSort = s => { setSort(s); setPage(1); load(s, 1) }
  const handlePage = p => {
    setPage(p)
    load(sort, p)
    window.scrollTo({ top: (document.getElementById('reviews-section')?.offsetTop ?? 0) - 80, behavior: 'smooth' })
  }
  const handleNewReview = () => {
    setShowForm(false)
    setPage(1)
    setSort('newest')
    load('newest', 1)
    onReviewSubmitted?.()
  }

  const avg   = product.rating  || 0
  const total = product.reviews || 0

  return (
    <section id="reviews-section" className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider">{t('productPage.reviews.title')}</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="text-xs bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          {showForm ? t('productPage.reviews.cancel') : t('productPage.reviews.write')}
        </button>
      </div>

      {total > 0 && data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <span className="text-5xl font-bold mb-1">{avg.toFixed(1)}</span>
            <div className="flex items-center gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map(n => (
                <Star
                  key={n}
                  size={13}
                  className={
                    n <= Math.round(avg)
                      ? 'fill-yellow-500 dark:fill-yellow-400 text-yellow-500 dark:text-yellow-400'
                      : 'text-gray-200 dark:text-gray-800'
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">{t('productPage.reviews.count_other', { count: total })}</span>
          </div>
          <div className="md:col-span-2 flex flex-col justify-center gap-2 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            {[5, 4, 3, 2, 1].map(n => (
              <RatingBar key={n} star={n} count={data.ratingBreakdown?.[n] || 0} total={total} />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <ReviewForm productId={productId} onSubmitted={handleNewReview} />
          </motion.div>
        )}
      </AnimatePresence>

      {total > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            {t('productPage.reviews.count_other', { count: data?.total || total })}
          </p>
          <select
            value={sort}
            onChange={e => handleSort(e.target.value)}
            className="text-xs border border-gray-200 dark:border-gray-800 rounded-md px-3 py-1.5 bg-white dark:bg-black focus:outline-none"
          >
            <option value="newest">{t('productPage.reviews.sort.newest')}</option>
            <option value="oldest">{t('productPage.reviews.sort.oldest')}</option>
            <option value="highest">{t('productPage.reviews.sort.highest')}</option>
            <option value="lowest">{t('productPage.reviews.sort.lowest')}</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2" />
        </div>
      ) : !data || data.reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <Star size={28} className="mx-auto text-yellow-300 dark:text-yellow-700 mb-3" />
          <p className="text-sm text-gray-400">{t('productPage.reviews.noReviews')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('productPage.reviews.beFirst')}</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-xs bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-md font-medium"
            >
              {t('productPage.reviews.write')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {data.reviews.map(r => <ReviewCard key={r._id} review={r} />)}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => handlePage(p)}
              className={
                'w-8 h-8 rounded text-xs font-medium transition-colors ' +
                (p === page
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950')
              }
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
