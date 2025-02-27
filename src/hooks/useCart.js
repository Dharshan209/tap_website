import { useCallback, useMemo } from 'react';
import useCartStore from '../store/cartStore';
import { toast } from '../components/ui/toast'; // Assuming you'll add a toast component

export const useCart = () => {
  // Access cart store directly
  const { 
    items, 
    addItem, 
    removeItem, 
    updateItemQuantity, 
    clearCart: clearCartStore,
    getTotal,
    getItemCount
  } = useCartStore();
  
  // Memoize calculations to prevent unnecessary recalculations
  const cartTotal = useMemo(() => getTotal(), [items, getTotal]);
  const itemCount = useMemo(() => getItemCount(), [items, getItemCount]);
  const isCartEmpty = useMemo(() => items.length === 0, [items]);
  
  // Enhanced add book function with validation, error handling, and feedback
  const addBook = useCallback((bookData) => {
    // Input validation
    if (!bookData) {
      console.error('Cannot add null or undefined book to cart');
      toast?.error('Error adding book to cart');
      return null;
    }
    
    try {
      // Generate a unique ID for the book if none exists
      const bookId = bookData.id || `book-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      
      // Create the book object with consistent properties and defaults
      const book = {
        id: bookId,
        ...bookData,
        type: bookData.type || 'custom-book',
        price: Number(bookData.price) || 2499, // Default price in INR, ensure it's a number
        quantity: Number(bookData.quantity) || 1, // Ensure quantity is a number
        dateAdded: bookData.dateAdded || new Date().toISOString()
      };
      
      // Add to cart store
      addItem(book);
      
      // Create a backup in localStorage for resilience
      try {
        const booksBackup = JSON.parse(localStorage.getItem('tap-books-backup') || '[]');
        const existingIndex = booksBackup.findIndex(b => b.id === bookId);
        
        if (existingIndex >= 0) {
          booksBackup[existingIndex] = book;
        } else {
          booksBackup.push(book);
        }
        
        localStorage.setItem('tap-books-backup', JSON.stringify(booksBackup));
      } catch (storageErr) {
        console.error('Error storing book backup:', storageErr);
        // Continue execution despite localStorage error
      }
      
      // Provide feedback
      toast?.success('Book added to cart');
      return bookId;
    } catch (err) {
      console.error('Error adding book to cart:', err, bookData);
      toast?.error('Could not add book to cart');
      return null;
    }
  }, [addItem]);
  
  // Enhanced remove book function with confirmation and feedback
  const removeBook = useCallback((bookId) => {
    if (!bookId) return;
    
    try {
      // Remove from cart
      removeItem(bookId);
      
      // Update backup
      try {
        const booksBackup = JSON.parse(localStorage.getItem('tap-books-backup') || '[]');
        localStorage.setItem('tap-books-backup', 
          JSON.stringify(booksBackup.filter(b => b.id !== bookId))
        );
      } catch (storageErr) {
        console.error('Error updating book backup on remove:', storageErr);
      }
      
      // Provide feedback
      toast?.info('Item removed from cart');
    } catch (err) {
      console.error('Error removing book from cart:', err);
      toast?.error('Could not remove item');
    }
  }, [removeItem]);
  
  // Update quantity function
  const updateQuantity = useCallback((itemId, quantity) => {
    if (!itemId) return;
    
    try {
      // Ensure quantity is valid
      const newQuantity = Math.max(1, Number(quantity) || 1);
      updateItemQuantity(itemId, newQuantity);
    } catch (err) {
      console.error('Error updating item quantity:', err);
      toast?.error('Could not update quantity');
    }
  }, [updateItemQuantity]);
  
  // Clear cart with confirmation
  const clearCart = useCallback(() => {
    try {
      clearCartStore();
      localStorage.removeItem('tap-books-backup');
      toast?.info('Cart cleared');
    } catch (err) {
      console.error('Error clearing cart:', err);
      toast?.error('Could not clear cart');
    }
  }, [clearCartStore]);
  
  // Return all cart functions and state
  return {
    cartItems: items,
    cartTotal,
    itemCount,
    addBook,
    removeBook,
    updateQuantity,
    clearCart,
    isCartEmpty,
  };
};
