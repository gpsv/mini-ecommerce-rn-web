import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { CheckoutContactSchema, type CheckoutContact } from '../checkout.schema';
import { confirmOrder, selectCheckoutStatus } from '../checkoutSlice';

const EMPTY_CONTACT: CheckoutContact = { name: '', email: '', phone: '' };

interface UseCheckoutFormOptions {
  /** Called once the simulated order is confirmed (the cart is already empty). */
  onConfirmed: () => void;
}

/** A web form submit event or a React Native press event: both can be passed or omitted. */
interface SubmitEvent {
  preventDefault?: () => void;
}

/**
 * Contact form validated with core's CheckoutContactSchema. Validates on submit
 * and then on every change; the first invalid field gets focus.
 * Mobile renders fields with `control` (Controller) and web with `register`.
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
  // Stops the browser's page reload; the event is not handed to handleSubmit
  // because RN press events are not DOM events.
  const submit = (event?: SubmitEvent) => {
    event?.preventDefault?.();
    form.handleSubmit(handleValidContact)();
  };

  return {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
    setFocus: form.setFocus,
    submit,
    /**
     * Also true while 'confirmed': the cart is cleared before navigating away,
     * and the button must not come back for that instant (D38).
     */
    isBusy: status !== 'idle',
  };
}
