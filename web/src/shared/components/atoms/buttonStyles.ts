export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'md' | 'lg'

export interface ButtonStyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-secondary text-secondary-foreground hover:brightness-95',
  ghost: 'bg-transparent text-primary hover:bg-primary-soft',
  danger: 'bg-danger text-primary-foreground hover:brightness-90',
  success: 'bg-success text-primary-foreground',
}

/** 17-Web-Listado: 44 high, 14 px (card) · 18/19/20-Web: 52 high, 16 px (main actions). */
const SIZE_CLASS: Record<ButtonSize, string> = {
  md: 'h-11 px-4 text-[14px]',
  lg: 'h-13 px-7 text-[16px]',
}

/** Shared by Button and ButtonLink, so a link that looks like a button stays a real link. */
export function getButtonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: ButtonStyleOptions): string {
  return [
    'focus-ring inline-flex min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-md font-semibold no-underline transition-colors',
    'disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground',
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    fullWidth ? 'w-full' : '',
  ].join(' ')
}
