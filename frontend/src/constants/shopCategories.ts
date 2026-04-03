export const SHOP_CATEGORIES = ['all', 'robotics', 'eco', 'audio', 'crafts', 'sensor'] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

const SET = new Set<string>(SHOP_CATEGORIES);

/** True if `raw` is a recognized category query token (e.g. robotics, all). */
export function isShopCategoryToken(raw: string): boolean {
  return SET.has(raw.toLowerCase());
}

export function normalizeShopCategory(raw: string | null | undefined): ShopCategory {
  if (!raw) return 'all';
  const v = raw.toLowerCase();
  if (SET.has(v)) return v as ShopCategory;
  return 'all';
}

export function shopCategoryLabel(cat: ShopCategory): string {
  if (cat === 'all') return 'All kits';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}
