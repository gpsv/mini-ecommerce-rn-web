import { fireEvent, render, screen } from '@testing-library/react-native';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('shows the message and calls onRetry from "Reintentar"', () => {
    const onRetry = jest.fn();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByText('No pudimos cargar los productos')).toBeOnTheScreen();
    expect(
      screen.getByText('Revisa tu conexión a internet e inténtalo de nuevo.'),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('accepts custom texts', () => {
    render(
      <ErrorState
        onRetry={jest.fn()}
        title="Producto no encontrado"
        message="Puede que ya no esté disponible."
        retryLabel="Volver a intentar"
      />,
    );

    expect(screen.getByText('Producto no encontrado')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Volver a intentar' })).toBeOnTheScreen();
  });
});
