import type { StorageAdapter } from '@core/shared/storage.types'

/**
 * StorageAdapter over window.localStorage. Every method is async, so anything
 * localStorage throws becomes a rejected promise: reading the property itself
 * throws SecurityError when site data is blocked, and setItem throws
 * QuotaExceededError when storage is full. cartPersistence catches those
 * rejections and the cart keeps working in memory.
 */
export const localStorageAdapter: StorageAdapter = {
  getItem: async (key) => window.localStorage.getItem(key),
  setItem: async (key, value) => {
    window.localStorage.setItem(key, value)
  },
  removeItem: async (key) => {
    window.localStorage.removeItem(key)
  },
}
