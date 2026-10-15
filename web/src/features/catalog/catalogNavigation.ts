/** Route state of a detail opened from the catalog: "Volver al catálogo" can go back in history. */
export interface FromCatalogState {
  fromCatalog: true
}

export const FROM_CATALOG_STATE: FromCatalogState = { fromCatalog: true }

export function isFromCatalogState(state: unknown): state is FromCatalogState {
  return typeof state === 'object' && state !== null && 'fromCatalog' in state
}
