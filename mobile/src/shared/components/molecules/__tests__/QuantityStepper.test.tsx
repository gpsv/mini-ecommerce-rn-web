import { fireEvent, render, screen } from '@testing-library/react-native';
import { MAX_QUANTITY } from '@core/cart/cart.schema';
import { QuantityStepper } from '../QuantityStepper';

function renderStepper(quantity: number, withRemove = true) {
  const handlers = {
    onIncrease: jest.fn(),
    onDecrease: jest.fn(),
    onRemoveRequest: jest.fn(),
  };
  render(
    <QuantityStepper
      quantity={quantity}
      onIncrease={handlers.onIncrease}
      onDecrease={handlers.onDecrease}
      onRemoveRequest={withRemove ? handlers.onRemoveRequest : undefined}
    />,
  );
  return handlers;
}

describe('QuantityStepper', () => {
  it('replaces − with delete at quantity 1 and requests removal', () => {
    const handlers = renderStepper(1);

    expect(screen.queryByLabelText('Quitar uno')).toBeNull();
    fireEvent.press(screen.getByLabelText('Eliminar producto'));

    expect(handlers.onRemoveRequest).toHaveBeenCalledTimes(1);
    expect(handlers.onDecrease).not.toHaveBeenCalled();
  });

  it('disables − at quantity 1 when removal is not offered', () => {
    const handlers = renderStepper(1, false);

    const decreaseButton = screen.getByLabelText('Quitar uno');
    expect(decreaseButton).toBeDisabled();
    fireEvent.press(decreaseButton);

    expect(handlers.onDecrease).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Eliminar producto')).toBeNull();
  });

  it('decreases above quantity 1', () => {
    const handlers = renderStepper(2);

    fireEvent.press(screen.getByLabelText('Quitar uno'));

    expect(handlers.onDecrease).toHaveBeenCalledTimes(1);
    expect(handlers.onRemoveRequest).not.toHaveBeenCalled();
  });

  it(`disables + at ${MAX_QUANTITY}`, () => {
    const handlers = renderStepper(MAX_QUANTITY);

    const increaseButton = screen.getByLabelText('Agregar uno');
    expect(increaseButton).toBeDisabled();
    fireEvent.press(increaseButton);

    expect(handlers.onIncrease).not.toHaveBeenCalled();
  });

  it('increases below the maximum', () => {
    const handlers = renderStepper(MAX_QUANTITY - 1);

    fireEvent.press(screen.getByLabelText('Agregar uno'));

    expect(handlers.onIncrease).toHaveBeenCalledTimes(1);
  });
});
