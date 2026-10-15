import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'
import { Button } from '../atoms/Button'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  /** Content under the title; it is the dialog's accessible description. */
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  /**
   * Gets focus on close when the button that opened the dialog no longer
   * exists (e.g. its cart row was just removed).
   */
  fallbackFocusRef?: RefObject<HTMLElement | null>
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Makes everything outside the dialog inert and returns a function that undoes
 * it. Uses the attribute, not the `inert` property, which jsdom lacks.
 */
function makeOutsideInert(dialogRoot: HTMLElement): () => void {
  const siblings = Array.from(document.body.children).filter(
    (element) => element !== dialogRoot && !element.hasAttribute('inert'),
  )
  siblings.forEach((element) => element.setAttribute('inert', ''))
  return () => siblings.forEach((element) => element.removeAttribute('inert'))
}

/**
 * 09-Carrito-Confirmar for web (D15). Modal with role="alertdialog" (a confirmation
 * that needs an answer):
 * - the rest of the page is inert and Tab / Shift+Tab cycle inside the dialog;
 * - focus starts on Cancel, the safe option for a destructive action;
 * - Esc and a click on the backdrop cancel;
 * - on close, focus returns to the element that opened it, or to fallbackFocusRef.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  fallbackFocusRef,
}: ConfirmDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const portalRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const portal = portalRef.current
    if (!isOpen || !portal) {
      return undefined
    }
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const restoreOutside = makeOutsideInert(portal)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()

    return () => {
      restoreOutside()
      document.body.style.overflow = previousOverflow
      // Runs after React commits the close, so a removed opener is already detached.
      // The fallback is read now on purpose: it may point to an element rendered
      // by that same commit (the empty cart's heading after removing the last item).
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const target = opener?.isConnected ? opener : fallbackFocusRef?.current
      target?.focus()
    }
  }, [isOpen, fallbackFocusRef])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCancel()
      return
    }
    if (event.key !== 'Tab' || !dialogRef.current) {
      return
    }
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) {
      return
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div ref={portalRef} className="fixed inset-0 z-30 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-text/50" onClick={onCancel} />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
        className="relative flex w-full max-w-md flex-col gap-4 rounded-lg bg-surface px-6 pt-6 pb-4 shadow-card-hover"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <Trash2 size={24} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="text-[18px] leading-6 font-semibold">
          {title}
        </h2>
        <div id={descriptionId}>{description}</div>
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="focus-ring h-12 cursor-pointer rounded-md px-5 text-[16px] font-semibold text-primary hover:bg-primary-soft"
          >
            {cancelLabel}
          </button>
          <Button label={confirmLabel} variant="danger" size="lg" className="h-12 px-5" onClick={onConfirm} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
