import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '../../test/renderApp'

// getProducts never resolves: these tests only check where each route ends up.
const fetchMock = vi.fn(() => new Promise<Response>(() => {}))

beforeEach(() => {
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Routes', () => {
  it('sends /checkout with an empty cart to /carrito', async () => {
    const { router } = renderApp({ path: '/checkout' })

    expect(await screen.findByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/carrito')
  })

  it('sends /compra-confirmada without an order (e.g. after a reload) to the catalog', async () => {
    const { router } = renderApp({ path: '/compra-confirmada' })

    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('shows a 404 page for unknown routes', async () => {
    renderApp({ path: '/no-existe' })

    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it('treats an invalid product id as not found without calling the API', async () => {
    renderApp({ path: '/producto/abc' })

    expect(
      await screen.findByRole('heading', { name: 'No encontramos este producto' }),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
