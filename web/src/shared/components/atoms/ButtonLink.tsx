import { Link, type LinkProps } from 'react-router'
import { getButtonClassName, type ButtonStyleOptions } from './buttonStyles'

export interface ButtonLinkProps extends ButtonStyleOptions, Omit<LinkProps, 'children'> {
  label: string
}

/** Navigation that looks like a button ("Ver detalle", "Ir a checkout"): semantically a link. */
export function ButtonLink({
  label,
  variant,
  size,
  fullWidth,
  className = '',
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link
      className={`${getButtonClassName({ variant, size, fullWidth })} ${className}`}
      {...linkProps}
    >
      {/* Button text never truncates: layouts make room for it instead. */}
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  )
}
