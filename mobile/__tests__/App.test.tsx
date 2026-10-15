/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import products from '@core/__tests__/fixtures/products.json';
import App from '../src/app/App';
import { jsonResponse, mockFetch } from '../test-utils/storeTestUtils';

beforeEach(() => {
  // The catalog requests /products on mount; RTK Query timers stay fake.
  jest.useFakeTimers();
  mockFetch().mockResolvedValue(jsonResponse(products));
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
