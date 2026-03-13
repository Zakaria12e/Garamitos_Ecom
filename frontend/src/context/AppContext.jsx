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
    case 'ADD_TO_CART': {
  const existing = state.cart.find(i => i.id === action.product.id)
  if (existing) {
    return {
      ...state,
      cart: state.cart.map(i =>
        i.id === action.product.id
          ? { ...i, qty: i.qty + (action.qty || 1) }
          : i
      )
    }
  }

  return {
    ...state,
    cart: [...state.cart, { ...action.product, qty: action.qty || 1 }]
  }
}

case 'REMOVE_FROM_CART':
  return {
    ...state,
    cart: state.cart.filter(i => i.id !== action.id)
  }

case 'UPDATE_QTY':
  return {
    ...state,
    cart: state.cart.map(i =>
      i.id === action.id
        ? { ...i, qty: Math.max(1, action.qty) }
        : i
    )
  }

case 'CLEAR_CART':
  return {
    ...state,
    cart: [],
    promoCode: null,
    discount: 0
  }
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