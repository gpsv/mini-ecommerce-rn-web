import type { CategoryOption } from '@core/catalog/categoryLabels'

export interface CategoryChipsProps {
  options: readonly CategoryOption[]
  /** null means "Todas". */
  selectedValue: string | null
  onSelect: (value: string | null) => void
  className?: string
}

interface CategoryChipProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

function CategoryChip({ label, isSelected, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`focus-ring h-10 shrink-0 cursor-pointer rounded-full border px-4 text-[14px] transition-colors ${
        isSelected
          ? 'border-primary bg-primary font-semibold text-primary-foreground'
          : 'border-border bg-surface font-medium text-text hover:border-primary hover:text-primary'
      }`}
    >
      {label}
    </button>
  )
}

/** 17-Web-Listado: toggle buttons (aria-pressed) that wrap to more lines. */
export function CategoryChips({ options, selectedValue, onSelect, className = '' }: CategoryChipsProps) {
  return (
    <div role="group" aria-label="Filtrar por categoría" className={`-mx-4 flex gap-2 overflow-x-auto px-4 py-1 min-[641px]:mx-0 min-[641px]:flex-wrap min-[641px]:overflow-visible min-[641px]:px-0 ${className}`}>
      <CategoryChip label="Todas" isSelected={selectedValue === null} onClick={() => onSelect(null)} />
      {options.map((option) => (
        <CategoryChip
          key={option.value}
          label={option.label}
          isSelected={selectedValue === option.value}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </div>
  )
}
