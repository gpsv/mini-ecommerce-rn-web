import { Spinner } from '../atoms/Spinner'

export interface LoadingStateProps {
  label: string
  className?: string
}

export function LoadingState({ label, className = '' }: LoadingStateProps) {
  return (
    <div role="status" className={`flex justify-center py-16 ${className}`}>
      <Spinner size={32} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
