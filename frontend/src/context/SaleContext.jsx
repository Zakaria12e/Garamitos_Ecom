import { createContext, useContext, useEffect, useState } from 'react'
import { salesApi } from '../lib/api'

const SaleContext = createContext(null)

export function SaleProvider({ children }) {
  const [activeSale, setActiveSale] = useState(null)

  const fetchActiveSale = () => {
    salesApi.active()
      .then(d => setActiveSale(d.sale || null))
      .catch(err => { console.error('[SaleContext]', err); setActiveSale(null) })
  }

  useEffect(() => { fetchActiveSale() }, [])

  return (
    <SaleContext.Provider value={{ activeSale, refreshSale: fetchActiveSale }}>
      {children}
    </SaleContext.Provider>
  )
}

export const useSale = () => useContext(SaleContext)
