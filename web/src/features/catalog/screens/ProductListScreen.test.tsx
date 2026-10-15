import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '../../../test/renderApp'

const API_PRODUCTS = [
  {
    id: 1,
    title: 'Mochila Fjallraven Foldsack No. 1',
    price: 109.95,
    description: 'Mochila para laptop de hasta 15 pulgadas.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/1.jpg',
    rating: { rate: 4, count: 120 },
  },
  {
    id: 2,
    title: 'Mochila escolar ligera',
    price: 22.3,
    description: 'Mochila para la escuela.',
    category: "women's clothing",
    image: 'https://fakestoreapi.com/img/2.jpg',
    rating: { rate: 4, count: 120 },
  },
  {
    id: 3,
    title: 'Chamarra de algodón para hombre',
    price: 55.99,
    description: 'Chamarra para el frío.',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/3.jpg',
    rating: { rate: 4, count: 120 },
  },
]

const fetchMock = vi.fn(
  async () =>
    new Response(JSON.stringify(API_PRODUCTS), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
)

beforeEach(() => {
  fetchMock.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function getProductTitles() {
  return screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
}

describe('ProductListScreen filters in the URL', () => {
  it('reads ?q= and ?categoria= from a shared link', async () => {
    renderApp({ path: "/?q=mochila&categoria=men's clothing" })

    expect(await screen.findByRole('heading', { name: 'Mochila Fjallraven Foldsack No. 1' })).toBeInTheDocument()
    expect(getProductTitles()).toEqual(['Mochila Fjallraven Foldsack No. 1'])
    expect(screen.getByRole('searchbox', { name: 'Buscar productos por nombre' })).toHaveValue('mochila')
    expect(screen.getByRole('button', { name: 'Ropa de hombre' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('writes the filters with replace and keeps them after visiting the detail', async () => {
    const user = userEvent.setup()
    // The user came from the cart; typing must not add entries in between.
    const { router } = renderApp({ path: ['/carrito', '/'] })
    await screen.findByRole('heading', { name: 'Mochila escolar ligera' })

    await user.type(screen.getByRole('searchbox'), 'mochila')
    await user.click(screen.getByRole('button', { name: 'Ropa de mujer' }))

    expect(router.state.location.search).toBe('?q=mochila&categoria=women%27s+clothing')
    expect(router.state.historyAction).toBe('REPLACE')
    await vi.waitFor(() => expect(getProductTitles()).toEqual(['Mochila escolar ligera']))

    await user.click(screen.getByRole('link', { name: 'Ver detalle de Mochila escolar ligera' }))
    await user.click(await screen.findByRole('link', { name: 'Volver al catálogo' }))

    expect(router.state.location.search).toBe('?q=mochila&categoria=women%27s+clothing')
    expect(screen.getByRole('searchbox')).toHaveValue('mochila')
    expect(getProductTitles()).toEqual(['Mochila escolar ligera'])
    // The catalog came from the cache: still a single request.
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Back from the catalog skips every keystroke and lands on the cart.
    await act(() => router.navigate(-1))
    expect(router.state.location.pathname).toBe('/carrito')
  })
})

describe('ProductListScreen error state', () => {
  it('shows the error and loads the catalog after "Reintentar"', async () => {
    const user = userEvent.setup()
    fetchMock.mockResolvedValueOnce(new Response('', { status: 500 }))
    renderApp({ path: '/' })

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar los productos')
    expect(screen.queryByRole('heading', { name: 'Mochila escolar ligera' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByRole('heading', { name: 'Mochila escolar ligera' })).toBeInTheDocument()
    expect(screen.queryByText('No pudimos cargar los productos')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
