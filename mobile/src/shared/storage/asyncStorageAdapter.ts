import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from '@core/shared/storage.types';

/**
 * AsyncStorage v3 works with named instances; the default export only proxies
 * the legacy v2 storage. This app has no legacy data, so it uses its own.
 */
const storage = createAsyncStorage('minishop');

export const asyncStorageAdapter: StorageAdapter = {
  getItem: key => storage.getItem(key),
  setItem: (key, value) => storage.setItem(key, value),
  removeItem: key => storage.removeItem(key),
};
