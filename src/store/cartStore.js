// Enhanced CartStore.js
// First, let's improve the cart store implementation
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (item) => {
        const { items } = get();
        
        // Check if we already have this exact item in the cart
        const existingItemIndex = items.findIndex(
          (existingItem) => existingItem.id === item.id
        );
        
        if (existingItemIndex >= 0) {
          // For books, we generally want to replace the entry rather than increase quantity
          // since it could have updated properties
          if (item.type === 'custom-book') {
            const updatedItems = [...items];
            updatedItems[existingItemIndex] = {
              ...item,
              quantity: 1, // Always set quantity to 1 for books
              dateAdded: new Date().toISOString() // Update the timestamp
            };
            set({ items: updatedItems });
          } else {
            // For other items, update quantity as before
            const updatedItems = [...items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: (updatedItems[existingItemIndex].quantity || 1) + 1,
            };
            set({ items: updatedItems });
          }
        } else {
          // New item, add to cart with timestamp
          set({ 
            items: [
              ...items, 
              { 
                ...item, 
                quantity: 1,
                dateAdded: item.dateAdded || new Date().toISOString()
              }
            ] 
          });
        }
        
        // For debugging
        console.log('Cart updated:', get().items);
      },
      
      // Remove item from cart
      removeItem: (itemId) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.id !== itemId),
        });
      },
      
      // Update item quantity
      updateItemQuantity: (itemId, quantity) => {
        const { items } = get();
        const updatedItems = items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        
        set({ items: updatedItems });
      },
      
      // Clear cart
      clearCart: () => set({ items: [] }),
      
      // Get cart total
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
      },
      
      // Get item count
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + (item.quantity || 1), 0);
      },
    }),
    {
      name: 'tap-cart-storage', // Storage key
    }
  )
);

export default useCartStore;
