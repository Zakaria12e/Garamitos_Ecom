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