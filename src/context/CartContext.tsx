import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { cartAPI } from '../lib/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    tagline?: string;
    stock: number;
  };
  quantity: number;
  itemTotal: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: number;
  totalItems: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
      setTotalItems(0);
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await cartAPI.get();
      const cartData = response.data.data.cart;

      setCartItems(cartData.items);
      setCartTotal(cartData.totalAmount);
      setTotalItems(cartData.totalItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) throw new Error('User must be logged in');

    try {
      setLoading(true);
      await cartAPI.add(productId, quantity);
      await refreshCart();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      setLoading(true);
      await cartAPI.remove(productId);
      await refreshCart();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) throw new Error('User must be logged in');

    try {
      setLoading(true);
      await cartAPI.update(productId, quantity);
      await refreshCart();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) throw new Error('User must be logged in');

    try {
      setLoading(true);
      await cartAPI.clear();
      await refreshCart();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        totalItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
