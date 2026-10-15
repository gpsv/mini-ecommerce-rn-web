import { LoaderCircle } from 'lucide-react'

export interface SpinnerProps {
  size?: number
  className?: string
}

/** Decorative: the surrounding element carries role="status" and the text. */
export function Spinner({ size = 24, className = '' }: SpinnerProps) {
  return (
    <LoaderCircle
      size={size}
      aria-hidden="true"
      className={`animate-spin text-primary motion-reduce:animate-none ${className}`}
    />
  )
}
