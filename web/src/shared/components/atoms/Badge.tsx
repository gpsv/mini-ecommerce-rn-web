export interface BadgeProps {
  label: string
  size?: 'sm' | 'md'
  className?: string
}

/** Category badge: 17-Web-Listado (12 px) and 18-Web-Detalle (13 px). */
export function Badge({ label, size = 'sm', className = '' }: BadgeProps) {
  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-2.5 py-1 text-[13px] leading-4 font-medium'
  return (
    <span
      className={`self-start rounded-full bg-primary-soft text-primary-soft-foreground ${sizeClass} ${className}`}
    >
      {label}
    </span>
  )
}
