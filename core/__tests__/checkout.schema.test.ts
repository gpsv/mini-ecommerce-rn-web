import { CheckoutContactSchema } from '../checkout/checkout.schema';

const validContact = {
  name: 'María López',
  email: 'maria.lopez@correo.com',
  phone: '4431234567',
};

function getMessages(input: unknown): string[] {
  const result = CheckoutContactSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map(issue => issue.message);
}

describe('CheckoutContactSchema', () => {
  it('accepts a valid contact and trims spaces', () => {
    const result = CheckoutContactSchema.parse({
      ...validContact,
      name: '  María López ',
      email: ' maria.lopez@correo.com ',
    });
    expect(result).toEqual(validContact);
  });

  it('rejects an invalid email with a Spanish message', () => {
    expect(getMessages({ ...validContact, email: 'maria.lopez@correo' })).toEqual(
      ['Ingresa un correo válido'],
    );
  });

  it.each([
    ['9 digits', '443123456'],
    ['11 digits', '44312345678'],
    ['dashes', '443-123-4567'],
    ['inner spaces', '443 123 4567'],
    ['letters', '44312345ab'],
  ])('rejects a phone with %s', (_case, phone) => {
    expect(getMessages({ ...validContact, phone })).toEqual([
      'Ingresa 10 dígitos, sin espacios ni guiones',
    ]);
  });

  it('rejects an empty or blank name', () => {
    expect(getMessages({ ...validContact, name: '' })).toEqual([
      'Ingresa tu nombre',
    ]);
    expect(getMessages({ ...validContact, name: '   ' })).toEqual([
      'Ingresa tu nombre',
    ]);
  });

  it('rejects a name longer than 80 characters', () => {
    expect(getMessages({ ...validContact, name: 'a'.repeat(81) })).toEqual([
      'El nombre debe tener máximo 80 caracteres',
    ]);
  });
});
