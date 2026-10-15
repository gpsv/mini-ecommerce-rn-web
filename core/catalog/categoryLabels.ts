/**
 * Spanish labels for the API categories. Keys keep the API value as-is,
 * including its "jewelery" misspelling: only the label changes.
 */
export const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  electronics: 'Electrónica',
  jewelery: 'Joyería',
  "men's clothing": 'Ropa de hombre',
  "women's clothing": 'Ropa de mujer',
};

/** Returns the Spanish label, or the raw value for a category we do not know yet. */
export function getCategoryLabel(category: string): string {
  return Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, category)
    ? CATEGORY_LABELS[category]
    : category;
}
