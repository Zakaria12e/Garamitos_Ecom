import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, Pencil, Trash2, MoreVertical, AlertTriangle, Tag, CalendarRange } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'
import { salesApi } from '../../lib/api'

const EMPTY_FORM = { title: '', description: '', discount: '', startDate: '', endDate: '', isActive: true }

function getSaleStatus(sale) {
  const now = new Date()
  const start = new Date(sale.startDate)
  const end   = new Date(sale.endDate)
  if (!sale.isActive) return 'inactive'
  if (now < start) return 'upcoming'
  if (now > end)   return 'expired'
  return 'active'
}

const STATUS_STYLES = {
  active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  upcoming: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
  expired:  'bg-gray-100  text-gray-500  dark:bg-gray-800     dark:text-gray-400',
  inactive: 'bg-gray-100  text-gray-400  dark:bg-gray-800     dark:text-gray-500',
}
const STATUS_LABELS = { active: 'Active', upcoming: 'Upcoming', expired: 'Expired', inactive: 'Inactive' }

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-black shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
    </button>
  )
}

function SaleMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  return (
    <div ref={ref} className="relative shrink-0">
      <button onClick={() => setOpen(o => !o)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <MoreVertical size={13} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute end-0 top-7 z-50 w-32 bg-black border border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <button onClick={() => { onEdit(); setOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors">
            <Pencil size={11} /> Edit
          </button>
          <button onClick={() => { onDelete(); setOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-white/10 transition-colors">
            <Trash2 size={11} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

function DeleteModal({ sale, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Delete Sale</h3>
            <p className="text-xs text-gray-500 mt-1">
              Are you sure you want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">{sale?.title}</span>? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="flex-1 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">Delete</button>
        </div>
      </motion.div>
    </div>
  )
}

function Field({ label, hint, ...props }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-400 mb-1">{label}</label>
      {hint && <p className="text-[10px] text-gray-400 mb-1">{hint}</p>}
      <input
        {...props}
        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white"
      />
    </div>
  )
}

function toInputDate(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}

export default function SalesAdmin() {
  const [sales, setSales]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [deleteTarget, setDelete]   = useState(null)
  const [error, setError]           = useState('')

  useEffect(() => {
    salesApi.list()
      .then(d => setSales(d.sales || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openNew  = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowForm(true) }
  const openEdit = (s) => {
    setEditing(s)
    setForm({ ...s, startDate: toInputDate(s.startDate), endDate: toInputDate(s.endDate) })
    setError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.discount || !form.startDate || !form.endDate) {
      setError('All fields are required.')
      return
    }
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('End date must be after start date.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, discount: Number(form.discount) }
      if (editing) {
        const res = await salesApi.update(editing._id, payload)
        setSales(prev => prev.map(s => s._id === editing._id ? res.sale : s))
      } else {
        const res = await salesApi.create(payload)
        setSales(prev => [res.sale, ...prev])
      }
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    await salesApi.delete(deleteTarget._id)
    setSales(prev => prev.filter(s => s._id !== deleteTarget._id))
    setDelete(null)
  }

  const toggleActive = async (sale) => {
    const res = await salesApi.update(sale._id, { isActive: !sale.isActive })
    setSales(prev => prev.map(s => s._id === sale._id ? res.sale : s))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold">Flash Sales</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Schedule time-limited discounts on all products</p>
        </div>
        <button onClick={openNew} className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5">
          <Plus size={12} /> New Sale
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-sm p-5">
              <h3 className="text-sm font-semibold mb-4">{editing ? 'Edit Sale' : 'New Flash Sale'}</h3>
              <div className="space-y-3">
                <Field label="Sale Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Summer Sale" />
                <Field label="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Up to 20% off all products" />
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">Discount (%)</label>
                  <div className="relative">
                    <input
                      type="number" min="1" max="99"
                      value={form.discount}
                      onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                      placeholder="20"
                      className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-transparent focus:outline-none focus:border-black dark:focus:border-white pr-8"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  <Field label="End Date" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-black dark:accent-white" />
                  Active
                </label>
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 dark:border-gray-800 py-2 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal sale={deleteTarget} onConfirm={handleDelete} onCancel={() => setDelete(null)} />
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}>
              <Skeleton className="w-9 h-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2.5 w-48" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-xl py-14 text-center">
          <CalendarRange size={28} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-xs text-gray-400">No sales yet. Create your first flash sale!</p>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl">
          {sales.map((sale, i) => {
            const st = getSaleStatus(sale)
            return (
              <motion.div key={sale._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 px-4 py-3 flex-wrap ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}>

                {/* Icon */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${st === 'active' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-900'}`}>
                  <Tag size={14} className={st === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{sale.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] font-bold text-black dark:text-white">{sale.discount}% off</span>
                    <span className="text-[10px] text-gray-400">·</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(sale.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' → '}
                      {new Date(sale.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Status + controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[st]}`}>
                    {STATUS_LABELS[st]}
                  </span>
                  <Toggle checked={sale.isActive} onChange={() => toggleActive(sale)} />
                  <SaleMenu onEdit={() => openEdit(sale)} onDelete={() => setDelete(sale)} />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
