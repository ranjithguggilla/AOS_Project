import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  qty: number;
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
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  saveShippingAddress: (addr: ShippingAddress) => void;
  savePaymentMethod: (m: string) => void;
}

const CartContext = createContext<CartCtx>({} as CartCtx);

export function CartProvider({ children }: { children: ReactNode }) {
  const { userInfo } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const s = localStorage.getItem('cartItems');
    return s ? JSON.parse(s) : [];
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(() => {
    const s = localStorage.getItem('shippingAddress');
    return s ? JSON.parse(s) : { address: '', city: '', postalCode: '', country: '' };
  });
  const [paymentMethod, setPaymentMethod] = useState(() => localStorage.getItem('paymentMethod') || 'stripe_sandbox');

  useEffect(() => { localStorage.setItem('cartItems', JSON.stringify(cartItems)); }, [cartItems]);

  const authHeader = userInfo ? { Authorization: `Bearer ${userInfo.token}` } : {};

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const idx = prev.findIndex(x => x.productId === item.productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
    if (userInfo) {
      axios.post('/api/cart/add', item, { headers: authHeader }).catch(() => {});
    }
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(x => x.productId !== productId));
    if (userInfo) {
      axios.delete('/api/cart/remove', { headers: authHeader, data: { productId } }).catch(() => {});
    }
  };

  const updateCartQty = (productId: string, qty: number) => {
    setCartItems(prev => prev.map(x => x.productId === productId ? { ...x, qty } : x));
    if (userInfo) {
      axios.put('/api/cart/update', { productId, qty }, { headers: authHeader }).catch(() => {});
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
    <CartContext.Provider value={{ cartItems, shippingAddress, paymentMethod, addToCart, removeFromCart, updateCartQty, clearCart, saveShippingAddress, savePaymentMethod }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
