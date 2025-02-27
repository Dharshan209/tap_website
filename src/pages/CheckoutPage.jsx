import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { 
  initiateRazorpayCheckout, 
  createRazorpayOrder, 
  verifyRazorpayPayment, 
  loadRazorpayScript 
} from '../lib/razorpay';
import { CreditCard, Shield, AlertCircle, Book, CheckCircle2, User } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, isCartEmpty } = useCart();
  const { user } = useAuth();
  const { addDocument, updateDocument } = useFirestore('orders');

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (isCartEmpty && !orderPlaced) {
      navigate('/product');
    }
  }, [isCartEmpty, navigate, orderPlaced]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        fullName: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    if (!user) {
      setErrors({ auth: 'Please sign in to complete your purchase.' });
      return;
    }
  
    setIsProcessing(true);
  
    try {
      // Check if any items have images stored in session that need to be uploaded to Firebase
      const itemsNeedingUpload = cartItems.filter(item => item.pendingFirebaseUpload);
      
      // Create initial order in Firestore
      const orderData = {
        userId: user.uid,
        items: cartItems,
        amount: cartTotal,
        currency: 'INR',
        status: 'pending',
        paymentStatus: 'pending',
        shippingDetails: formData,
        createdAt: new Date().toISOString(),
        email: formData.email,
        phone: formData.phone,
        needsImageUpload: itemsNeedingUpload.length > 0,
        pendingUploadItemIds: itemsNeedingUpload.map(item => item.id)
      };
  
      const orderRef = await addDocument(orderData);
      const orderId = orderRef.id;
      
      try {
        // Create a Razorpay order through our backend API
        const razorpayOrderResponse = await createRazorpayOrder(
          cartTotal, 
          'INR',
          {
            firebaseOrderId: orderId,
            orderType: 'storybook',
            email: formData.email,
            notes: {
              customer_name: formData.fullName,
              customer_phone: formData.phone,
              customer_email: formData.email
            }
          }
        );
        
        if (!razorpayOrderResponse || !razorpayOrderResponse.id) {
          throw new Error('Failed to create Razorpay order');
        }
        
        // Update the Firebase order with Razorpay order ID
        await updateDocument(orderId, {
          razorpayOrderId: razorpayOrderResponse.id,
          updatedAt: new Date().toISOString()
        });
        
        // Initiate Razorpay Checkout
        await initiateRazorpayCheckout({
          amount: cartTotal,
          orderId: razorpayOrderResponse.id,
          firebaseOrderId: orderId,
          name: 'TAP - Turn Art into Pages',
          description: 'Custom Storybook Purchase',
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.phone
          },
          notes: {
            firebaseOrderId: orderId,
            customerName: formData.fullName
          },
          onSuccess: async (paymentDetails) => {
            try {
              // Verify payment on the server side
              if (paymentDetails.razorpay_payment_id && 
                  paymentDetails.razorpay_order_id && 
                  paymentDetails.razorpay_signature) {
                
                const isVerified = await verifyRazorpayPayment(
                  paymentDetails.razorpay_payment_id,
                  paymentDetails.razorpay_order_id,
                  paymentDetails.razorpay_signature
                );
                
                if (!isVerified) {
                  console.warn('Payment verification failed!');
                }
              }
              
              // Update the order in Firebase
              await updateDocument(orderId, {
                paymentStatus: 'successful',
                status: 'processing',
                razorpayPaymentId: paymentDetails.razorpay_payment_id,
                razorpaySignature: paymentDetails.razorpay_signature,
                paymentDetails: paymentDetails,
                paidAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                paymentComplete: true
              });
              
              // If we have items with session-stored images, process them now
              if (itemsNeedingUpload.length > 0) {
                // Update to indicate images need to be processed
                await updateDocument(orderId, {
                  imageProcessingStatus: 'pending',
                  pendingUploads: itemsNeedingUpload.length
                });
                
                // The server webhook will handle the actual uploads based on the flags
              }
              
              // Payment successful
              clearCart();
              
              // Clear the session storage after payment is successful
              sessionStorage.removeItem('tap-artwork-temp');
              sessionStorage.removeItem('tap-artwork-uploads');
              sessionStorage.removeItem('razorpay_current_checkout');
              
              setOrderPlaced(true);
              setOrderId(orderId);
              navigate(`/order-confirmation/${orderId}`);
            } catch (updateError) {
              console.error('Error updating order after payment:', updateError);
              // Even if update fails, we'll consider payment successful as Razorpay succeeded
              setOrderPlaced(true);
              setOrderId(orderId);
              navigate(`/order-confirmation/${orderId}`);
            }
          },
          onError: async (error) => {
            // Handle payment failure
            await updateDocument(orderId, {
              status: 'payment_failed',
              paymentStatus: 'failed',
              paymentError: error.message,
              updatedAt: new Date().toISOString()
            });
            
            setIsProcessing(false);
            setErrors({ 
              payment: error.message || 'Payment failed. Please try again.' 
            });
          },
          onRetry: () => {
            // Allow retry without creating a new order
            setIsProcessing(false);
            setTimeout(() => {
              handlePayment(e);
            }, 1000);
          }
        });
      } catch (razorpayError) {
        console.error('Razorpay Error:', razorpayError);
        
        // Update the order with the error
        await updateDocument(orderId, {
          status: 'payment_failed',
          paymentStatus: 'failed',
          paymentError: razorpayError.message,
          updatedAt: new Date().toISOString()
        });
        
        setIsProcessing(false);
        setErrors({ payment: 'Payment service unavailable. Please try again later.' });
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      setIsProcessing(false);
      setErrors({ payment: 'Unable to process payment. Please try again.' });
    }
  };
  // Authentication notice - prompt login
  if (!user) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-background border border-border rounded-xl p-8 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-full inline-block mb-4">
              <User className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Sign in to Continue</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to your account to complete your purchase. This helps you track your orders and manage your shipping details.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Create Account
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your items will be saved in your cart.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Display order confirmation if payment is successful
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="p-4 rounded-full bg-primary/10 text-primary inline-flex mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Your order has been placed successfully. We'll start working on your custom storybook right away!
          </p>
          <p className="font-medium mb-2">Order ID: {orderId}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Checkout Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-background rounded-lg shadow-sm p-6 mb-6"
              >
                <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                
                <form onSubmit={handlePayment} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.fullName ? 'border-destructive' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-destructive text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.email ? 'border-destructive' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-destructive text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.phone ? 'border-destructive' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="text-destructive text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                  
                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${
                        errors.address ? 'border-destructive' : 'border-input'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30`}
                      placeholder="Enter your street address"
                    />
                    {errors.address && (
                      <p className="text-destructive text-xs mt-1">{errors.address}</p>
                    )}
                  </div>
                  
                  {/* City, State, Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          errors.city ? 'border-destructive' : 'border-input'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30`}
                        placeholder="City"
                      />
                      {errors.city && (
                        <p className="text-destructive text-xs mt-1">{errors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          errors.state ? 'border-destructive' : 'border-input'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30`}
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="text-destructive text-xs mt-1">{errors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${
                          errors.postalCode ? 'border-destructive' : 'border-input'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30`}
                        placeholder="Postal Code"
                      />
                      {errors.postalCode && (
                        <p className="text-destructive text-xs mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      {/* Add more countries as needed */}
                    </select>
                  </div>
                  
                  {/* Submit button is at the bottom of the page */}
                </form>
              </motion.div>
              
              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-background rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-lg font-semibold">Payment Information</h2>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Payment will be processed securely via Razorpay after you submit the order.
                </p>

                {/* Payment Error */}
                {errors.payment && (
                  <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p>{errors.payment}</p>
                  </div>
                )}
                
                {/* Authentication Error */}
                {errors.auth && (
                  <div className="mb-4 p-3 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-md flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p>{errors.auth}</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                  <Shield className="h-4 w-4" />
                  <span>Your payment information is encrypted and secure.</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Payment method icons */}
                  <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">Visa</div>
                  <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">MC</div>
                  <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">Amex</div>
                  <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">RuPay</div>
                  <div className="h-8 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">UPI</div>
                </div>
              </motion.div>
            </div>
            
            {/* Right column - Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-background rounded-lg shadow-sm p-6 sticky top-24"
              >
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start">
                      <div className="h-16 w-12 bg-muted rounded overflow-hidden mr-3 flex-shrink-0">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.childName ? `${item.childName}'s Book` : 'Custom Book'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Book className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">
                          {item.childName ? `${item.childName}'s Book` : 'Custom Storybook'}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Theme: {item.theme ? item.theme.charAt(0).toUpperCase() + item.theme.slice(1) : 'Custom'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Price Summary */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 dark:text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-border mt-2">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Payment Button */}
                <button
                  type="submit"
                  onClick={handlePayment}
                  disabled={isProcessing || isCartEmpty}
                  className="w-full h-12 mt-6 flex items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order • ${cartTotal.toFixed(2)}
                    </>
                  )}
                </button>
                
                {/* Payment Security Notice */}
                <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
                  <Shield className="h-3 w-3 mr-1" />
                  <span>Secure payment processing by Razorpay</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;