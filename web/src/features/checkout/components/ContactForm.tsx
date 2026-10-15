import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { CheckoutContact } from '@core/checkout/checkout.schema'
import { TextField } from '../../../shared/components/atoms/TextField'

export interface ContactFormProps {
  id: string
  register: UseFormRegister<CheckoutContact>
  errors: FieldErrors<CheckoutContact>
  isDisabled: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

/**
 * 20-Web-Checkout "Datos de contacto". The submit button lives in the summary
 * and points here with form={id}. noValidate: Zod validates, not the browser.
 */
export function ContactForm({ id, register, errors, isDisabled, onSubmit }: ContactFormProps) {
  return (
    <form
      id={id}
      noValidate
      aria-labelledby="contact-form-title"
      onSubmit={onSubmit}
      className="rounded-lg bg-surface p-6 shadow-card min-[641px]:p-8"
    >
      {/* fieldset only to disable every field at once while the order is processed. */}
      <fieldset disabled={isDisabled} className="flex min-w-0 flex-col gap-5">
        <div>
          <h2 id="contact-form-title" className="text-[18px] leading-6 font-semibold">
            Datos de contacto
          </h2>
          <p className="mt-1 text-body text-text-muted">
            Usaremos estos datos para confirmar tu pedido. Compra simulada: no se realiza ningún cobro.
          </p>
        </div>
        <TextField
          label="Nombre"
          autoComplete="name"
          errorMessage={errors.name?.message}
          {...register('name')}
        />
        <div className="grid grid-cols-1 gap-5 min-[641px]:grid-cols-2">
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            errorMessage={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Teléfono"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10 dígitos"
            autoComplete="tel"
            helpText="10 dígitos, sin espacios ni guiones"
            errorMessage={errors.phone?.message}
            {...register('phone')}
          />
        </div>
      </fieldset>
    </form>
  )
}
