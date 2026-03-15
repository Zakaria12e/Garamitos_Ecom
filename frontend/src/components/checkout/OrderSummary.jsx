export default function OrderSummary({ cart, subtotal, shippingCost, discount, total }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-fit space-y-3">
      <h3 className="text-sm font-semibold mb-3">Order Summary</h3>
      {cart.map(item => (
        <div key={item.id} className="flex items-center gap-2">
          <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover bg-gray-100 dark:bg-gray-900" />
          <div className="flex-1 min-w-0">
            <p className="text-xs truncate">{item.name}</p>
            <p className="text-[10px] text-gray-400">x{item.qty}</p>
          </div>
          <span className="text-xs font-medium">{(item.price * item.qty).toFixed(2)} MAD</span>
        </div>
      ))}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{subtotal.toFixed(2)} MAD</span></div>
        <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : shippingCost.toFixed(2) + ' MAD'}</span></div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-{discount.toFixed(2)} MAD</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-sm pt-1"><span>Total</span><span>{total.toFixed(2)} MAD</span></div>
      </div>
    </div>
  )
}
