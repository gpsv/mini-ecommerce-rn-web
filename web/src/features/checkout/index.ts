import { lazy } from 'react'

export { useResetCheckoutOnLeave } from './hooks/useResetCheckoutOnLeave'

// Loaded on demand: react-hook-form and the form code download only when the
// user reaches checkout. RootLayout shows the fallback while a chunk loads.
export const CheckoutScreen = lazy(() =>
  import('./screens/CheckoutScreen').then((module) => ({ default: module.CheckoutScreen })),
)
export const OrderConfirmedScreen = lazy(() =>
  import('./screens/OrderConfirmedScreen').then((module) => ({
    default: module.OrderConfirmedScreen,
  })),
)
