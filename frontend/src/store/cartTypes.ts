/** Unique row in cart: base kit = productId; customized = productId::sortedComponentIds */
export function makeCartLineId(productId: string, componentIds: string[]): string {
  if (!componentIds?.length) return productId;
  return `${productId}::${[...componentIds].sort().join(',')}`;
}

export interface CartCustomization {
  componentIds: string[];
  bom?: { name: string; sku: string; price: number }[];
  basePrice?: number;
}

export interface CartItem {
  productId: string;
  /** Stable key for the same product + same module selection */
  cartLineId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
  customization?: CartCustomization;
}
