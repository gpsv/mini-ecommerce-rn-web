import { View } from 'react-native';
import { Controller, type Control, type UseFormSetFocus } from 'react-hook-form';
import type { CheckoutContact } from '@core/checkout/checkout.schema';
import { AppText } from '../../../shared/components/atoms/AppText';
import { TextField } from '../../../shared/components/atoms/TextField';
import { getLegacyShadowStyle } from '../../../shared/platform/shadows';

export interface ContactFormProps {
  control: Control<CheckoutContact>;
  setFocus: UseFormSetFocus<CheckoutContact>;
  isDisabled: boolean;
  onSubmit: () => void;
}

/** 11-Checkout "Datos de contacto": keyboard per field and "next" between fields. */
export function ContactForm({ control, setFocus, isDisabled, onSubmit }: ContactFormProps) {
  return (
    <View
      className="p-4 gap-4 bg-surface rounded-lg shadow-card"
      style={getLegacyShadowStyle('card')}
    >
      <AppText variant="subtitle" accessibilityRole="header">
        Datos de contacto
      </AppText>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            ref={field.ref}
            label="Nombre"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            disabled={isDisabled}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => setFocus('email')}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            ref={field.ref}
            label="Correo"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            disabled={isDisabled}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => setFocus('phone')}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <TextField
            ref={field.ref}
            label="Teléfono"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            hint="10 dígitos, sin espacios ni guiones"
            placeholder="10 dígitos"
            disabled={isDisabled}
            keyboardType="phone-pad"
            maxLength={10}
            autoComplete="tel"
            textContentType="telephoneNumber"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        )}
      />
    </View>
  );
}
