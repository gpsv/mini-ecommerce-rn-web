import { Suspense } from 'react'
import { Link, Outlet, ScrollRestoration } from 'react-router'
import { House } from 'lucide-react'
import { CartHeaderButton } from '../features/cart'
import { useResetCheckoutOnLeave } from '../features/checkout'
import { LoadingState } from '../shared/components/molecules/LoadingState'
import { ROUTES } from '../shared/navigation/routes'

/** 17-Web-Listado header (brand "MiniShop", D42) around every page. */
export function RootLayout() {
  useResetCheckoutOnLeave()

  return (
    <>
      <a
        href="#main"
        className="focus-ring sr-only z-40 rounded-md bg-surface px-4 py-2 font-semibold text-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-10 bg-primary">
        <nav aria-label="Principal" className="page-container flex h-[72px] items-center justify-between gap-4">
          <Link to={ROUTES.catalog} className="focus-ring-inverse flex items-center gap-3 rounded-md">
            <span className="flex size-9 items-center justify-center rounded-md bg-surface text-primary">
              <House size={20} aria-hidden="true" />
            </span>
            <span className="text-[22px] leading-7 font-bold text-primary-foreground">MiniShop</span>
          </Link>
          <CartHeaderButton />
        </nav>
      </header>
      <main id="main" tabIndex={-1} className="outline-none">
        {/* Lazy routes (checkout): shown on a direct load; when navigating, the
            router keeps the current page until the chunk arrives. */}
        <Suspense fallback={<LoadingState label="Cargando página" />}>
          <Outlet />
        </Suspense>
      </main>
      {/* New pages start at the top; back/forward restore the previous position. */}
      <ScrollRestoration />
    </>
  )
}
