import { Loader2, Truck, MapPin } from 'lucide-react'

export default function PaymentStep({ shipping, total, loading, error, onBack, onSubmit }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold mb-4">Payment Method</h2>

      {/* Pay on Delivery — only option */}
      <div className="border-2 border-black dark:border-white rounded-xl p-4 flex items-start gap-3 bg-gray-50 dark:bg-gray-950">
        <div className="w-5 h-5 rounded-full border-2 border-black dark:border-white flex items-center justify-center mt-0.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck size={15} />
            <span className="text-sm font-semibold">Pay on Delivery</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pay in cash when your order arrives at your door. No card needed.
          </p>
        </div>
      </div>

      {/* Delivery address summary */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={13} className="text-gray-400" />
          <span className="text-xs font-semibold">Delivery Address</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          {shipping.fullName}<br />
          {shipping.address}, {shipping.city}{shipping.zip ? ` ${shipping.zip}` : ''}<br />
          {shipping.country}
        </p>
        <button onClick={onBack} className="mt-2 text-[10px] text-gray-400 hover:text-black dark:hover:text-white transition-colors underline underline-offset-2">
          Edit address
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 border border-gray-200 dark:border-gray-800 py-2.5 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 size={14} className="animate-spin" /> Placing Order…</>
            : `Confirm Order — ${total.toFixed(2)} MAD`}
        </button>
      </div>
    </div>
  )
}
