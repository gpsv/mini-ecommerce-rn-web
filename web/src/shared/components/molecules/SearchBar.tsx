import { Search, X } from 'lucide-react'
import { IconButton } from '../atoms/IconButton'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  className?: string
}

/** Controlled input; debouncing belongs to useProductListing (useDebouncedValue). */
export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Buscar por nombre',
  className = '',
}: SearchBarProps) {
  return (
    <div
      role="search"
      className={`flex h-12 items-center gap-2 rounded-md border border-input-border bg-surface pl-3.5 text-text-muted focus-within:border-2 focus-within:border-primary focus-within:pl-[13px] focus-within:text-primary ${className}`}
    >
      <Search size={20} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Buscar productos por nombre"
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-text outline-none placeholder:text-text-muted [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <IconButton icon={X} label="Borrar búsqueda" variant="muted" className="mr-0.5 size-11" onClick={onClear} />
      ) : (
        <span className="w-2.5" />
      )}
    </div>
  )
}
