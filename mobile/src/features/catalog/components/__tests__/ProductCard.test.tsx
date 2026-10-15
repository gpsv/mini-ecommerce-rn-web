import { fireEvent, render, screen } from '@testing-library/react-native';
import { toCatalogProduct } from '@core/catalog/product.schema';
import products from '@core/__tests__/fixtures/products.json';
import { ProductCard } from '../ProductCard';

const product = toCatalogProduct(products[0]);

function renderCard() {
  const onPressDetail = jest.fn();
  const onAddToCart = jest.fn();
  render(
    <ProductCard
      product={product}
      width={158}
      onPressDetail={onPressDetail}
      onAddToCart={onAddToCart}
    />,
  );
  return { onPressDetail, onAddToCart };
}

describe('ProductCard', () => {
  it('shows title, price and the Spanish category label', () => {
    renderCard();

    expect(screen.getByText(product.title)).toBeOnTheScreen();
    expect(screen.getByText('$109.95')).toBeOnTheScreen();
    expect(screen.getByText('Ropa de hombre')).toBeOnTheScreen();
  });

  it('calls onPressDetail with the product from "Ver detalle"', () => {
    const { onPressDetail, onAddToCart } = renderCard();

    fireEvent.press(screen.getByRole('button', { name: 'Ver detalle' }));

    expect(onPressDetail).toHaveBeenCalledTimes(1);
    expect(onPressDetail).toHaveBeenCalledWith(product);
    expect(onAddToCart).not.toHaveBeenCalled();
  });

  it('calls onAddToCart with the product from "Agregar"', () => {
    const { onPressDetail, onAddToCart } = renderCard();

    fireEvent.press(screen.getByRole('button', { name: 'Agregar' }));

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(product);
    expect(onPressDetail).not.toHaveBeenCalled();
  });
});
