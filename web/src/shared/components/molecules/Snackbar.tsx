import type { ReactNode } from 'react'

export interface SnackbarProps {
  isVisible: boolean
  message: string
  /** Usually a link ("Ver carrito"). */
  action?: ReactNode
}

/**
 * Bottom toast. The live region stays mounted so screen readers announce the
 * message when it appears.
 */
export function Snackbar({ isVisible, message, action }: SnackbarProps) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-6 z-20 flex justify-center"
    >
      {isVisible ? (
        <div className="pointer-events-auto flex min-h-12 w-full max-w-md items-center justify-between gap-3 rounded-md bg-text px-4 py-2 text-body text-primary-foreground shadow-card-hover">
          <span>{message}</span>
          {action}
        </div>
      ) : null}
    </div>
  )
}
