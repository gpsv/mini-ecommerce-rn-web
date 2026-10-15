/**
 * Money is handled as integer cents (D05): the API price is converted once with
 * toCents and every later operation stays in integers. Formatting happens only
 * at display time, without Intl, so the output is identical in Hermes, Node and
 * browsers (D12).
 */

const CENTS_PER_DOLLAR = 100;
const THOUSANDS_GROUP = /\B(?=(\d{3})+(?!\d))/g;

function assertInteger(value: number, name: string): void {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be an integer, received ${value}`);
  }
}

/** Converts a price coming from the API (e.g. 109.95) to integer cents (10995). */
export function toCents(price: number): number {
  return Math.round(price * CENTS_PER_DOLLAR);
}

/** Multiplies a unit price in cents by an integer quantity. */
export function multiplyCents(cents: number, quantity: number): number {
  assertInteger(cents, 'cents');
  assertInteger(quantity, 'quantity');
  return cents * quantity;
}

/** Adds integer cent amounts. An empty list sums to 0. */
export function sumCents(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => {
    assertInteger(amount, 'amount');
    return total + amount;
  }, 0);
}

/** Formats integer cents as "$1,234.56" using integer arithmetic only. */
export function formatPrice(cents: number): string {
  assertInteger(cents, 'cents');
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / CENTS_PER_DOLLAR);
  const remainder = absolute % CENTS_PER_DOLLAR;
  const groupedDollars = String(dollars).replace(THOUSANDS_GROUP, ',');
  const paddedCents = String(remainder).padStart(2, '0');
  return `${sign}$${groupedDollars}.${paddedCents}`;
}
