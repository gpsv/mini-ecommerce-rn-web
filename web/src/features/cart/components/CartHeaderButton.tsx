import { Link } from 'react-router'
import { ShoppingCart } from 'lucide-react'
import { selectTotalItems } from '@core/cart/cart.selectors'
import { useAppSelector } from '@core/store/hooks'
import { ROUTES } from '../../../shared/navigation/routes'

function getCartLabel(totalItems: number): string {
  return `Carrito, ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`
}

/** 17-Web-Listado header button: a link to /carrito with the item count. */
export function CartHeaderButton() {
  const totalItems = useAppSelector(selectTotalItems)

  return (
    <Link
      to={ROUTES.cart}
      aria-label={getCartLabel(totalItems)}
      className="focus-ring-inverse relative flex h-12 items-center gap-2 rounded-full bg-primary-foreground/15 px-4 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/25"
    >
      <ShoppingCart size={22} aria-hidden="true" />
      <span className="hidden min-[641px]:inline">Carrito</span>
      {totalItems > 0 ? (
        <span
          aria-hidden="true"
          className="h-[22px] min-w-[22px] rounded-full bg-cart-badge px-1.5 text-center text-[12px] leading-[22px] font-bold text-primary-foreground"
        >
          {totalItems}
        </span>
      ) : null}
    </Link>
  )
}
