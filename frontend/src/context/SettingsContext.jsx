import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { settingsApi } from '../lib/api'

const SettingsContext = createContext(null)
const DEFAULTS = { shippingPrice: 35, freeShippingAt: 600 }

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

   const load = useCallback(() => {
    settingsApi.get()
      .then(d => setSettings(d.settings || DEFAULTS))
      .catch(() => setSettings(DEFAULTS))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const calcShipping = (subtotal) =>
    subtotal >= settings.freeShippingAt ? 0 : settings.shippingPrice

  return (
    <SettingsContext.Provider value={{settings, loading, reload: load, calcShipping }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}