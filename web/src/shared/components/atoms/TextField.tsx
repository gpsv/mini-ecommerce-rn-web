import { useId, type InputHTMLAttributes, type Ref } from 'react'
import { CircleAlert } from 'lucide-react'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  /** Shown below the input until there is an error. */
  helpText?: string
  errorMessage?: string
  ref?: Ref<HTMLInputElement>
}

/**
 * 20-Web-Checkout field: visible label, help text and error linked with
 * aria-describedby; the error also sets aria-invalid.
 */
export function TextField({
  label,
  helpText,
  errorMessage,
  className = '',
  ...inputProps
}: TextFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const hasError = Boolean(errorMessage)
  const hint = errorMessage ?? helpText

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-[14px] leading-5 font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={hint ? hintId : undefined}
        className={`h-12 rounded-md bg-surface px-3.5 text-[16px] text-text outline-none placeholder:text-text-muted hover:border-text focus:px-[13px] focus:ring-3 focus:ring-primary/20 disabled:bg-disabled disabled:text-disabled-foreground ${
          hasError
            ? 'border-2 border-danger px-[13px] focus:border-danger'
            : 'border border-input-border focus:border-2 focus:border-primary'
        }`}
        {...inputProps}
      />
      {hint ? (
        <p
          id={hintId}
          className={`flex items-center gap-1.5 text-caption ${hasError ? 'text-danger' : 'text-text-muted'}`}
        >
          {hasError ? <CircleAlert size={14} aria-hidden="true" /> : null}
          {hint}
        </p>
      ) : null}
    </div>
  )
}
