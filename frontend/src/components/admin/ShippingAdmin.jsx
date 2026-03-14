import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { settingsApi } from '../../lib/api'
import { useApp } from '../../context/AppContext'
import { useSettings } from '../../context/SettingsContext'
import { EMPTY_PROMO_FORM } from '../../constants/admin'

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
        <h2 className="text-base font-semibold mb-4">Shipping Settings</h2>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Shipping Price (MAD)</label>
              <p className="text-[10px] text-gray-400 mb-2">Charged when order is below the free threshold.</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} step="1" min="0"
                  className="w-full text-sm border border-gray-200 dark:border-gray-800 rounded-md pl-12 pr-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Free Shipping Threshold (MAD)</label>
              <p className="text-[10px] text-gray-400 mb-2">Orders above this amount get free shipping.</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                <input type="number" value={freeThreshold} onChange={e => setFreeThreshold(e.target.value)} step="1" min="0"
                  className="w-full text-sm border border-gray-200 dark:border-gray-800 rounded-md pl-12 pr-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" />
              </div>
            </div>
          </div>
          <button onClick={saveShipping}
            className={`w-full py-2 rounded-md text-xs font-medium transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'}`}>
            {saved ? '✓ Saved!' : 'Save Shipping Settings'}
          </button>
          {saveError && <p className="text-xs text-red-500 mt-1 text-center">{saveError}</p>}
        </div>
      </div>

      {/* Promo Codes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Promo Codes</h2>
          <button onClick={openNewPromo} className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5">
            <Plus size={12} /> New Code
          </button>
        </div>

        {/* Promo Modal */}
        <AnimatePresence>
          {showPromoForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-sm p-5">
                <h3 className="text-sm font-semibold mb-4">{editingPromo ? 'Edit Promo Code' : 'New Promo Code'}</h3>
                <div className="space-y-3">
                  <Field label="Code (e.g. SAVE10)" value={promoForm.code} onChange={e => setPromoForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" />
                  <Field label="Label (shown to customer)" value={promoForm.label} onChange={e => setPromoForm(f => ({ ...f, label: e.target.value }))} placeholder="20% off your order" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Type</label>
                      <select value={promoForm.type} onChange={e => setPromoForm(f => ({ ...f, type: e.target.value }))}
                        className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded px-2.5 py-1.5 bg-white dark:bg-black focus:outline-none">
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed amount (MAD)</option>
                      </select>
                    </div>
                    <Field
                      label={promoForm.type === 'percent' ? 'Discount (%)' : 'Discount (MAD)'}
                      type="number" min="0" value={promoForm.value}
                      onChange={e => setPromoForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={promoForm.type === 'percent' ? '20' : '50'}
                    />
                  </div>
                  <Field label="Usage Limit (leave empty = unlimited)" type="number" min="1"
                    value={promoForm.usageLimit} onChange={e => setPromoForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="100" />
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input type="checkbox" checked={promoForm.isActive} onChange={e => setPromoForm(f => ({ ...f, isActive: e.target.checked }))} className="accent-black dark:accent-white" />
                    Active
                  </label>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowPromoForm(false)} className="flex-1 border border-gray-200 dark:border-gray-800 py-2 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">Cancel</button>
                  <button onClick={handleSavePromo} disabled={promoSaving} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                    {promoSaving && <Loader2 size={12} className="animate-spin" />}
                    {editingPromo ? 'Update' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {promoLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-400"><Loader2 size={18} className="animate-spin" /></div>
        ) : promos.length === 0 ? (
          <div className="border border-dashed border-gray-200 dark:border-gray-800 rounded-xl py-10 text-center text-xs text-gray-400">
            No promo codes yet. Create your first one!
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
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => openEditPromo(promo)} className="text-xs px-2.5 py-1 border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors flex items-center gap-1">
                    <Pencil size={10} /> Edit
                  </button>
                  <button onClick={() => handleDeletePromo(promo._id)} className="text-xs px-2.5 py-1 border border-red-200 dark:border-red-900 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-1">
                    <Trash2 size={10} /> Del
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
