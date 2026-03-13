import React, { createContext, useContext } from 'react'

const AppContext = createContext(null)

const initialState = {
  cart: [],
  wishlist: [],
  compareList: [],
  promoCode: null,
  discount: 0,
  shippingPrice: Number(localStorage.getItem('sv_shipping') ?? 9.99),
}

function loadState() {
  try {
    const saved = localStorage.getItem('sv_cart_state')
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState
  } catch {
    return initialState
  }
}

export function AppProvider({ children }) {
  const state = loadState()
  
  return (
    <AppContext.Provider value={{}}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)