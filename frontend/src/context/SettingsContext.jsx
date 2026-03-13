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

  return (
    <SettingsContext.Provider value={{settings, loading, reload: load}}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)