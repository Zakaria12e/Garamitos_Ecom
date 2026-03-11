const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Core fetch wrapper ─────────────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem('sv_token')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

// ── Normalise MongoDB product (_id → id, specs Map → plain obj) ──
export function normaliseProduct(p) {
  if (!p) return p
  const specs = p.specs
    ? typeof p.specs === 'object' && !Array.isArray(p.specs)
      ? Object.fromEntries(Object.entries(p.specs))
      : p.specs
    : {}
  return { ...p, id: p._id || p.id, specs }
}

// ── Auth ───────────────────────────────────────────────────
export const authApi = {
  register: (body)         => request('/auth/register', { method: 'POST', body }),
  login:    (body)         => request('/auth/login',    { method: 'POST', body }),
  me:       ()             => request('/auth/me'),
  updateMe: (body)         => request('/auth/me',              { method: 'PUT',  body }),
  changePassword: (body)   => request('/auth/change-password', { method: 'POST', body }),
}

// ── Products ───────────────────────────────────────────────
export const productsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) qs.set(k, v)
    })
    return request(`/products?${qs}`)
  },
  featured:   ()   => request('/products/featured'),
  categories: ()   => request('/products/categories'),
  brands:     ()   => request('/products/brands'),
  get:      (id)   => request(`/products/${id}`),
  related:  (id)   => request(`/products/${id}/related`),
  create:   (body) => request('/products',     { method: 'POST',   body }),
  update:   (id, body) => request(`/products/${id}`, { method: 'PUT', body }),
  delete:   (id)   => request(`/products/${id}`, { method: 'DELETE' }),
}

// ── Orders ─────────────────────────────────────────────────
export const ordersApi = {
  place:       (body)  => request('/orders',             { method: 'POST', body }),
  lookup:      (email) => request(`/orders/lookup?email=${encodeURIComponent(email)}`),
  myOrders:    ()      => request('/orders/my'),
  myOrder:     (id)    => request(`/orders/my/${id}`),
  // admin
  all:         (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/orders?${qs}`)
  },
  get:         (id)    => request(`/orders/${id}`),
  updateStatus:(id, status, note) => request(`/orders/${id}/status`, { method: 'PUT', body: { status, note } }),
  stats:       ()      => request('/orders/admin/stats'),
}
