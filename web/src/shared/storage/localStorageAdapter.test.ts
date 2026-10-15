import { afterEach, describe, expect, it, vi } from 'vitest'
import { addItem } from '@core/cart/cartSlice'
import { createAppStore } from '@core/store/createAppStore'
import { TEST_CART_ITEM } from '../../test/renderApp'
import { localStorageAdapter } from './localStorageAdapter'

async function createHydratedStore() {
  const store = createAppStore(localStorageAdapter, { isDevelopment: true })
  await vi.waitFor(() => expect(store.getState().cart.isHydrated).toBe(true))
  return store
}

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
})

describe('localStorageAdapter', () => {
  it('saves and reads the cart through localStorage', async () => {
    const store = await createHydratedStore()

    store.dispatch(addItem(TEST_CART_ITEM))

    await vi.waitFor(() =>
      expect(window.localStorage.getItem('mini-ecommerce/cart')).toContain('"id":1'),
    )
    const reloaded = await createHydratedStore()
    expect(reloaded.getState().cart.items).toHaveLength(1)
  })

  it('keeps the cart in memory when storage is full', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })
    const store = await createHydratedStore()

    store.dispatch(addItem(TEST_CART_ITEM))

    expect(store.getState().cart.items).toHaveLength(1)
    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith('[cartPersistence] Could not save the cart.', expect.any(DOMException)),
    )
  })

  it('starts with an empty cart when site data is blocked', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Access is denied.', 'SecurityError')
    })

    const store = await createHydratedStore()

    expect(store.getState().cart.items).toEqual([])
    expect(warn).toHaveBeenCalledWith(
      '[cartPersistence] Could not read the stored cart.',
      expect.any(DOMException),
    )
  })
})
