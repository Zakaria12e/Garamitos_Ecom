import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { ordersApi } from '../../lib/api'
import { Skeleton } from '../ui/Skeleton'
import { RETURN_REASONS } from '../../constants/admin'

const REASON_COLORS = {
  'No Answer':    'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  'Refused':      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  'Unreachable':  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  'Wrong Address':'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
}

function RateBar({ rate }) {
  const color = rate >= 50 ? 'bg-red-500' : rate >= 25 ? 'bg-orange-400' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(rate, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className={`text-xs font-bold w-10 text-right ${
        rate >= 50 ? 'text-red-500' : rate >= 25 ? 'text-orange-500' : 'text-green-500'
      }`}>
        {rate}%
      </span>
    </div>
  )
}

export default function ReturnsAdmin() {
  const [stats, setStats]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.returnStats()
      .then(d => setStats(d.stats || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalShipped  = stats.reduce((s, c) => s + c.total, 0)
  const totalReturned = stats.reduce((s, c) => s + c.returned, 0)
  const globalRate    = totalShipped ? Math.round((totalReturned / totalShipped) * 100 * 10) / 10 : 0

  const reasonCounts = RETURN_REASONS.reduce((acc, r) => {
    acc[r] = stats.reduce((s, c) => s + (c.reasons?.filter(x => x === r).length || 0), 0)
    return acc
  }, {})

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-base font-semibold">Returns Analytics</h2>
        <p className="text-[11px] text-gray-400 mt-0.5">COD failed deliveries by city and reason</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Shipped', value: totalShipped, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Returned', value: totalReturned, icon: RotateCcw, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Global Rate', value: `${globalRate}%`,
            icon: globalRate >= 25 ? AlertTriangle : CheckCircle,
            color: globalRate >= 25 ? 'text-red-500' : 'text-green-500',
            bg: globalRate >= 25 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`border border-gray-200 dark:border-gray-800 rounded-xl p-5
              ${label === 'Global Rate'
                ? 'col-span-2 sm:col-span-1 flex flex-col items-center justify-center text-center'
                : ''}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <p className={`font-bold ${label === 'Global Rate' ? `text-3xl ${color}` : 'text-2xl'}`}>
              {loading ? '—' : value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Reason breakdown */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Return Reasons</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {RETURN_REASONS.map(r => (
            <div key={r} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-3 ${REASON_COLORS[r]}`}>{r}</span>
              <p className="text-2xl font-bold">{loading ? '—' : reasonCounts[r]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* City table */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        {/* Table header — hidden on mobile */}
        <div className="hidden sm:grid px-5 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 grid-cols-[1fr_80px_80px_1fr] gap-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">City</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-center">Shipped</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-center">Returned</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Rate</span>
        </div>

        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="px-5 py-4 border-t border-gray-100 dark:border-gray-900 first:border-t-0 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-[1fr_80px_80px_1fr] sm:gap-4 sm:items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full sm:w-8 sm:mx-auto" />
            </div>
          ))
        ) : stats.length === 0 ? (
          <div className="py-16 text-center">
            <RotateCcw size={28} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-xs text-gray-400">No return data yet</p>
          </div>
        ) : (
          stats.map((row, i) => (
            <motion.div
              key={row.city}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="px-5 py-4 border-t border-gray-100 dark:border-gray-900 first:border-t-0
                         flex flex-col gap-2
                         sm:grid sm:grid-cols-[1fr_80px_80px_1fr] sm:gap-4 sm:items-center sm:flex-none"
            >
              {/* Mobile: city + badges row */}
              <div className="flex items-center justify-between sm:contents">
                <span className="text-sm font-medium truncate">{row.city}</span>
                <div className="flex items-center gap-2 sm:contents">
                  <span className="text-xs text-gray-500 sm:text-center">{row.total}</span>
                  <span className="text-xs font-semibold text-orange-500 sm:text-center">{row.returned}</span>
                </div>
              </div>
              <RateBar rate={row.returnRate} />
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
