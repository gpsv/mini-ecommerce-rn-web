import { z } from 'zod';

const PHONE_PATTERN = /^\d{10}$/;

export const CheckoutContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Ingresa tu nombre')
    .max(80, 'El nombre debe tener máximo 80 caracteres'),
  email: z.string().trim().pipe(z.email('Ingresa un correo válido')),
  phone: z
    .string()
    .trim()
    .regex(PHONE_PATTERN, 'Ingresa 10 dígitos, sin espacios ni guiones'),
});

export type CheckoutContact = z.infer<typeof CheckoutContactSchema>;
