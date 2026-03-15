import { useState } from 'react'
import { Navigate, Link, Routes, Route, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Settings, Tag, Users, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '../components/ui/Skeleton'
import Dashboard        from '../components/admin/Dashboard'
import ProductsAdmin    from '../components/admin/ProductsAdmin'
import OrdersAdmin      from '../components/admin/OrdersAdmin'
import ShippingAdmin    from '../components/admin/ShippingAdmin'
import CategoriesAdmin  from '../components/admin/CategoriesAdmin'
import UsersAdmin       from '../components/admin/UsersAdmin'

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
        animate={{ width: collapsed ? 48 : 176 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col shrink-0 overflow-visible"
      >
        {/* Header row */}
        <div className={`flex items-center mb-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('admin.panel')}</p>
          )}
          <button
            onClick={() => setCollapsed(c => {
              const next = !c
              localStorage.setItem('admin_sidebar', next ? 'collapsed' : 'expanded')
              return next
            })}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronLeft size={14} />
            </motion.div>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to) && to !== '/admin' || location.pathname === '/admin' && to === '/admin'

            return (
              <div key={to} className="relative group">
                <Link
                  to={to}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute ltr:left-full rtl:right-full top-1/2 -translate-y-1/2 ltr:ms-2 rtl:me-2 z-50
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                    <div className="bg-black dark:bg-white text-white dark:text-black text-xs font-medium
                      px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
                      {label}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.aside>

      {/* Mobile nav — unchanged horizontal scroll */}
      <div className="flex md:hidden overflow-x-auto gap-1 pb-1 scrollbar-none">
        {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && to !== '/admin' || location.pathname === '/admin' && to === '/admin'
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors shrink-0 ${
                isActive
                  ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}>
              <Icon size={13} />{label}
            </Link>
          )
        })}
      </div>

      <main className="flex-1 min-w-0">
        <Routes>
          <Route index           element={<Dashboard />} />
          <Route path="products"   element={<ProductsAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="orders"     element={<OrdersAdmin />} />
          <Route path="shipping"   element={<ShippingAdmin />} />
          <Route path="users"      element={<UsersAdmin />} />
        </Routes>
      </main>
    </div>
  )
}
