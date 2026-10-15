import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

export type IconButtonVariant = 'primary' | 'muted' | 'danger'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  icon: LucideIcon
  /** Required: the button has no visible text. */
  label: string
  variant?: IconButtonVariant
  shape?: 'round' | 'square'
  iconSize?: number
}

/**
 * 19-Web-Carrito: stepper buttons (primary, square) and the row's remove
 * button (muted, round, danger on hover).
 */
const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  primary: 'bg-surface text-primary hover:bg-primary-soft',
  muted: 'bg-transparent text-text-muted hover:bg-danger-soft hover:text-danger',
  danger: 'bg-surface text-danger hover:bg-danger-soft',
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'primary',
  shape = 'round',
  iconSize = 20,
  className = '',
  type = 'button',
  ...buttonProps
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`focus-ring flex shrink-0 cursor-pointer items-center justify-center transition-colors disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground ${VARIANT_CLASS[variant]} ${shape === 'round' ? 'rounded-full' : ''} ${className}`}
      {...buttonProps}
    >
      <Icon size={iconSize} aria-hidden="true" />
    </button>
  )
}
