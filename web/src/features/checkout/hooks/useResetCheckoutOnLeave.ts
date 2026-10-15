import { useEffect } from 'react'
import { useStore } from 'react-redux'
import { useLocation } from 'react-router'
import { resetCheckout } from '@core/checkout/checkoutSlice'
import type { RootState } from '@core/store/createAppStore'
import { ROUTES } from '../../../shared/navigation/routes'

/**
 * Resets the checkout once the user leaves /compra-confirmada by any route
 * (button, header, back). On mobile the confirmation's button does it; on web
 * the header and the browser can also leave. Without it, status stays
 * 'confirmed' and the next checkout would start busy.
 * Runs only when the path changes: confirmOrder sets 'confirmed' while still
 * on /checkout, and the reset must wait until the user has seen the order.
 */
export function useResetCheckoutOnLeave() {
  const { pathname } = useLocation()
  const store = useStore<RootState>()

  useEffect(() => {
    if (pathname !== ROUTES.orderConfirmed && store.getState().checkout.status === 'confirmed') {
      store.dispatch(resetCheckout())
    }
  }, [pathname, store])
}
