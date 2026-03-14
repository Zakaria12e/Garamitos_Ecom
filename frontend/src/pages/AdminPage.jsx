import { Navigate, Link, Routes, Route, useLocation } from 'react-router-dom'
import { Loader2, LayoutDashboard, Package, ShoppingBag, Settings, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Dashboard        from '../components/admin/Dashboard'
import ProductsAdmin    from '../components/admin/ProductsAdmin'
import OrdersAdmin      from '../components/admin/OrdersAdmin'
import ShippingAdmin    from '../components/admin/ShippingAdmin'
import CategoriesAdmin  from '../components/admin/CategoriesAdmin'

const NAV_LINKS = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { to: '/admin/products',   label: 'Products',   icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { to: '/admin/shipping',   label: 'Shipping',   icon: Settings },
]

export default function AdminPage() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={20} className="animate-spin text-gray-400" />
    </div>
  )
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      <aside className="w-44 shrink-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Admin Panel</p>
        {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && to !== '/admin' || location.pathname === '/admin' && to === '/admin'
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-md mb-1 text-xs transition-colors ${isActive ? 'bg-black dark:bg-white text-white dark:text-black font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
              <Icon size={13} />{label}
            </Link>
          )
        })}
      </aside>

      <main className="flex-1 min-w-0">
        <Routes>
          <Route index           element={<Dashboard />} />
          <Route path="products"   element={<ProductsAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="orders"     element={<OrdersAdmin />} />
          <Route path="shipping"   element={<ShippingAdmin />} />
        </Routes>
      </main>
    </div>
  )
}
