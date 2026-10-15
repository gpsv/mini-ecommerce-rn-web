import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'
import { getButtonClassName, type ButtonStyleOptions } from './buttonStyles'

export interface ButtonProps
  extends ButtonStyleOptions,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  icon?: LucideIcon
}

export function Button({
  label,
  icon: Icon,
  variant,
  size,
  fullWidth,
  className = '',
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${getButtonClassName({ variant, size, fullWidth })} ${className}`}
      {...buttonProps}
    >
      {Icon ? <Icon size={size === 'lg' ? 20 : 18} aria-hidden="true" /> : null}
      {/* Button text never truncates: layouts make room for it instead. */}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}
