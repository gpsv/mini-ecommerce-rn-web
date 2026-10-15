/**
 * Platform storage behind an interface: AsyncStorage on mobile, a Promise
 * wrapper around localStorage on web. core/ never touches either directly.
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
