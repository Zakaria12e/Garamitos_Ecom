import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
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

  const handleDeletePromo = async (id) => {
    if (!confirm('Delete this promo code?')) return
    const { promoApi } = await import('../../lib/api')
    await promoApi.delete(id)
    setPromos(ps => ps.filter(p => p._id !== id))
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
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
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
                  <button onClick={() => togglePromoActive(promo)}
                    className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${promo.isActive ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}>
                    {promo.isActive ? t('admin.shipping.activeStatus') : t('admin.shipping.inactiveStatus')}
                  </button>
                  <button onClick={() => openEditPromo(promo)} className="text-xs px-2.5 py-1 border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors flex items-center gap-1">
                    <Pencil size={10} /> {t('admin.common.edit')}
                  </button>
                  <button onClick={() => handleDeletePromo(promo._id)} className="text-xs px-2.5 py-1 border border-red-200 dark:border-red-900 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-1">
                    <Trash2 size={10} /> {t('admin.common.del')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
