import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
    // On mount: restore session from saved token
  useEffect(() => {
    const token = localStorage.getItem('sv_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem('sv_token'))
      .finally(() => setLoading(false))
  }, [])

    // Register
  const register = useCallback(async (name, email, password) => {
    const data = await authApi.register({ name, email, password })
    localStorage.setItem('sv_token', data.token)
    setUser(data.user)
    return data.user
  }, [])
    // Login
  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('sv_token', data.token)
    setUser(data.user)
    return data.user
  }, [])
    // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('sv_token')
    setUser(null)
  }, [])
}