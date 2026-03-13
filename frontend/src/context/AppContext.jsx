import React, { createContext, useContext } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)