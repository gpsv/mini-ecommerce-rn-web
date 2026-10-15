import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('calls onPress when enabled', () => {
    const onPress = jest.fn();
    render(<Button label="Agregar" onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Agregar' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled and busy while loading, and ignores presses', () => {
    const onPress = jest.fn();
    render(<Button label="Procesando…" isLoading onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Procesando…' });
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
    fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
  });

  it('ignores presses when disabled', () => {
    const onPress = jest.fn();
    render(<Button label="Confirmar compra" disabled onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Confirmar compra' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
