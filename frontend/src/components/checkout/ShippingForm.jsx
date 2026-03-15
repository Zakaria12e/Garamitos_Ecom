import { Field, SelectField } from './CheckoutFields'
import { MOROCCAN_CITIES } from '../../constants/checkout'

export default function ShippingForm({ shipping, setShipping, onContinue }) {
  const isValid = shipping.fullName && shipping.email && shipping.address && shipping.city && shipping.country

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold mb-4">Shipping Information</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Full Name" value={shipping.fullName} onChange={e => setShipping(s => ({ ...s, fullName: e.target.value }))} placeholder="John Doe" />
        </div>
        <Field label="Email" type="email" value={shipping.email} onChange={e => setShipping(s => ({ ...s, email: e.target.value }))} placeholder="john@example.com" />
        <Field label="Phone" value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} placeholder="+212 600 000000" />
        <div className="col-span-2">
          <Field label="Address" value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} placeholder="123 Main St" />
        </div>
        <SelectField label="City" value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} options={MOROCCAN_CITIES} />
        <Field label="ZIP Code" value={shipping.zip} onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))} placeholder="10001" />
        <div className="col-span-2">
          <label className="block text-xs font-medium mb-1">Country</label>
          <input type="text" value="Morocco" disabled className="w-full text-xs border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed" />
        </div>
      </div>
      <button
        onClick={onContinue}
        disabled={!isValid}
        className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-40 mt-2"
      >
        Continue to Payment
      </button>
    </div>
  )
}
