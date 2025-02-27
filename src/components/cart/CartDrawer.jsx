
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Book, ChevronRight, Heart, Plus, Minus, Info, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../hooks/useCart';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeBook, isCartEmpty, updateQuantity } = useCart();
  const [removingId, setRemovingId] = useState(null);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  // Handle checkout navigation
  const handleCheckout = () => {
    onClose(); // Close the drawer first
    // Use setTimeout to ensure the drawer closes before navigation
    setTimeout(() => {
      navigate('/checkout');
    }, 100);
  };
  
  // Handle quantity update with animation
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Handle remove with animation
  const handleRemove = (itemId) => {
    setRemovingId(itemId);
    setTimeout(() => {
      removeBook(itemId);
      setRemovingId(null);
    }, 300);
  };
  
  // Handle promo code application
  const applyPromoCode = () => {
    setPromoError('');
    setPromoSuccess('');
    
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }
    
    // Simulate promo code validation
    if (promoCode.toLowerCase() === 'tap10') {
      setPromoSuccess('Promo code applied! 10% discount');
      // Here you would actually apply the discount in your cart state
    } else {
      setPromoError('Invalid promo code');
    }
  };

  // Prevent scrolling of body when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      // Reset states when drawer closes
      setShowPromoCode(false);
      setPromoCode('');
      setPromoError('');
      setPromoSuccess('');
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
    
      {/* Cart drawer with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-background shadow-xl"
          >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium">Your Cart</h2>
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-4 px-4">
            {isCartEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="relative">
                  <div className="absolute -z-10 inset-0 bg-primary/5 blur-xl rounded-full"></div>
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <ShoppingCart className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-medium">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-xs">
                  Looks like you haven't added any books to your cart yet. Create a personalized storybook today!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onClose();
                    navigate('/product');
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/90 px-5 py-2 text-sm font-medium text-primary-foreground shadow-md hover:shadow-lg transition-shadow"
                >
                  Create a Book
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart
                  </h3>
                  <button 
                    className="text-xs text-primary hover:underline"
                    onClick={() => navigate('/product')}
                  >
                    Add more books
                  </button>
                </div>
                
                <AnimatePresence>
                  <ul className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.li 
                        key={item.id} 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: removingId === item.id ? 0 : 1, 
                          height: removingId === item.id ? 0 : 'auto',
                          y: 0 
                        }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start">
                          {/* Item Image */}
                          <div className="h-24 w-20 bg-muted rounded-md overflow-hidden mr-4 flex-shrink-0 relative group">
                            {item.coverImage ? (
                              <img
                                src={item.coverImage}
                                alt={item.childName ? `${item.childName}'s Book` : 'Custom Book'}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 text-primary">
                                <Book className="h-8 w-8" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                              <button
                                onClick={() => navigate(`/product?edit=${item.id}`)}
                                className="text-xs bg-white/80 text-black px-2 py-0.5 rounded-full backdrop-blur-sm"
                              >
                                View
                              </button>
                            </div>
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">
                              {item.childName ? `${item.childName}'s Book` : 'Custom Storybook'}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              Theme: {item.theme ? (item.theme.charAt(0).toUpperCase() + item.theme.slice(1)) : 'Custom'}
                            </p>
                            
                            {/* Quantity control */}
                            <div className="flex items-center mt-2 space-x-1">
                              <button 
                                onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                                disabled={(item.quantity || 1) <= 1}
                                className="p-1 rounded-md bg-muted text-muted-foreground disabled:opacity-50"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-medium px-2">
                                {item.quantity || 1}
                              </span>
                              <button 
                                onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                                className="p-1 rounded-md bg-muted text-muted-foreground"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="font-medium">₹{item.price.toFixed(2)}</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => navigate(`/product?edit=${item.id}`)}
                                  className="text-primary hover:text-primary/90 transition-colors p-1 rounded-md"
                                  aria-label="Edit item"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemove(item.id)}
                                  className="text-destructive hover:text-destructive/90 transition-colors p-1 rounded-md"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isCartEmpty && (
            <div className="border-t border-border p-4 bg-muted/30">
              {/* Promo Code Section */}
              <AnimatePresence>
                {showPromoCode ? (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="promo-code" className="text-xs font-medium">
                        Enter promo code
                      </label>
                      <div className="flex space-x-2">
                        <input
                          id="promo-code"
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="TAP10"
                          className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={applyPromoCode}
                          className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-destructive mt-1">{promoError}</p>
                      )}
                      {promoSuccess && (
                        <p className="text-xs text-success mt-1 flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          {promoSuccess}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowPromoCode(true)}
                    className="text-xs text-primary hover:underline flex items-center mb-3"
                  >
                    <Info className="h-3 w-3 mr-1" />
                    Have a promo code?
                  </button>
                )}
              </AnimatePresence>
              
              {/* Cart Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm">₹{cartTotal.toFixed(2)}</span>
                </div>
                
                {promoSuccess && (
                  <div className="flex items-center justify-between text-success">
                    <span className="text-sm">Discount (10%)</span>
                    <span className="text-sm">-₹{(cartTotal * 0.1).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-medium">Total</span>
                  <span className="font-medium text-lg">
                    ₹{promoSuccess ? (cartTotal * 0.9).toFixed(2) : cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* Save for Later (Optional feature) */}
              <div className="flex items-center justify-center mb-4">
                <button className="text-xs text-muted-foreground hover:text-primary flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  Save cart for later
                </button>
              </div>
              
              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg py-3 font-medium shadow-md hover:shadow-lg transition-shadow flex items-center justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
              
              {/* Continue Shopping */}
              <button
                onClick={onClose}
                className="w-full mt-3 bg-transparent text-sm text-muted-foreground hover:text-foreground transition-colors py-2 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDrawer;