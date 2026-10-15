import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp, TEST_CART_ITEM } from '../../../test/renderApp'

const CHECKOUT_DELAY_MS = 50

function renderCheckout() {
  const generateOrderNumber = vi.fn(() => 'MS-12345')
  const view = renderApp({
    path: '/checkout',
    cartItems: [{ ...TEST_CART_ITEM, quantity: 2 }],
    checkout: { delayMs: CHECKOUT_DELAY_MS, generateOrderNumber },
  })
  return { ...view, generateOrderNumber }
}

describe('Checkout flow', () => {
  it('shows the Zod errors from core and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    renderCheckout()

    await user.click(await screen.findByRole('button', { name: 'Confirmar compra' }))

    const name = screen.getByLabelText('Nombre')
    expect(name).toHaveFocus()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Ingresa tu nombre')
    expect(screen.getByLabelText('Correo')).toHaveAccessibleDescription('Ingresa un correo válido')
    expect(screen.getByLabelText('Teléfono')).toHaveAccessibleDescription(
      'Ingresa 10 dígitos, sin espacios ni guiones',
    )
  })

  it('confirms once, keeps the summary while processing and shows the order', async () => {
    const user = userEvent.setup()
    const { generateOrderNumber, store } = renderCheckout()

    await user.type(await screen.findByLabelText('Nombre'), 'María López')
    await user.type(screen.getByLabelText('Correo'), 'maria@correo.com')
    await user.type(screen.getByLabelText('Teléfono'), '4431234567')
    // Two quick clicks: the thunk's condition lets only one order through.
    await user.dblClick(screen.getByRole('button', { name: 'Confirmar compra' }))

    const processing = await screen.findByRole('button', { name: 'Procesando…' })
    expect(processing).toBeDisabled()
    expect(screen.getByLabelText('Nombre')).toBeDisabled()
    // D38: the summary keeps the totals even after confirmOrder empties the cart.
    const summary = screen.getByRole('complementary', { name: 'Resumen del pedido' })
    // 2 × $109.95: the line total and the order total.
    expect(within(summary).getAllByText('$219.90')).toHaveLength(2)

    expect(await screen.findByRole('heading', { name: '¡Compra confirmada!' })).toBeInTheDocument()
    expect(screen.getByText('#MS-12345')).toBeInTheDocument()
    expect(screen.getByText(/Gracias, María\./)).toBeInTheDocument()
    expect(generateOrderNumber).toHaveBeenCalledTimes(1)
    expect(store.getState().cart.items).toHaveLength(0)
    expect(screen.getByRole('link', { name: 'Carrito, 0 productos' })).toBeInTheDocument()
  })

  it('resets the checkout after leaving the confirmation', async () => {
    const user = userEvent.setup()
    const { store } = renderCheckout()
    // The catalog request after leaving never resolves; only the checkout state matters.
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    await user.type(await screen.findByLabelText('Nombre'), 'María López')
    await user.type(screen.getByLabelText('Correo'), 'maria@correo.com')
    await user.type(screen.getByLabelText('Teléfono'), '4431234567')
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }))
    await user.click(await screen.findByRole('link', { name: 'Volver al catálogo' }))

    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
    expect(store.getState().checkout).toEqual({ status: 'idle', confirmedOrder: null })
    vi.unstubAllGlobals()
  })
})
