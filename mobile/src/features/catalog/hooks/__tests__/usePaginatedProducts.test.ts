import { act, renderHook } from '@testing-library/react-native';
import { PAGE_SIZE, usePaginatedProducts } from '../usePaginatedProducts';

const range = (length: number) => Array.from({ length }, (_, index) => index + 1);

describe('usePaginatedProducts', () => {
  it('shows pages of 8 and stops at the last item', () => {
    const items = range(20);
    const { result } = renderHook(() => usePaginatedProducts(items));

    expect(PAGE_SIZE).toBe(8);
    expect(result.current.visibleItems).toEqual(range(8));
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toHaveLength(16);

    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toEqual(items);
    expect(result.current.hasMore).toBe(false);

    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toHaveLength(20);
  });

  it('goes back to page 1 when the filtered list changes', () => {
    const allItems = range(20);
    const { result, rerender } = renderHook(
      ({ items }: { items: readonly number[] }) => usePaginatedProducts(items),
      { initialProps: { items: allItems } },
    );
    act(() => result.current.loadMore());
    expect(result.current.visibleItems).toHaveLength(16);

    const filteredItems = allItems.filter(item => item % 2 === 0);
    rerender({ items: filteredItems });

    expect(result.current.visibleItems).toEqual(filteredItems.slice(0, 8));
    expect(result.current.hasMore).toBe(true);
  });

  it('keeps the current page when it re-renders with the same list', () => {
    const items = range(20);
    const { result, rerender } = renderHook(
      ({ list }: { list: readonly number[] }) => usePaginatedProducts(list),
      { initialProps: { list: items } },
    );
    act(() => result.current.loadMore());

    rerender({ list: items });

    expect(result.current.visibleItems).toHaveLength(16);
  });

  it('has no more pages when the list fits in one', () => {
    const { result } = renderHook(() => usePaginatedProducts(range(3)));

    expect(result.current.visibleItems).toEqual([1, 2, 3]);
    expect(result.current.hasMore).toBe(false);
  });
});
