import { z } from 'zod';
import { toCents } from '../shared/money';

/**
 * Raw product as returned by GET https://fakestoreapi.com/products.
 * Written against a real response (see __tests__/fixtures/products.json).
 * Unknown keys are stripped, so new API fields do not break the app.
 * `category` is a plain string, not an enum: a new category must not fail
 * validation (labels fall back to the raw value).
 */
export const ProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string(),
  category: z.string().min(1),
  image: z.url(),
  rating: z.object({
    rate: z.number().min(0).max(5),
    count: z.number().int().nonnegative(),
  }),
});

export const ProductListSchema = z.array(ProductSchema);

/** Product as the app uses it: the price already converted to integer cents. */
export const CatalogProductSchema = ProductSchema.omit({ price: true }).extend({
  priceInCents: z.number().int().nonnegative(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CatalogProduct = z.infer<typeof CatalogProductSchema>;

export function toCatalogProduct({ price, ...product }: Product): CatalogProduct {
  return { ...product, priceInCents: toCents(price) };
}
