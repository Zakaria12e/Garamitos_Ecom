import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { categoriesApi } from '../../lib/api'
import { useTranslation } from 'react-i18next'

const EMPTY_FORM = { name: '', sortOrder: 0, parent: '' }

export default function CategoriesAdmin() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)

  const load = () => {
    setLoading(true)
    categoriesApi.list()
      .then(d => setCategories(d.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openNew  = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, sortOrder: c.sortOrder, parent: c.parent?._id || '' }); setShowForm(true) }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await categoriesApi.delete(id)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const payload = { ...form, parent: form.parent || null }
      editing
        ? await categoriesApi.update(editing._id, payload)
        : await categoriesApi.create(payload)
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
        <h2 className="text-base font-semibold">{t('admin.categories.title')} ({categories.length})</h2>
        <button onClick={openNew} className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5">
          <Plus size={12} /> {t('admin.categories.addCategory')}
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-sm p-5"
            >
              <h3 className="text-sm font-semibold mb-4">{editing ? t('admin.categories.editCategory') : t('admin.categories.newCategory')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">{t('admin.categories.name')}</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">{t('admin.categories.sortOrder')}</label>
                  <input
                    type="number" min={0}
                    value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">{t('admin.categories.parentCategory')}</label>
                  <select
                    value={form.parent}
                    onChange={e => setForm(f => ({ ...f, parent: e.target.value }))}
                    className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-white dark:bg-black focus:outline-none"
                  >
                    <option value="">{t('admin.categories.none')}</option>
                    {categories.filter(c => c._id !== editing?._id).map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 dark:border-gray-800 py-2 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                  {t('admin.common.cancel')}
                </button>
                <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  {editing ? t('admin.common.update') : t('admin.common.create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2" />
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {categories.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className={`flex items-center gap-3 px-4 py-2.5 flex-wrap ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{c.name}</p>
                <p className="text-[10px] text-gray-400">/{c.slug}{c.parent ? ` · parent: ${c.parent.name}` : ''}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-100 dark:bg-green-950 text-green-600' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}>
                {c.isActive ? t('admin.categories.active') : t('admin.categories.inactive')}
              </span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="text-xs px-2.5 py-1 border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors flex items-center gap-1">
                  <Pencil size={10} /> {t('admin.common.edit')}
                </button>
                <button onClick={() => handleDelete(c._id)} className="text-xs px-2.5 py-1 border border-red-200 dark:border-red-900 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-1">
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
