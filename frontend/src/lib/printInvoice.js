export function printInvoice(order) {
  const currency = 'MAD'

  const rows = (order.items || []).map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9f9f9'}">
      <td style="padding:10px 12px">${item.name}</td>
      <td style="padding:10px 12px;color:#888">${item.brand || '—'}</td>
      <td style="padding:10px 12px;text-align:center">${item.qty}</td>
      <td style="padding:10px 12px;text-align:right;color:#555">${item.price.toFixed(2)} ${currency}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:700;color:#111">${(item.price * item.qty).toFixed(2)} ${currency}</td>
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
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; background: #fff; }
    .page { max-width: 780px; margin: 0 auto; padding: 48px 48px 40px; }

    /* Top accent bar */
    .accent-bar { height: 5px; background: linear-gradient(90deg, #111 0%, #555 100%); border-radius: 3px; margin-bottom: 40px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand-name { font-size: 26px; font-weight: 900; letter-spacing: -1px; color: #111; }
    .brand-sub { font-size: 11px; color: #999; margin-top: 3px; letter-spacing: 0.04em; text-transform: uppercase; }
    .invoice-label { text-align: right; }
    .invoice-label h2 { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #111; }
    .invoice-label .order-num { font-size: 12px; color: #888; margin-top: 4px; font-family: monospace; letter-spacing: 0.05em; }
    .invoice-label .inv-date { font-size: 12px; color: #888; margin-top: 2px; }

    /* Info grid */
    .info-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; background: #f5f5f5; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }
    .info-block + .info-block { border-left: 1px solid #e0e0e0; padding-left: 24px; }
    .info-block { padding-right: 24px; }
    .info-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #aaa; margin-bottom: 6px; }
    .info-value { font-size: 12px; line-height: 1.65; color: #333; }
    .info-value strong { color: #111; font-weight: 700; }

    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border-radius: 10px; overflow: hidden; border: 1px solid #ebebeb; }
    thead tr { background: #111; }
    thead th { padding: 11px 12px; text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; }
    thead th:nth-child(3) { text-align: center; }
    thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
    tbody td { font-size: 12.5px; color: #333; border-bottom: 1px solid #f0f0f0; }
    tbody tr:last-child td { border-bottom: none; }

    /* Totals */
    .bottom { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals { width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #666; }
    .totals-row.discount { color: #16a34a; font-weight: 600; }
    .totals-sep { border: none; border-top: 1.5px solid #e5e5e5; margin: 8px 0; }
    .totals-final { display: flex; justify-content: space-between; align-items: center; padding-top: 4px; }
    .totals-final .label { font-size: 13px; font-weight: 700; color: #111; }
    .totals-final .amount { font-size: 20px; font-weight: 900; color: #111; letter-spacing: -0.5px; }

    /* Footer */
    .footer { border-top: 1px solid #ebebeb; padding-top: 18px; display: flex; justify-content: space-between; align-items: center; }
    .footer-left { font-size: 11px; color: #bbb; }
    .footer-right { font-size: 11px; color: #bbb; text-align: right; }
    .footer-right strong { color: #888; }

    @media print {
      body { background: #fff; }
      .page { padding: 0; }
      @page { margin: 12mm 14mm; size: A4; }
    }
  </style>
</head>
<body>
<div class="page">

  <div class="accent-bar"></div>

  <div class="header">
    <div>
      <div class="brand-name">Garamitos</div>
      <div class="brand-sub">Construction &amp; Hardware Supplies</div>
    </div>
    <div class="invoice-label">
      <h2>INVOICE</h2>
      <div class="order-num">${order.orderNumber}</div>
      <div class="inv-date">${date}</div>
    </div>
  </div>

  <div class="info-section">
    <div class="info-block">
      <div class="info-label">Bill To</div>
      <div class="info-value">
        <strong>${order.shipping?.fullName}</strong><br/>
        ${order.shipping?.email}<br/>
        ${order.shipping?.phone || ''}
      </div>
    </div>
    <div class="info-block">
      <div class="info-label">Ship To</div>
      <div class="info-value">
        ${order.shipping?.address}<br/>
        ${order.shipping?.city}${order.shipping?.zip ? ', ' + order.shipping.zip : ''}<br/>
        ${order.shipping?.country}
      </div>
    </div>
    <div class="info-block">
      <div class="info-label">Payment</div>
      <div class="info-value">
        ${order.paymentMethod}<br/>
        <span style="color:#aaa;font-size:11px">${order.items?.length} item${order.items?.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Brand</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="bottom">
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${order.subtotal?.toFixed(2)} ${currency}</span></div>
      <div class="totals-row"><span>Shipping</span><span>${order.shippingCost === 0 ? 'Free' : order.shippingCost?.toFixed(2) + ' ' + currency}</span></div>
      ${order.discount > 0 ? `<div class="totals-row discount"><span>Discount</span><span>− ${order.discount.toFixed(2)} ${currency}</span></div>` : ''}
      <hr class="totals-sep" />
      <div class="totals-final">
        <span class="label">Total Due</span>
        <span class="amount">${order.total.toFixed(2)} ${currency}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-left">Thank you for your business!</div>
    <div class="footer-right"><strong>Garamitos</strong> · garamitos.ma</div>
  </div>

</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=860,height=960')
  win.document.write(html)
  win.document.close()
  win.onload = () => { win.focus(); win.print() }
}
