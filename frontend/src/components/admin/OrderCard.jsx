import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { ordersApi } from '../../lib/api'
import { STATUS_COLORS, ORDER_STATUSES } from '../../constants/admin'

export default function OrderCard({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus]     = useState(order.status)
  const [saving, setSaving]     = useState(false)

  const handleStatus = async (val) => {
    setSaving(true)
    try {
      await ordersApi.updateStatus(order._id, val)
      setStatus(val)
      onStatusChange?.(order._id, val)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div layout className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-3">
      <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors shrink-0">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <div className="min-w-0">
            <p className="text-xs font-mono font-semibold">{order.orderNumber}</p>
            <p className="text-[10px] text-gray-400">
              {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {order.items?.length} item(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold">MAD {order.total.toFixed(2)}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${STATUS_COLORS[status] || STATUS_COLORS.Processing}`}>
            {status}
          </span>
          <div className="relative">
            <select
              value={status} onChange={e => handleStatus(e.target.value)} disabled={saving}
              className="text-xs border border-gray-200 dark:border-gray-800 rounded px-2 py-1 bg-white dark:bg-black focus:outline-none disabled:opacity-50"
            >
              {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            {saving && <Loader2 size={10} className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
