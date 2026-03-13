import React, { createContext, useContext } from 'react'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  return (
    <SettingsContext.Provider value={{}}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)