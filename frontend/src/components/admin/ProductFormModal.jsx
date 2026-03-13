import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { PRODUCT_CATEGORIES } from '../../constants/admin'

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-400 mb-1">{label}</label>
      <input
        {...props}
        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
      />
    </div>
  )
}

export default function ProductFormModal({ show, editing, form, setForm, onClose, onSubmit, saving }) {
  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5"
        >
          <h3 className="text-sm font-semibold mb-4">{editing ? 'Edit Product' : 'New Product'}</h3>

          <div className="space-y-3">
            <Field label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-white dark:bg-black focus:outline-none"
                >
                  {PRODUCT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Price"          type="number" value={form.price}         onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
              <Field label="Original Price" type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} />
              <Field label="Stock"          type="number" value={form.stock}         onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>

            <Field label="Image URL" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
            {form.image && (
              <img src={form.image} className="w-full h-32 object-cover rounded-lg" onError={e => e.target.style.display = 'none'} />
            )}

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-transparent focus:outline-none resize-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox" checked={form.featured}
                onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                className="accent-black dark:accent-white"
              />
              Featured product
            </label>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={onClose} className="flex-1 border border-gray-200 dark:border-gray-800 py-2 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
              Cancel
            </button>
            <button onClick={onSubmit} disabled={saving} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
              {saving && <Loader2 size={12} className="animate-spin" />}
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
