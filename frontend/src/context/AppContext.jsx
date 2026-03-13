import React, { createContext, useContext , useReducer } from 'react'

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

function reducer(state, action) {
  switch (action.type) {
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)