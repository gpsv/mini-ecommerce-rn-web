import type { API_ERROR_CODES } from './baseApi';

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

/**
 * True when an RTK Query error is the CUSTOM_ERROR with this code, so the UI
 * can pick a message (e.g. "producto no encontrado") without repeating the narrowing.
 */
export function hasApiErrorCode(error: unknown, code: ApiErrorCode): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 'CUSTOM_ERROR' &&
    'error' in error &&
    error.error === code
  );
}
