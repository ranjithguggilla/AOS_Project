import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import type { CartItem } from './cartTypes';

function normalizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((i: Record<string, unknown>) => ({
    productId: String(i.productId ?? ''),
    cartLineId: String(i.cartLineId ?? i.productId ?? ''),
    name: String(i.name ?? ''),
    image: String(i.image ?? ''),
    price: typeof i.price === 'number' ? i.price : Number(i.price) || 0,
    qty: typeof i.qty === 'number' ? i.qty : Number(i.qty) || 1,
    ...(i.customization && typeof i.customization === 'object'
      ? { customization: i.customization as CartItem['customization'] }
      : {}),
  })).filter((x) => x.productId && x.cartLineId);
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CartCtx {
  cartItems: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartLineId: string) => void;
  updateCartQty: (cartLineId: string, qty: number) => void;
  clearCart: () => void;
  saveShippingAddress: (addr: ShippingAddress) => void;
  savePaymentMethod: (m: string) => void;
}

const CartContext = createContext<CartCtx>({} as CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const { userInfo } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const s = localStorage.getItem('cartItems');
    return s ? normalizeCartItems(JSON.parse(s)) : [];
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(() => {
    const s = localStorage.getItem('shippingAddress');
    return s ? JSON.parse(s) : { address: '', city: '', postalCode: '', country: '' };
  });
  const [paymentMethod, setPaymentMethod] = useState(() => localStorage.getItem('paymentMethod') || 'stripe_sandbox');

  useEffect(() => { localStorage.setItem('cartItems', JSON.stringify(cartItems)); }, [cartItems]);

  const authHeader = userInfo ? { Authorization: `Bearer ${userInfo.token}` } : {};

  const addToCart = (item: CartItem) => {
    const lineId = item.cartLineId || item.productId;
    setCartItems((prev) => {
      const idx = prev.findIndex((x) => x.cartLineId === lineId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          qty: next[idx].qty + item.qty,
          price: item.price,
          ...(item.customization ? { customization: item.customization } : {}),
        };
        return next;
      }
      return [...prev, { ...item, cartLineId: lineId }];
    });
    if (userInfo) {
      axios
        .post(
          '/api/cart/add',
          {
            productId: item.productId,
            cartLineId: lineId,
            name: item.name,
            image: item.image,
            price: item.price,
            qty: item.qty,
            ...(item.customization ? { customization: item.customization } : {}),
          },
          { headers: authHeader }
        )
        .catch(() => {});
    }
  };

  const removeFromCart = (cartLineId: string) => {
    setCartItems((prev) => prev.filter((x) => x.cartLineId !== cartLineId));
    if (userInfo) {
      axios.delete('/api/cart/remove', { headers: authHeader, data: { cartLineId } }).catch(() => {});
    }
  };

  const updateCartQty = (cartLineId: string, qty: number) => {
    setCartItems((prev) => prev.map((x) => (x.cartLineId === cartLineId ? { ...x, qty } : x)));
    if (userInfo) {
      axios.put('/api/cart/update', { cartLineId, qty }, { headers: authHeader }).catch(() => {});
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
    if (userInfo) {
      axios.delete(`/api/cart/clear/${userInfo._id}`, { headers: authHeader }).catch(() => {});
    }
  };

  const saveShippingAddress = (addr: ShippingAddress) => {
    setShippingAddress(addr);
    localStorage.setItem('shippingAddress', JSON.stringify(addr));
  };

  const savePaymentMethod = (m: string) => {
    setPaymentMethod(m);
    localStorage.setItem('paymentMethod', m);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingAddress,
        paymentMethod,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        saveShippingAddress,
        savePaymentMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
