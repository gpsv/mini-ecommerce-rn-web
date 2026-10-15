import { hasApiErrorCode } from '../store/apiErrors';
import { API_ERROR_CODES } from '../store/baseApi';

describe('hasApiErrorCode', () => {
  it('matches a CUSTOM_ERROR with the same code', () => {
    const error = { status: 'CUSTOM_ERROR', error: API_ERROR_CODES.productNotFound };

    expect(hasApiErrorCode(error, API_ERROR_CODES.productNotFound)).toBe(true);
    expect(hasApiErrorCode(error, API_ERROR_CODES.invalidResponse)).toBe(false);
  });

  it('ignores HTTP, network and serialized errors', () => {
    expect(hasApiErrorCode({ status: 500, data: null }, API_ERROR_CODES.productNotFound)).toBe(false);
    expect(
      hasApiErrorCode(
        { status: 'FETCH_ERROR', error: 'TypeError: Network request failed' },
        API_ERROR_CODES.productNotFound,
      ),
    ).toBe(false);
    expect(hasApiErrorCode({ message: 'boom' }, API_ERROR_CODES.productNotFound)).toBe(false);
    expect(hasApiErrorCode(undefined, API_ERROR_CODES.productNotFound)).toBe(false);
  });
});
