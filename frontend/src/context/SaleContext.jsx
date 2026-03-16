import { createContext, useContext, useEffect, useState } from 'react'
import { salesApi } from '../lib/api'

const SaleContext = createContext(null)

export function SaleProvider({ children }) {
  const [activeSale, setActiveSale] = useState(null)

  useEffect(() => {
    salesApi.active()
      .then(d => setActiveSale(d.sale || null))
      .catch(err => { console.error('[SaleContext]', err); setActiveSale(null) })
  }, [])

  return (
    <SaleContext.Provider value={{ activeSale }}>
      {children}
    </SaleContext.Provider>
  )
}

export const useSale = () => useContext(SaleContext)
