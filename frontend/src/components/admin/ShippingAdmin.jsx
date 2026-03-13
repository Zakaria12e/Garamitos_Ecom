import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Plus } from 'lucide-react'
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

      <div>
        <h2 className="text-base font-semibold mb-4">Shipping Settings</h2>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Shipping Price (MAD)</label>
              <p className="text-[10px] text-gray-400 mb-2">Charged when order is below the free threshold.</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} step="1" min="0"
                  className="w-full text-sm border border-gray-200 dark:border-gray-800 rounded-md pl-9 pr-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Free Shipping Threshold (MAD)</label>
              <p className="text-[10px] text-gray-400 mb-2">Orders above this amount get free shipping.</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                <input type="number" value={freeThreshold} onChange={e => setFreeThreshold(e.target.value)} step="1" min="0"
                  className="w-full text-sm border border-gray-200 dark:border-gray-800 rounded-md pl-9 pr-3 py-2 bg-transparent focus:outline-none focus:border-black dark:focus:border-white" />
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

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Promo Codes</h2>
          <button onClick={openNewPromo} className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5">
            <Plus size={12} /> New Code
          </button>
        </div>
        {promoLoading && (
          <div className="flex items-center justify-center py-10 text-gray-400"><Loader2 size={18} className="animate-spin" /></div>
        )}
      </div>

    </motion.div>
  )
}
