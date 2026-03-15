import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'
import { productsApi, categoriesApi, normaliseProduct } from '../../lib/api'
import { EMPTY_PRODUCT_FORM } from '../../constants/admin'
import ProductFormModal from './ProductFormModal'
import { useTranslation } from 'react-i18next'

function ActionsMenu({ onEdit, onDelete, t }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <MoreVertical size={14} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute end-0 top-7 z-20 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => { onEdit(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Pencil size={11} /> {t('admin.common.edit')}
          </button>
          <button
            onClick={() => { onDelete(); setOpen(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Trash2 size={11} /> {t('admin.common.del')}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProductsAdmin() {
  const { t } = useTranslation()
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY_PRODUCT_FORM)
  const [page, setPage]           = useState(1)
  const PAGE_SIZE = 6

  const load = () => {
    setLoading(true)
    Promise.all([
      productsApi.list({ limit: 100 }),
      categoriesApi.list(),
    ])
      .then(([pd, cd]) => {
        setProducts((pd.products || []).map(normaliseProduct))
        setCategories(cd.categories || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const paginated  = useMemo(() => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [products, page])

  const openNew  = () => { setEditing(null); setForm(EMPTY_PRODUCT_FORM); setShowForm(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ ...p, price: p.price, originalPrice: p.originalPrice || p.price, stock: p.stock })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await productsApi.delete(id)
    load()
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        originalPrice: Number(form.originalPrice || form.price),
        stock:         Number(form.stock),
        images:        [form.image],
      }
      editing
        ? await productsApi.update(editing._id || editing.id, payload)
        : await productsApi.create(payload)
      setShowForm(false)
      load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold">{t('admin.products.title')} ({products.length})</h2>
        <button onClick={openNew} className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5">
          <Plus size={12} /> {t('admin.products.addProduct')}
        </button>
      </div>

      <ProductFormModal
        show={showForm}
        editing={editing}
        form={form}
        setForm={setForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        categories={categories}
      />

      {loading ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}>
              <Skeleton className="w-10 h-10 rounded shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-28" />
              </div>
              <Skeleton className="h-4 w-16 shrink-0" />
              <Skeleton className="h-7 w-14 rounded shrink-0" />
              <Skeleton className="h-7 w-12 rounded shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {paginated.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className={`flex items-center gap-3 px-4 py-2.5 flex-wrap ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}
            >
              <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover bg-gray-100 dark:bg-gray-900 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400">{p.brand} · {p.category?.name ?? p.category} · Stock: {p.stock}</p>
              </div>
              <span className="text-sm font-semibold shrink-0">MAD {p.price}</span>
              <ActionsMenu
                onEdit={() => openEdit(p)}
                onDelete={() => handleDelete(p._id || p.id)}
                t={t}
              />
            </motion.div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, products.length)} of {products.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                  n === page
                    ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                    : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
