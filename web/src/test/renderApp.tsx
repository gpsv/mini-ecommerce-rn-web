import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { CART_STORAGE_VERSION, type CartItem } from '@core/cart/cart.schema'
import type { CheckoutDependencies } from '@core/checkout/checkoutSlice'
import type { StorageAdapter } from '@core/shared/storage.types'
import { CART_STORAGE_KEY } from '@core/store/cartPersistence'
import { createAppStore } from '@core/store/createAppStore'
import { appRoutes } from '../app/routes'

export const TEST_CART_ITEM: CartItem = {
  id: 1,
  title: 'Mochila Fjallraven Foldsack No. 1',
  priceInCents: 10995,
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
  category: "men's clothing",
  quantity: 1,
}

/** In-memory StorageAdapter, optionally starting with a stored cart. */
export function createMemoryStorage(cartItems?: CartItem[]): StorageAdapter {
  const values = new Map<string, string>()
  if (cartItems) {
    values.set(CART_STORAGE_KEY, JSON.stringify({ version: CART_STORAGE_VERSION, items: cartItems }))
  }
  return {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value)
    },
    removeItem: async (key) => {
      values.delete(key)
    },
  }
}

interface RenderAppOptions {
  /** The current path, or the whole history with the current path last. */
  path: string | string[]
  cartItems?: CartItem[]
  checkout?: Partial<CheckoutDependencies>
}

/** The real routes and store, with a memory router and a memory storage. */
export function renderApp({ path, cartItems, checkout }: RenderAppOptions) {
  const store = createAppStore(createMemoryStorage(cartItems), { checkout })
  const router = createMemoryRouter(appRoutes, {
    initialEntries: Array.isArray(path) ? path : [path],
  })
  const view = render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  )
  return { ...view, store, router }
}
