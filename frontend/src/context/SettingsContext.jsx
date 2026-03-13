import React, { createContext, useContext, useState  } from 'react'

const SettingsContext = createContext(null)
const DEFAULTS = { shippingPrice: 30, freeShippingAt: 500 }

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  return (
    <SettingsContext.Provider value={{settings, loading}}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)