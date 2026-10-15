import type { RouteObject } from 'react-router'
import { CartScreen } from '../features/cart'
import { ProductDetailScreen, ProductListScreen } from '../features/catalog'
import { CheckoutScreen, OrderConfirmedScreen } from '../features/checkout'
import { ROUTES } from '../shared/navigation/routes'
import { NotFoundScreen } from './NotFoundScreen'
import { RootLayout } from './RootLayout'

/** Shared by the browser router (App) and the memory router in tests. */
export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.catalog, element: <ProductListScreen /> },
      { path: ROUTES.productDetail, element: <ProductDetailScreen /> },
      { path: ROUTES.cart, element: <CartScreen /> },
      { path: ROUTES.checkout, element: <CheckoutScreen /> },
      { path: ROUTES.orderConfirmed, element: <OrderConfirmedScreen /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]
