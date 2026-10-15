import { useCallback } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { selectCartItems, selectIsCartHydrated } from '@core/cart/cart.selectors'
import { selectCheckoutStatus } from '@core/checkout/checkoutSlice'
import { useCheckoutForm } from '@core/checkout/hooks/useCheckoutForm'
import { useOrderSummary } from '@core/checkout/hooks/useOrderSummary'
import { useAppSelector } from '@core/store/hooks'
import { LoadingState } from '../../../shared/components/molecules/LoadingState'
import { ROUTES } from '../../../shared/navigation/routes'
import { ContactForm } from '../components/ContactForm'
import { OrderSummary } from '../components/OrderSummary'
import { useBlockNavigationWhileProcessing } from '../hooks/useBlockNavigationWhileProcessing'

const CONTACT_FORM_ID = 'checkout-contact'

function CheckoutContent() {
  const navigate = useNavigate()
  const status = useAppSelector(selectCheckoutStatus)

  const handleConfirmed = useCallback(() => {
    // replace: going back from the confirmation never returns to checkout.
    navigate(ROUTES.orderConfirmed, { replace: true })
  }, [navigate])

  const { register, errors, submit, isBusy } = useCheckoutForm({ onConfirmed: handleConfirmed })
  // Frozen while busy: confirmOrder empties the cart before the navigation (D38).
  const summary = useOrderSummary(isBusy)
  useBlockNavigationWhileProcessing(status === 'processing')

  return (
    <div className="grid grid-cols-1 items-start gap-8 min-[1025px]:grid-cols-[minmax(0,1fr)_400px]">
      <ContactForm
        id={CONTACT_FORM_ID}
        register={register}
        errors={errors}
        isDisabled={isBusy}
        onSubmit={submit}
      />
      <OrderSummary summary={summary} formId={CONTACT_FORM_ID} isBusy={isBusy} />
    </div>
  )
}

/**
 * 20-Web-Checkout. With an empty cart it goes to /carrito, but only once the
 * stored cart has loaded (a reload would redirect too early) and only while
 * idle (confirmOrder empties the cart before navigating to the confirmation).
 */
export function CheckoutScreen() {
  const isHydrated = useAppSelector(selectIsCartHydrated)
  const items = useAppSelector(selectCartItems)
  const status = useAppSelector(selectCheckoutStatus)

  if (!isHydrated) {
    return <LoadingState label="Cargando carrito" />
  }
  if (items.length === 0 && status === 'idle') {
    return <Navigate to={ROUTES.cart} replace />
  }

  return (
    <div className="page-container pt-8 pb-16">
      <title>Checkout · MiniShop</title>
      <h1 className="mb-6 text-[28px] leading-9 font-bold">Checkout</h1>
      <CheckoutContent />
    </div>
  )
}
