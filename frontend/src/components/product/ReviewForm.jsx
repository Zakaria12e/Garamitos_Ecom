import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ThumbsUp, CheckCircle } from 'lucide-react'
import { reviewsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import StarPicker from './StarPicker'

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-xs font-medium mb-1">{label}</label>
    <input
      {...props}
      className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white transition-colors"
    />
  </div>
)

export default function ReviewForm({ productId, onSubmitted }) {
  const { user } = useAuth()
  const [name,    setName]    = useState(user?.name  || '')
  const [email,   setEmail]   = useState(user?.email || '')
  const [rating,  setRating]  = useState(0)
  const [title,   setTitle]   = useState('')
  const [body,    setBody]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (!rating) { setError('Please select a rating'); return }
    if (body.trim().length < 10) { setError('Review must be at least 10 characters'); return }
    setError('')
    setLoading(true)
    try {
      const res = await reviewsApi.create(productId, { name, email, rating, title, body })
      setDone(true)
      onSubmitted?.(res.review)
    } catch (err) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 rounded-xl p-6 text-center"
    >
      <CheckCircle size={28} className="mx-auto text-green-600 dark:text-green-400 mb-2" />
      <p className="text-sm font-semibold text-green-700 dark:text-green-400">Review submitted!</p>
      <p className="text-xs text-gray-500 mt-1">Thank you for your feedback.</p>
    </motion.div>
  )

  return (
    <form onSubmit={submit} className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold">Write a Review</h3>

      <div>
        <label className="block text-xs font-medium mb-2">Your Rating *</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Your Name *" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required />
        <Field label="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" required />
      </div>

      <Field label="Review Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize your experience" />

      <div>
        <label className="block text-xs font-medium mb-1">Your Review *</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          placeholder="Tell others what you think about this product…"
          className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
        />
        <p className="text-[10px] text-gray-400 mt-0.5">{body.length}/1000 · min 10 characters</p>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
