import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderApp, TEST_CART_ITEM } from '../../../test/renderApp'

describe('CartScreen', () => {
  it('at quantity 1 turns − into a confirmed remove (D08)', async () => {
    const user = userEvent.setup()
    const { store } = renderApp({ path: '/carrito', cartItems: [TEST_CART_ITEM] })

    const stepper = await screen.findByRole('group', { name: `Cantidad de ${TEST_CART_ITEM.title}` })
    expect(within(stepper).queryByRole('button', { name: 'Quitar uno' })).not.toBeInTheDocument()

    await user.click(within(stepper).getByRole('button', { name: 'Eliminar producto' }))
    const dialog = screen.getByRole('alertdialog', { name: '¿Eliminar este producto del carrito?' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(store.getState().cart.items).toHaveLength(1)

    await user.click(within(stepper).getByRole('button', { name: 'Eliminar producto' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(store.getState().cart.items).toHaveLength(0)
    // The row is gone: focus goes to the empty cart's heading.
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toHaveFocus()
  })
})
