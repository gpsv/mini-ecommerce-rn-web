import { z } from 'zod';
import { CatalogProductSchema } from '../catalog/product.schema';

export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;
export const CART_STORAGE_VERSION = 1;

/** Product snapshot plus quantity, so the cart renders even before the catalog loads. */
export const CartItemSchema = CatalogProductSchema.pick({
  id: true,
  title: true,
  priceInCents: true,
  image: true,
  category: true,
}).extend({
  quantity: z.number().int().min(MIN_QUANTITY).max(MAX_QUANTITY),
});

export const PersistedCartSchema = z.object({
  version: z.literal(CART_STORAGE_VERSION),
  items: z
    .array(CartItemSchema)
    .refine(
      items => new Set(items.map(item => item.id)).size === items.length,
      { message: 'Duplicated product ids in cart' },
    ),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type CartProductSnapshot = Omit<CartItem, 'quantity'>;
export type PersistedCart = z.infer<typeof PersistedCartSchema>;
