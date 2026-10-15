import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const API_BASE_URL = 'https://fakestoreapi.com';

/**
 * Catalog cache lifetime: one request per app session (D17). RTK Query caps
 * timers at ~24.8 days; Infinity would keep the data forever.
 */
export const CATALOG_CACHE_SECONDS = 60 * 60 * 24;

/** Codes in `error.error` of a CUSTOM_ERROR, so the UI can pick its message. */
export const API_ERROR_CODES = {
  invalidResponse: 'INVALID_RESPONSE',
  productNotFound: 'PRODUCT_NOT_FOUND',
} as const;

/**
 * Single API slice. Features add endpoints with injectEndpoints.
 * Hooks come from query/react so they are generated once for both apps (D11).
 * No refetchOnFocus / refetchOnReconnect / refetchOnMountOrArgChange: the
 * catalog is requested once and served from the cache.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Product'],
  keepUnusedDataFor: CATALOG_CACHE_SECONDS,
  // A response that fails rawResponseSchema becomes a controlled error that
  // the UI shows with Retry, instead of an unhandled exception.
  catchSchemaFailure: schemaError => ({
    status: 'CUSTOM_ERROR' as const,
    error: API_ERROR_CODES.invalidResponse,
    data: schemaError.issues,
  }),
  endpoints: () => ({}),
});
