import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartItem, Product, BackendProduct, transformProduct } from '@/types/product';
import { cartAPI, checkoutAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface GreenerSuggestion {
  current: {
    id: string;
    name: string;
    price: number;
    eco_score: number;
    quantity: number;
  };
  alternatives: Array<{
    id: string;
    name: string;
    price: number;
    eco_score: number;
    improvementPercent: number;
  }>;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  swapProduct: (oldProductId: string, newProductId: string) => Promise<void>;
  totalItems: number;
  subtotal: number;
  averageEcoScore: number;
  isLoading: boolean;
  greenerSuggestions: GreenerSuggestion[];
  fetchGreenerSuggestions: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [greenerSuggestions, setGreenerSuggestions] = useState<GreenerSuggestion[]>([]);
  const { isAuthenticated, refreshUser } = useAuth();

  // Transform backend cart to frontend format
  const transformCart = (backendItems: any[]): CartItem[] => {
    return backendItems
      .filter(item => item.product) // Filter out items with null products
      .map(item => ({
        product: transformProduct(item.product as BackendProduct),
        quantity: item.quantity,
      }));
  };

  // Fetch cart from backend
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      const cartData = response.data;
      setItems(transformCart(cartData.items || []));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch cart when auth changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartAPI.addToCart(product.id, quantity);
      setItems(transformCart(response.data.items || []));
      toast.success(`${product.name} added to cart`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await cartAPI.removeItem(productId);
      setItems(transformCart(response.data.items || []));
      toast.success('Item removed from cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      setIsLoading(true);
      const response = await cartAPI.updateQuantity(productId, quantity);
      setItems(transformCart(response.data.items || []));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update quantity';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, removeFromCart]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await cartAPI.clearCart();
      setItems([]);
      toast.success('Cart cleared');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const swapProduct = useCallback(async (oldProductId: string, newProductId: string) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await cartAPI.swapCartItem(oldProductId, newProductId);
      setItems(transformCart(response.data.cart?.items || []));

      // Bonus points are already awarded by the backend in the swap endpoint
      // The backend automatically updates user's eco-points when swapping
      const message = response.data.message || 'Swapped to greener option!';
      toast.success(message);

      // Refresh user data to update eco-points
      if (response.data.bonusPoints && response.data.bonusPoints > 0) {
        await refreshUser();
      }

      // Refresh greener suggestions after swap
      await fetchGreenerSuggestions();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to swap product';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchGreenerSuggestions = useCallback(async () => {
    if (!isAuthenticated || items.length === 0) {
      setGreenerSuggestions([]);
      return;
    }

    try {
      const response = await cartAPI.getGreenerCart();
      setGreenerSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch greener suggestions:', error);
      setGreenerSuggestions([]);
    }
  }, [isAuthenticated, items.length]);

  // Fetch greener suggestions when cart changes
  useEffect(() => {
    if (items.length > 0) {
      fetchGreenerSuggestions();
    }
  }, [items.length, fetchGreenerSuggestions]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const averageEcoScore = items.length > 0
    ? Math.round(items.reduce((sum, item) => sum + item.product.ecoScore * item.quantity, 0) / totalItems)
    : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        swapProduct,
        totalItems,
        subtotal,
        averageEcoScore,
        isLoading,
        greenerSuggestions,
        fetchGreenerSuggestions,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
