import { useState } from 'react'
import { Navigate, Link, Routes, Route, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Settings, Tag, Users, ChevronLeft, Zap, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../components/ui/Skeleton'
import Dashboard        from '../components/admin/Dashboard'
import ProductsAdmin    from '../components/admin/ProductsAdmin'
import OrdersAdmin      from '../components/admin/OrdersAdmin'
import ShippingAdmin    from '../components/admin/ShippingAdmin'
import CategoriesAdmin  from '../components/admin/CategoriesAdmin'
import UsersAdmin       from '../components/admin/UsersAdmin'
import SalesAdmin       from '../components/admin/SalesAdmin'
import ReturnsAdmin     from '../components/admin/ReturnsAdmin'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('admin_sidebar') === 'collapsed')

  const NAV_LINKS = [
    { to: '/admin',            label: t('admin.nav.dashboard'),  icon: LayoutDashboard, exact: true },
    { to: '/admin/products',   label: t('admin.nav.products'),   icon: Package },
    { to: '/admin/categories', label: t('admin.nav.categories'), icon: Tag },
    { to: '/admin/orders',     label: t('admin.nav.orders'),     icon: ShoppingBag },
    { to: '/admin/shipping',   label: t('admin.nav.shipping'),   icon: Settings },
    { to: '/admin/users',      label: t('admin.nav.users'),      icon: Users },
    { to: '/admin/sales',      label: t('admin.nav.sales'),      icon: Zap },
    { to: '/admin/returns',    label: 'Returns',                 icon: RotateCcw },
  ]

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-4 md:gap-8">
      <aside className="md:w-44 md:shrink-0 space-y-1">
        <Skeleton className="h-2.5 w-20 mb-3 hidden md:block" />
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </aside>
      <main className="flex-1 min-w-0 space-y-6">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-2">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </main>
    </div>
  )

  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-4 md:gap-8">

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 52 : 180 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col shrink-0 overflow-visible"
      >
        {/* Header row */}
        <div className={`flex items-center mb-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{t('admin.panel')}</span>
          )}
          <button
            onClick={() => setCollapsed(c => {
              const next = !c
              localStorage.setItem('admin_sidebar', next ? 'collapsed' : 'expanded')
              return next
            })}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronLeft size={12} />
            </motion.div>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-0.5">
          {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to) && to !== '/admin' || location.pathname === '/admin' && to === '/admin'

            return (
              <div key={to} className="relative group">
                <Link
                  to={to}
                  className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'text-black dark:text-white bg-black/5 dark:bg-white/5'
                      : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-black dark:bg-white rounded-full" />
                  )}
                  <Icon size={15} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute ltr:left-full rtl:right-full top-1/2 -translate-y-1/2 ltr:ms-2.5 rtl:me-2.5 z-50
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                    <div className="bg-black dark:bg-white text-white dark:text-black text-[11px] font-medium
                      px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                      {label}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.aside>

      {/* Mobile nav */}
      <div className="flex md:hidden overflow-x-auto gap-1 pb-2 scrollbar-none border-b border-gray-200 dark:border-gray-800">
        {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && to !== '/admin' || location.pathname === '/admin' && to === '/admin'
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all shrink-0 rounded-lg ${
                isActive
                  ? 'text-black dark:text-white bg-black/5 dark:bg-white/5'
                  : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'
              }`}>
              <Icon size={13} />{label}
            </Link>
          )
        })}
      </div>

      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Routes location={location}>
              <Route index           element={<Dashboard />} />
              <Route path="products"   element={<ProductsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="orders"     element={<OrdersAdmin />} />
              <Route path="shipping"   element={<ShippingAdmin />} />
              <Route path="users"      element={<UsersAdmin />} />
              <Route path="sales"      element={<SalesAdmin />} />
              <Route path="returns"    element={<ReturnsAdmin />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
