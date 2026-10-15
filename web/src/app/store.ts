import { createAppStore } from '@core/store/createAppStore'
import { localStorageAdapter } from '../shared/storage/localStorageAdapter'

export const store = createAppStore(localStorageAdapter, {
  isDevelopment: import.meta.env.DEV,
})
