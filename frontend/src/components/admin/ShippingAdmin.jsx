import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, Pencil, Trash2, MoreVertical, AlertTriangle } from 'lucide-react'
import { Skeleton } from '../ui/Skeleton'
import { settingsApi } from '../../lib/api'
import { useApp } from '../../context/AppContext'
import { useSettings } from '../../context/SettingsContext'
import { EMPTY_PROMO_FORM } from '../../constants/admin'
import { useTranslation } from 'react-i18next'

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

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white dark:bg-black shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
    </button>
  )
}

function PromoMenu({ onEdit, onDelete, t }) {
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
        <div className="absolute end-0 top-7 z-20 w-32 bg-black border border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <button onClick={() => { onEdit(); setOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors">
            <Pencil size={11} /> {t('admin.common.edit')}
          </button>
          <button onClick={() => { onDelete(); setOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-white/10 transition-colors">
            <Trash2 size={11} /> {t('admin.common.del')}
          </button>
        </div>
      )}
    </div>
  )
}

function DeleteModal({ promo, onConfirm, onCancel, t }) {
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
            <h3 className="text-sm font-semibold">{t('admin.shipping.deleteTitle')}</h3>
            <p className="text-xs text-gray-500 mt-1">{t('admin.shipping.deleteConfirm')} <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{promo?.code}</span>? {t('admin.shipping.deleteWarning')}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="flex-1 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">{t('admin.common.cancel')}</button>
          <button onClick={onConfirm} className="flex-1 py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">{t('admin.common.del')}</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ShippingAdmin() {
  const { t } = useTranslation()
  const { dispatch }                         = useApp()
  const { settings, reload: reloadSettings } = useSettings()

  const [price, setPrice]                   = useState('')
  const [freeThreshold, setFreeThreshold]   = useState('')
  const [saved, setSaved]                   = useState(false)
  const [saveError, setSaveError]           = useState('')

  const [promos, setPromos]                 = useState([])
  const [promoLoading, setPromoLoading]     = useState(true)
  const [promoSaving, setPromoSaving]       = useState(false)
  const [showPromoForm, setShowPromoForm]   = useState(false)
  const [editingPromo, setEditingPromo]     = useState(null)
  const [promoForm, setPromoForm]           = useState(EMPTY_PROMO_FORM)
  const [deleteTarget, setDeleteTarget]     = useState(null)

  useEffect(() => {
    if (settings.shippingPrice  !== undefined) setPrice(settings.shippingPrice)
    if (settings.freeShippingAt !== undefined) setFreeThreshold(settings.freeShippingAt)
  }, [settings])

  useEffect(() => {
    import('../../lib/api').then(({ promoApi }) => {
      promoApi.list()
        .then(d => setPromos(d.codes || []))
        .catch(console.error)
        .finally(() => setPromoLoading(false))
    })
  }, [])

  const saveShipping = async () => {
    setSaveError('')
    try {
      await settingsApi.save({ shippingPrice: Number(price), freeShippingAt: Number(freeThreshold) })
      dispatch({ type: 'SET_SHIPPING', price: Number(price) })
      reloadSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err.message || 'Failed to save settings')
    }
  }

  const openNewPromo  = () => { setEditingPromo(null); setPromoForm(EMPTY_PROMO_FORM); setShowPromoForm(true) }
  const openEditPromo = (p) => { setEditingPromo(p); setPromoForm({ ...p, usageLimit: p.usageLimit ?? '' }); setShowPromoForm(true) }

  const handleDeletePromo = async () => {
    const { promoApi } = await import('../../lib/api')
    await promoApi.delete(deleteTarget._id)
    setPromos(ps => ps.filter(p => p._id !== deleteTarget._id))
    setDeleteTarget(null)
  }

  const handleSavePromo = async () => {
    if (!promoForm.code || !promoForm.value) return
    setPromoSaving(true)
    try {
      const { promoApi } = await import('../../lib/api')
      const payload = {
        ...promoForm,
        value:      Number(promoForm.value),
        usageLimit: promoForm.usageLimit ? Number(promoForm.usageLimit) : null,
        code:       promoForm.code.toUpperCase().trim(),
      }
      if (editingPromo) {
        const res = await promoApi.update(editingPromo._id, payload)
        setPromos(ps => ps.map(p => p._id === editingPromo._id ? res.code : p))
      } else {
        const res = await promoApi.create(payload)
        setPromos(ps => [res.code, ...ps])
      }
      setShowPromoForm(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setPromoSaving(false)
    }
  }

  const togglePromoActive = async (promo) => {
    const { promoApi } = await import('../../lib/api')
    const res = await promoApi.update(promo._id, { isActive: !promo.isActive })
    setPromos(ps => ps.map(p => p._id === promo._id ? res.code : p))
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-8">

      {/* Shipping Settings */}
      <div>
        <h2 className="text-base font-semibold mb-4">{t('admin.shipping.title')}</h2>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">{t('admin.shipping.priceLabel')}</label>
              <p className="text-[10px] text-gray-400 mb-2">{t('admin.shipping.priceDesc')}</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} step="1" min="0"
                  className="w-full text-sm border border-gray-200 dark:border-gray-800 rounded-md pl-12 pr-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">{t('admin.shipping.thresholdLabel')}</label>
              <p className="text-[10px] text-gray-400 mb-2">{t('admin.shipping.thresholdDesc')}</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                <input type="number" value={freeThreshold} onChange={e => setFreeThreshold(e.target.value)} step="1" min="0"
                  className="w-full text-sm border border-gray-200 dark:border-gray-800 rounded-md pl-12 pr-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" />
              </div>
            </div>
          </div>
          <button onClick={saveShipping}
            className={`w-full py-2 rounded-md text-xs font-medium transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'}`}>
            {saved ? t('admin.shipping.saved') : t('admin.shipping.save')}
          </button>
          {saveError && <p className="text-xs text-red-500 mt-1 text-center">{saveError}</p>}
        </div>
      </div>

      {/* Promo Codes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">{t('admin.shipping.promoCodes')}</h2>
          <button onClick={openNewPromo} className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5">
            <Plus size={12} /> {t('admin.shipping.newCode')}
          </button>
        </div>

        {/* Promo Modal */}
        <AnimatePresence>
          {showPromoForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-sm p-5">
                <h3 className="text-sm font-semibold mb-4">{editingPromo ? t('admin.shipping.editPromo') : t('admin.shipping.newPromo')}</h3>
                <div className="space-y-3">
                  <Field label={t('admin.shipping.codeLabel')} value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" />
                  <Field label={t('admin.shipping.customerLabel')} value={promoForm.label} onChange={e => setPromoForm(f => ({ ...f, label: e.target.value }))} placeholder="20% off your order" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">{t('admin.shipping.type')}</label>
                      <select value={promoForm.type} onChange={e => setPromoForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-white dark:bg-black focus:outline-none">
                        <option value="percent">{t('admin.shipping.typePercent')}</option>
                        <option value="fixed">{t('admin.shipping.typeFixed')}</option>
                      </select>
                    </div>
                    <Field
                      label={promoForm.type === 'percent' ? t('admin.shipping.discountPercent') : t('admin.shipping.discountFixed')}
                      type="number" min="0" value={promoForm.value}
                      onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={promoForm.type === 'percent' ? '20' : '50'}
                    />
                  </div>
                  <Field label={t('admin.shipping.usageLimit')} type="number" min="1"
                    value={promoForm.usageLimit} onChange={e => setPromoForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="100" />
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={promoForm.isActive} onChange={e => setPromoForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-black dark:accent-white" />
                    {t('admin.common.active')}
                  </label>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowPromoForm(false)} className="flex-1 border border-gray-200 dark:border-gray-800 py-2 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">{t('admin.common.cancel')}</button>
                  <button onClick={handleSavePromo} disabled={promoSaving} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                    {promoSaving && <Loader2 size={12} className="animate-spin" />}
                    {editingPromo ? t('admin.common.update') : t('admin.common.create')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteTarget && (
            <DeleteModal promo={deleteTarget} onConfirm={handleDeletePromo} onCancel={() => setDeleteTarget(null)} t={t} />
          )}
        </AnimatePresence>

        {promoLoading ? (
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 flex-wrap ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="h-8 w-24 rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Skeleton className="h-6 w-14 rounded" />
                  <Skeleton className="h-7 w-14 rounded" />
                  <Skeleton className="h-7 w-12 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : promos.length === 0 ? (
          <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-xl py-10 text-center text-xs text-gray-400">
            {t('admin.shipping.noPromos')}
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl">
            {promos.map((promo, i) => (
              <motion.div key={promo._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 px-4 py-3 flex-wrap ${i > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''}`}>
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <span className={`inline-block font-mono font-bold text-sm px-2.5 py-1 rounded-md ${promo.isActive ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-gray-900 text-gray-400 line-through'}`}>
                    {promo.code}
                  </span>
                  <div>
                    <p className="text-xs font-medium">{promo.label || (promo.type === 'percent' ? `${promo.value}% off` : `MAD ${promo.value} off`)}</p>
                    <p className="text-[10px] text-gray-400">
                      {promo.type === 'percent' ? `${promo.value}%` : `MAD ${promo.value}`} discount
                      {promo.usageLimit ? ` · ${promo.usageCount}/${promo.usageLimit} used` : ` · ${promo.usageCount || 0} used`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Toggle checked={promo.isActive} onChange={() => togglePromoActive(promo)} />
                  <PromoMenu onEdit={() => openEditPromo(promo)} onDelete={() => setDeleteTarget(promo)} t={t} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
