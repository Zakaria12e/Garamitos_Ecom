import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { productsApi, categoriesApi, normaliseProduct } from '../../lib/api'
import { EMPTY_PRODUCT_FORM } from '../../constants/admin'
import ProductFormModal from './ProductFormModal'
import { useTranslation } from 'react-i18next'

export default function ProductsAdmin() {
  const { t } = useTranslation()
  const [products, setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY_PRODUCT_FORM)

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
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2" />
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {products.map((p, i) => (
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
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(p)} className="text-xs px-2.5 py-1 border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors flex items-center gap-1">
                  <Pencil size={10} /> {t('admin.common.edit')}
                </button>
                <button onClick={() => handleDelete(p._id || p.id)} className="text-xs px-2.5 py-1 border border-red-200 dark:border-red-900 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-1">
                  <Trash2 size={10} /> {t('admin.common.del')}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
