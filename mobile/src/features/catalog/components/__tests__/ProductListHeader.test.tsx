import { render, screen } from '@testing-library/react-native';
import { ProductListHeader } from '../ProductListHeader';

function renderHeader(totalCount: number | null) {
  render(
    <ProductListHeader
      searchText=""
      onChangeSearchText={jest.fn()}
      onClearSearch={jest.fn()}
      categoryOptions={[]}
      selectedCategory={null}
      onSelectCategory={jest.fn()}
      totalCount={totalCount}
      onLayout={jest.fn()}
    />,
  );
}

describe('ProductListHeader', () => {
  it('hides the count while there is no data (loading or error)', () => {
    renderHeader(null);

    expect(screen.queryByText(/productos?$/)).not.toBeOnTheScreen();
    expect(screen.queryByText('Cargando productos…')).not.toBeOnTheScreen();
  });

  it('shows the count with data, singular and plural', () => {
    renderHeader(20);
    expect(screen.getByText('20 productos')).toBeOnTheScreen();

    renderHeader(1);
    expect(screen.getByText('1 producto')).toBeOnTheScreen();
  });

  it('shows 0 productos when filters leave no results', () => {
    renderHeader(0);

    expect(screen.getByText('0 productos')).toBeOnTheScreen();
  });
});
