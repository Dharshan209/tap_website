// CartPage.jsx - A dedicated page for the cart
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { Book, ArrowLeft, ShoppingBag, Trash2, X } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeBook, isCartEmpty } = useCart();

  // Handle checkout navigation
  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Empty cart view
  if (isCartEmpty) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-muted/30 rounded-xl p-8 mb-8">
            <div className="inline-flex p-4 bg-primary/10 text-primary rounded-full mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any books to your cart yet. Start by creating your custom storybook.
            </p>
            <Link
              to="/product"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Create a Book
            </Link>
          </div>
          
          {/* Products recommendation - simple placeholder */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Popular Book Themes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Fantasy', 'Space', 'Animals'].map((theme) => (
                <div key={theme} className="bg-background border border-border rounded-lg p-4 text-center">
                  <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-3">
                    <Book className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-medium">{theme} Adventure</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a personalized {theme.toLowerCase()} storybook
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <Link 
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">
                  Cart Items ({cartItems.length})
                </h2>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center pb-6 border-b border-border last:border-0 last:pb-0">
                      {/* Item Image */}
                      <div className="h-32 w-24 bg-muted rounded overflow-hidden mr-4 flex-shrink-0">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.childName ? `${item.childName}'s Book` : 'Custom Book'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Book className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 mt-4 sm:mt-0">
                        <h3 className="font-semibold">
                          {item.childName ? `${item.childName}'s Book` : 'Custom Storybook'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Theme: {item.theme ? item.theme.charAt(0).toUpperCase() + item.theme.slice(1) : 'Custom'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Hardcover, 20 pages
                        </p>
                        
                        <div className="flex justify-between items-center mt-4">
                          <span className="font-medium">₹{item.price.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => removeBook(item.id)}
                            className="text-sm text-destructive hover:text-destructive/90 inline-flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-background border border-border rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>₹0</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md font-medium shadow hover:bg-primary/90 transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-6 text-xs text-center text-muted-foreground">
                <p>Free shipping on all orders</p>
                <p className="mt-1">Secure checkout powered by Razorpay</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;