/** Converts a price coming from the API (e.g. 109.95) to integer cents (10995). */
export function toCents(price: number): number {
  return Math.round(price * 100);
}
