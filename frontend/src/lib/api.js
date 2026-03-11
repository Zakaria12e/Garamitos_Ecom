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