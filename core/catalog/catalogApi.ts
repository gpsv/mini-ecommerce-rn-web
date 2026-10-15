import { API_ERROR_CODES, baseApi } from '../store/baseApi';
import {
  ProductListSchema,
  ProductSchema,
  toCatalogProduct,
  type CatalogProduct,
  type Product,
} from './product.schema';

export const catalogApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getProducts: build.query<CatalogProduct[], void>({
      query: () => '/products',
      rawResponseSchema: ProductListSchema,
      transformResponse: (products: Product[]) => products.map(toCatalogProduct),
      providesTags: products => [
        { type: 'Product', id: 'LIST' },
        ...(products ?? []).map(({ id }) => ({ type: 'Product' as const, id })),
      ],
    }),
    /**
     * Fallback only (D16): the detail screen reads the product from the
     * getProducts cache. This runs when the product is not there, e.g. when
     * web opens /product/:id directly.
     * The API answers an unknown id with 200 and an empty body, which
     * fetchBaseQuery parses as null: validateStatus turns that into an error
     * and transformErrorResponse gives it the PRODUCT_NOT_FOUND code.
     */
    getProductById: build.query<CatalogProduct, number>({
      query: id => ({
        url: `/products/${id}`,
        validateStatus: (response, body) => response.ok && body !== null,
      }),
      rawResponseSchema: ProductSchema,
      transformResponse: (product: Product) => toCatalogProduct(product),
      transformErrorResponse: (error, meta) =>
        meta?.response?.ok
          ? { status: 'CUSTOM_ERROR' as const, error: API_ERROR_CODES.productNotFound }
          : error,
      providesTags: (_product, _error, id) => [{ type: 'Product', id }],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = catalogApi;
