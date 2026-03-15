import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react'
import { productsApi, normaliseProduct } from '../lib/api'
import ProductCard from '../components/ui/ProductCard'

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands]         = useState([])

  useEffect(() => {
    productsApi.categories().then(d => setCategories(d.categories || [])).catch(console.error)
    productsApi.brands().then(d => setBrands(d.brands || [])).catch(console.error)
  }, [])

  const searchQ        = searchParams.get('search') || ''
  const selectedCats   = searchParams.getAll('category')
  const selectedBrands = searchParams.getAll('brand')
  const sortBy         = searchParams.get('sort') || 'newest'
  const minPrice       = searchParams.get('min') || ''
  const maxPrice       = searchParams.get('max') || ''

  const fetchProducts = useCallback(() => {
    setLoading(true)
    const params = {}
    if (searchQ)               params.search   = searchQ
    if (selectedCats.length)   params.category = selectedCats.join(',')
    if (selectedBrands.length) params.brand    = selectedBrands.join(',')
    if (minPrice)              params.minPrice = minPrice
    if (maxPrice)              params.maxPrice = maxPrice
    params.sort  = sortBy
    params.limit = 50

    productsApi.list(params)
      .then(data => {
        setProducts((data.products || []).map(normaliseProduct))
        setTotal(data.total || 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [searchQ, selectedCats.join(','), selectedBrands.join(','), sortBy, minPrice, maxPrice])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const toggleMulti = (key, value) => {
    const params = new URLSearchParams(searchParams)
    const current = params.getAll(key)
    params.delete(key)
    if (current.includes(value)) {
      current.filter(v => v !== value).forEach(v => params.append(key, v))
    } else {
      [...current, value].forEach(v => params.append(key, v))
    }
    setSearchParams(params)
  }

  const Sidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Categories</h3>
        {categories.map(cat => (
          <label key={cat.slug} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={selectedCats.includes(cat.slug)} onChange={() => toggleMulti('category', cat.slug)} className="accent-black dark:accent-white" />
            <span className="text-xs">{cat.name}</span>
          </label>
        ))}
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Brands</h3>
        {brands.map(brand => (
          <label key={brand} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleMulti('brand', brand)} className="accent-black dark:accent-white" />
            <span className="text-xs">{brand}</span>
          </label>
        ))}
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input type="number" value={minPrice} onChange={e => setParam('min', e.target.value)} placeholder="Min" className="w-20 text-xs border border-gray-200 dark:border-gray-800 rounded px-2 py-1 bg-transparent" />
          <span className="text-xs text-gray-400">—</span>
          <input type="number" value={maxPrice} onChange={e => setParam('max', e.target.value)} placeholder="Max" className="w-20 text-xs border border-gray-200 dark:border-gray-800 rounded px-2 py-1 bg-transparent" />
        </div>
      </div>
      {(selectedCats.length || selectedBrands.length || minPrice || maxPrice) > 0 && (
        <button onClick={() => setSearchParams({})} className="text-xs text-red-500 flex items-center gap-1">
          <X size={11} /> Clear filters
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">
            {searchQ ? `Results for "${searchQ}"` : selectedCats.length === 1 ? selectedCats[0] : 'All Products'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">{loading ? '…' : `${total} products`}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden flex items-center gap-1.5 text-xs border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-md">
            <SlidersHorizontal size={12} /> Filters
          </button>
          <div className="relative">
            <select value={sortBy} onChange={e => setParam('sort', e.target.value)} className="text-xs border border-gray-200 dark:border-gray-800 rounded-md px-3 py-1.5 bg-white dark:bg-black appearance-none pr-7 focus:outline-none">
              <option value="newest">Newest</option>
              <option value="name">Name A–Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-48 shrink-0"><Sidebar /></aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-black p-5 overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <span className="font-semibold text-sm">Filters</span>
                <button onClick={() => setSidebarOpen(false)}><X size={16} /></button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}

        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading products…
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400"><p className="text-sm">No products found</p></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3 }} whileHover={{ y: -3 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
