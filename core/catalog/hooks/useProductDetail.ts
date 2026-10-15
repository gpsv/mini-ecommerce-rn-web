import { hasApiErrorCode } from '../../store/apiErrors';
import { API_ERROR_CODES } from '../../store/baseApi';
import { catalogApi, useGetProductByIdQuery } from '../catalogApi';
import type { CatalogProduct } from '../product.schema';

export type ProductDetailStatus = 'loading' | 'error' | 'notFound' | 'success';

export interface ProductDetail {
  status: ProductDetailStatus;
  product: CatalogProduct | undefined;
  retry: () => void;
}

/**
 * Reads the product from the getProducts cache (D06). useQueryState only
 * reads: it neither subscribes nor starts a request. getProductById runs only
 * when the product is not cached (fallback kept for web deep links, D16).
 */
export function useProductDetail(productId: number): ProductDetail {
  const { cachedProduct } = catalogApi.endpoints.getProducts.useQueryState(undefined, {
    selectFromResult: ({ data }) => ({
      cachedProduct: data?.find(product => product.id === productId),
    }),
  });

  const fallback = useGetProductByIdQuery(productId, {
    skip: cachedProduct !== undefined,
  });

  const product = cachedProduct ?? fallback.data;
  let status: ProductDetailStatus = 'loading';
  if (product) {
    status = 'success';
  } else if (fallback.isError) {
    status = hasApiErrorCode(fallback.error, API_ERROR_CODES.productNotFound)
      ? 'notFound'
      : 'error';
  }

  return { status, product, retry: fallback.refetch };
}
