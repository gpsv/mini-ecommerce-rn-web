import { fireEvent, render, screen } from '@testing-library/react-native';
import { toCatalogProduct } from '@core/catalog/product.schema';
import products from '@core/__tests__/fixtures/products.json';
import { ProductCard } from '../ProductCard';
import { CARD_MAX_FONT_SCALE } from '../productGridLayout';

const product = toCatalogProduct(products[0]);

function renderCard() {
  const onPressDetail = jest.fn();
  const onAddToCart = jest.fn();
  render(
    <ProductCard
      product={product}
      width={158}
      height={380}
      fontScale={CARD_MAX_FONT_SCALE}
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

  it('scales its texts by fontScale and ignores the system font scale', () => {
    renderCard();

    // body 14/20, price-md 22/28, caption 12/16 and button sm 14/20 × 1.3.
    const cases: Array<[string, number, number]> = [
      [product.title, 14, 20],
      ['$109.95', 22, 28],
      ['Ropa de hombre', 12, 16],
      ['Ver detalle', 14, 20],
    ];
    cases.forEach(([text, fontSize, lineHeight]) => {
      const node = screen.getByText(text);
      expect(node).toHaveProp('allowFontScaling', false);
      expect(node).toHaveStyle({
        fontSize: fontSize * CARD_MAX_FONT_SCALE,
        lineHeight: lineHeight * CARD_MAX_FONT_SCALE,
      });
    });
  });
});
