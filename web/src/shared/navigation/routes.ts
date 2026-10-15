/** Web routes, in Spanish like the UI. Kept here so features link to each other without importing app/. */
export const ROUTES = {
  catalog: '/',
  productDetail: '/producto/:productId',
  cart: '/carrito',
  checkout: '/checkout',
  orderConfirmed: '/compra-confirmada',
} as const

export function getProductPath(productId: number): string {
  return `/producto/${productId}`
}
