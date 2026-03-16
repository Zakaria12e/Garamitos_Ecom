export function printInvoice(order) {
  const currency = 'MAD'

  const rows = (order.items || []).map(item => `
    <tr>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0">${item.name}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:center">${item.brand || '—'}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:center">${item.qty}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:right">${item.price.toFixed(2)} ${currency}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">${(item.price * item.qty).toFixed(2)} ${currency}</td>
    </tr>
  `).join('')

  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
    .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .brand span { color: #555; font-weight: 400; font-size: 13px; display: block; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .invoice-meta p { font-size: 11px; color: #666; margin-top: 2px; }
    .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 6px;
      background: ${order.status === 'Delivered' ? '#dcfce7' : order.status === 'Shipped' ? '#dbeafe' : order.status === 'Cancelled' ? '#fee2e2' : '#fef9c3'};
      color: ${order.status === 'Delivered' ? '#166534' : order.status === 'Shipped' ? '#1e40af' : order.status === 'Cancelled' ? '#991b1b' : '#854d0e'};
    }
    .divider { border: none; border-top: 2px solid #111; margin: 24px 0 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .info-block h4 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 6px; }
    .info-block p { font-size: 12px; line-height: 1.7; color: #333; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #111; color: #fff; }
    thead th { padding: 9px 6px; text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; }
    thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: center; }
    thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
    tbody tr:last-child td { border-bottom: none; }
    .totals { margin-left: auto; width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; color: #555; }
    .totals-row.discount { color: #16a34a; }
    .totals-divider { border: none; border-top: 1px solid #ddd; margin: 6px 0; }
    .totals-total { display: flex; justify-content: space-between; padding: 8px 0 0; font-size: 15px; font-weight: 800; color: #111; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #aaa; }
    @media print {
      body { padding: 20px; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      Garamitos
      <span>Construction & Hardware Supplies</span>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>${order.orderNumber}</strong></p>
      <p>${date}</p>
      <div class="status-badge">${order.status}</div>
    </div>
  </div>

  <hr class="divider" />

  <div class="info-grid">
    <div class="info-block">
      <h4>Bill To</h4>
      <p>
        <strong>${order.shipping?.fullName}</strong><br/>
        ${order.shipping?.email}<br/>
        ${order.shipping?.phone || ''}
      </p>
    </div>
    <div class="info-block">
      <h4>Ship To</h4>
      <p>
        ${order.shipping?.address}<br/>
        ${order.shipping?.city}${order.shipping?.zip ? ', ' + order.shipping.zip : ''}<br/>
        ${order.shipping?.country}
      </p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Brand</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)} ${currency}</span></div>
    <div class="totals-row"><span>Shipping</span><span>${order.shippingCost === 0 ? 'Free' : order.shippingCost?.toFixed(2) + ' ' + currency}</span></div>
    ${order.discount > 0 ? `<div class="totals-row discount"><span>Discount</span><span>-${order.discount.toFixed(2)} ${currency}</span></div>` : ''}
    <hr class="totals-divider" />
    <div class="totals-total"><span>Total</span><span>${order.total.toFixed(2)} ${currency}</span></div>
  </div>

  <div class="footer">
    Thank you for your order · Garamitos · garamitos.ma
  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=800,height=900')
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
}
