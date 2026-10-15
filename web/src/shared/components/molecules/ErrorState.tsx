import { CloudOff, RotateCw } from 'lucide-react'
import { Button } from '../atoms/Button'

export interface ErrorStateProps {
  onRetry: () => void
  title?: string
  message?: string
  retryLabel?: string
  className?: string
}

/** 04-Listado-Error, same copy as mobile. */
export function ErrorState({
  onRetry,
  title = 'No pudimos cargar los productos',
  message = 'Revisa tu conexión a internet e inténtalo de nuevo.',
  retryLabel = 'Reintentar',
  className = '',
}: ErrorStateProps) {
  return (
    <div role="alert" className={`flex flex-col items-center gap-3 px-8 py-12 text-center ${className}`}>
      <span className="mb-1 flex size-[72px] items-center justify-center rounded-full bg-danger-soft text-danger">
        <CloudOff size={36} aria-hidden="true" />
      </span>
      <h2 className="text-[18px] leading-6 font-semibold">{title}</h2>
      <p className="text-body text-text-muted">{message}</p>
      <Button label={retryLabel} size="lg" icon={RotateCw} onClick={onRetry} className="mt-2" />
    </div>
  )
}
