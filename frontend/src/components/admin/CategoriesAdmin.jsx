import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, MoreVertical, AlertTriangle, Loader2 } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'
import { categoriesApi } from '../../lib/api'
import { useTranslation } from 'react-i18next'

const EMPTY_FORM = { name: '', sortOrder: 0, parent: '' }
const PAGE_SIZE  = 6

function DeleteModal({ category, onConfirm, onCancel }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t('admin.categories.deleteTitle')}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {t('admin.categories.deleteConfirm')} <span className="font-medium text-gray-800 dark:text-gray-200">"{category?.name}"</span>?
            </p>
            <p className="text-xs text-gray-400 mt-1">{t('admin.categories.deleteWarning')}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('admin.common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            {t('admin.common.del')}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

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

export default function CategoriesAdmin() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage]             = useState(1)

  const load = () => {
    setLoading(true)
    categoriesApi.list()
      .then(d => setCategories(d.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE))
  const paginated  = useMemo(() => categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [categories, page])

  const openNew  = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, sortOrder: c.sortOrder, parent: c.parent?._id || '' }); setShowForm(true) }

  const handleDelete = async () => {
    try {
      await categoriesApi.delete(deleteTarget._id)
      setDeleteTarget(null)
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

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            category={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 flex-wrap ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}>
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {paginated.map((c, i) => (
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
              <ActionsMenu
                onEdit={() => openEdit(c)}
                onDelete={() => setDeleteTarget(c)}
                t={t}
              />
            </motion.div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, categories.length)} of {categories.length}
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
