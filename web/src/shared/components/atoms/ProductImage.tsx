import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export interface ProductImageProps {
  src: string
  alt: string
  /** Intrinsic size: the browser reserves the space before the image loads. */
  width: number
  height: number
  loading?: 'lazy' | 'eager'
  className?: string
}

/**
 * Product image inside a box with a fixed size set by the parent, so it never
 * shifts the layout. Falls back to a placeholder icon if it fails to load.
 */
export function ProductImage({
  src,
  alt,
  width,
  height,
  loading = 'lazy',
  className = '',
}: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (failedSrc === src) {
    return (
      <span
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        className={`flex size-full items-center justify-center text-text-muted ${className}`}
      >
        <ImageOff size={Math.min(width, height) / 3} aria-hidden="true" strokeWidth={1.5} />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`max-h-full max-w-full object-contain ${className}`}
    />
  )
}
