import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckoutContactSchema,
  type CheckoutContact,
} from '@core/checkout/checkout.schema';
import { confirmOrder, selectCheckoutStatus } from '@core/checkout/checkoutSlice';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';

const EMPTY_CONTACT: CheckoutContact = { name: '', email: '', phone: '' };

interface UseCheckoutFormOptions {
  /** Called once the simulated order is confirmed (the cart is already empty). */
  onConfirmed: () => void;
}

/**
 * Contact form validated with core's CheckoutContactSchema. Validates on submit
 * and then on every change; the first invalid field gets focus.
 */
export function useCheckoutForm({ onConfirmed }: UseCheckoutFormOptions) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectCheckoutStatus);
  const form = useForm<CheckoutContact>({
    resolver: zodResolver(CheckoutContactSchema),
    defaultValues: EMPTY_CONTACT,
  });

  const handleValidContact = async (contact: CheckoutContact) => {
    const result = await dispatch(confirmOrder(contact));
    if (confirmOrder.fulfilled.match(result)) {
      onConfirmed();
    }
  };
  // RN events are not DOM events: handleSubmit is called without one.
  const submit = () => {
    form.handleSubmit(handleValidContact)();
  };

  return {
    control: form.control,
    setFocus: form.setFocus,
    submit,
    /**
     * Also true while 'confirmed': the cart is cleared before navigating away,
     * and the button must not come back for that instant.
     */
    isBusy: status !== 'idle',
  };
}
