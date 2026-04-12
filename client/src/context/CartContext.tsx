import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '@/types/order.types';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  producerId: string | null; // Cart can only contain items from one producer at a time
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const producerId = items[0]?.producer_id ?? null;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = (newItem: CartItem) => {
    // If cart has items from a different producer, clear first
    if (producerId && newItem.producer_id !== producerId) {
      setItems([{ ...newItem, quantity: 1 }]);
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.listing_id === newItem.listing_id);
      if (existing) {
        return prev.map((i) =>
          i.listing_id === newItem.listing_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (listingId: string) => {
    setItems((prev) => prev.filter((i) => i.listing_id !== listingId));
  };

  const updateQuantity = (listingId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(listingId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.listing_id === listingId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, itemCount, totalAmount, producerId, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
