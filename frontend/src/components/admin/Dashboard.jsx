import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '../ui/Skeleton'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { ordersApi, productsApi } from '../../lib/api'
import { STATUS_COLORS } from '../../constants/admin'
import { useTranslation } from 'react-i18next'

const STATUS_HEX = {
  Processing: '#EAB308',
  Shipped:    '#3B82F6',
  Delivered:  '#22C55E',
  Cancelled:  '#EF4444',
}

const PERIODS = ['day', 'month', 'year']

function StatCard({ label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-gray-200 dark:border-gray-800 rounded-xl p-4"
    >
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  )
}

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-bold text-sm text-indigo-500">MAD {Number(payload[0]?.value || 0).toFixed(2)}</p>
      {payload[1] && (
        <p className="text-gray-500 mt-0.5">{payload[1].value} orders</p>
      )}
    </div>
  )
}

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const [stats, setStats]             = useState(null)
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [period, setPeriod]           = useState('month')
  const [revenueData, setRevenueData] = useState([])
  const [revenueLoading, setRevenueLoading] = useState(true)

  useEffect(() => {
    Promise.all([ordersApi.stats(), productsApi.list({ limit: 100 })])
      .then(([statsRes, prodRes]) => {
        setStats(statsRes.stats)
        setProducts(prodRes.products || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setRevenueLoading(true)
    ordersApi.revenue(period)
      .then(res => setRevenueData(res.points || []))
      .catch(console.error)
      .finally(() => setRevenueLoading(false))
  }, [period])

  if (loading) return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-28" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-2">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-56 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-36 w-full" />
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <Skeleton className="h-3 w-24" />
          </div>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 last:border-0 gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-28 hidden sm:block" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const cards = [
    { label: t('admin.dashboard.totalRevenue'), value: `${(stats?.totalRevenue || 0).toFixed(2)} MAD` },
    { label: t('admin.dashboard.totalOrders'),  value: stats?.totalOrders || 0 },
    { label: t('admin.dashboard.products'),     value: products.length },
    { label: t('admin.dashboard.processing'),   value: stats?.byStatus?.Processing || 0 },
  ]

  const donutData = Object.entries(stats?.byStatus || {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: t(`orders.${name}`, name), value, key: name }))

  const periodTotal = revenueData.reduce((s, p) => s + p.revenue, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h2 className="text-base font-semibold">{t('admin.dashboard.title')}</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <StatCard key={card.label} label={card.label} value={card.value} delay={i * 0.07} />
        ))}
      </div>

      {/* Revenue area chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="border border-gray-200 dark:border-gray-800 rounded-xl p-5"
      >
        <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{t('admin.dashboard.totalRevenueChart')}</p>
            <p className="text-3xl font-bold">
              {revenueLoading ? '—' : `${periodTotal.toFixed(2)} MAD`}
            </p>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                  period === p
                    ? 'bg-white dark:bg-black shadow-sm text-black dark:text-white'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {t(`admin.dashboard.period.${p}`)}
              </button>
            ))}
          </div>
        </div>

        {revenueLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : revenueData.length === 0 ? (
          <div className="flex items-center justify-center h-56 text-xs text-gray-400">
            {t('admin.dashboard.noOrders')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={224}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-100 dark:text-gray-800"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                className="fill-gray-400"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                className="fill-gray-400"
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={v => `${v}`}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366F1"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={false}
                activeDot={{ r: 5, fill: '#6366F1', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Donut — orders by status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="border border-gray-200 dark:border-gray-800 rounded-xl p-4"
        >
          <p className="text-xs font-semibold mb-4">{t('admin.dashboard.ordersByStatus')}</p>
          {donutData.length === 0 ? (
            <p className="text-center py-10 text-xs text-gray-400">{t('admin.dashboard.noOrders')}</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={150}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%" cy="50%"
                    innerRadius={40} outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donutData.map(entry => (
                      <Cell key={entry.key} fill={STATUS_HEX[entry.key] ?? '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2.5 flex-1">
                {donutData.map(entry => (
                  <div key={entry.key} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_HEX[entry.key] ?? '#6B7280' }} />
                    <span className="text-[11px] text-gray-600 dark:text-gray-400 flex-1">{entry.name}</span>
                    <span className="text-[11px] font-bold">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent orders table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-xs font-semibold">{t('admin.dashboard.recentOrders')}</h3>
          </div>
          {(stats?.recentOrders || []).length === 0 ? (
            <p className="text-center py-10 text-xs text-gray-400">{t('admin.dashboard.noOrders')}</p>
          ) : (
            stats.recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 last:border-0 gap-2">
                <span className="text-xs font-mono shrink-0">{order.orderNumber}</span>
                <span className="hidden sm:block text-xs text-gray-500 truncate flex-1">{order.shipping?.email}</span>
                <span className="text-xs font-semibold shrink-0">MAD {order.total.toFixed(2)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium shrink-0 ${STATUS_COLORS[order.status] || STATUS_COLORS.Processing}`}>
                  {t(`orders.${order.status}`, order.status)}
                </span>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
