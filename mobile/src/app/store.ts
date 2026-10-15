import { createAppStore } from '@core/store/createAppStore';
import { asyncStorageAdapter } from '../shared/storage/asyncStorageAdapter';

export const store = createAppStore(asyncStorageAdapter, {
  isDevelopment: __DEV__,
});
