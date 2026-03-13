import React, { createContext, useContext , useReducer ,useEffect } from 'react'

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

  case 'TOGGLE_WISHLIST': {
  const inList = state.wishlist.find(i => i.id === action.product.id)

  return {
    ...state,
    wishlist: inList
      ? state.wishlist.filter(i => i.id !== action.product.id)
      : [...state.wishlist, action.product]
  }
}

case 'TOGGLE_COMPARE': {
  const inList = state.compareList.find(i => i.id === action.product.id)

  if (inList)
    return {
      ...state,
      compareList: state.compareList.filter(i => i.id !== action.product.id)
    }

  if (state.compareList.length >= 4)
    return state

  return {
    ...state,
    compareList: [...state.compareList, action.product]
  }
}

case 'REMOVE_COMPARE':
  return {
    ...state,
    compareList: state.compareList.filter(i => i.id !== action.id)
  }

  case 'APPLY_PROMO':
  return {
    ...state,
    promoCode: action.promo,
    discount: action.discount
  }

case 'REMOVE_PROMO':
  return {
    ...state,
    promoCode: null,
    discount: 0
  }

case 'SET_SHIPPING':
  localStorage.setItem('sv_shipping', action.price)

  return {
    ...state,
    shippingPrice: action.price
  }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
  localStorage.setItem(
    'sv_cart_state',
    JSON.stringify({
      cart: state.cart,
      wishlist: state.wishlist,
      compareList: state.compareList,
      promoCode: state.promoCode,
      discount: state.discount,
    })
  )
}, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)