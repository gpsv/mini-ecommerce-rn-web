import { useRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

interface HarnessProps {
  /** Confirming also removes the button that opened the dialog, like a cart row. */
  removesOpenerOnConfirm?: boolean
}

function Harness({ removesOpenerOnConfirm = false }: HarnessProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasOpener, setHasOpener] = useState(true)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const handleConfirm = () => {
    setIsOpen(false)
    if (removesOpenerOnConfirm) {
      setHasOpener(false)
    }
  }

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        Mi carrito
      </h1>
      {hasOpener ? (
        <button type="button" onClick={() => setIsOpen(true)}>
          Eliminar producto
        </button>
      ) : null}
      <button type="button">Ir a checkout</button>
      <ConfirmDialog
        isOpen={isOpen}
        title="¿Eliminar este producto del carrito?"
        description="Mochila Fjallraven"
        confirmLabel="Eliminar"
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
        fallbackFocusRef={headingRef}
      />
    </>
  )
}

async function openDialog() {
  const user = userEvent.setup()
  const opener = screen.getByRole('button', { name: 'Eliminar producto' })
  await user.click(opener)
  return { user, opener, dialog: screen.getByRole('alertdialog') }
}

describe('ConfirmDialog', () => {
  it('is a modal dialog with a name and description, and starts on Cancelar', async () => {
    render(<Harness />)
    const { dialog, opener } = await openDialog()

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('¿Eliminar este producto del carrito?')
    expect(dialog).toHaveAccessibleDescription('Mochila Fjallraven')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    // Everything outside the dialog is inert.
    expect(opener.closest('[inert]')).not.toBeNull()
  })

  it('keeps Tab and Shift+Tab inside the dialog', async () => {
    render(<Harness />)
    const { user } = await openDialog()
    const cancel = screen.getByRole('button', { name: 'Cancelar' })
    const confirm = screen.getByRole('button', { name: 'Eliminar' })

    await user.tab()
    expect(confirm).toHaveFocus()
    await user.tab()
    expect(cancel).toHaveFocus()
    await user.tab({ shift: true })
    expect(confirm).toHaveFocus()
  })

  it('closes with Esc and returns focus to the button that opened it', async () => {
    render(<Harness />)
    const { user, opener } = await openDialog()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(opener.closest('[inert]')).toBeNull()
  })

  it('moves focus to the fallback when the opener no longer exists', async () => {
    render(<Harness removesOpenerOnConfirm />)
    const { user } = await openDialog()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))

    expect(screen.queryByRole('button', { name: 'Eliminar producto' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mi carrito' })).toHaveFocus()
  })
})
