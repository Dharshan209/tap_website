import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFirestore } from '../hooks/useFirestore';
import { 
  CheckCircle2, 
  Truck, 
  Calendar, 
  Book, 
  Mail, 
  Home, 
  Copy, 
  Clock, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const { getDocument } = useFirestore('orders');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  
  // Estimated delivery date (15 days from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 15);
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await getDocument(orderId);
        
        if (!orderData) {
          setError('Order not found');
        } else {
          setOrder(orderData);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Error fetching order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [getDocument, orderId]);
  
  // Handle copy order ID to clipboard
  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    
    setTimeout(() => {
      setCopiedOrderId(false);
    }, 2000);
  };
  
  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="p-4 rounded-full bg-destructive/10 text-destructive inline-block mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for. Please check the order ID and try again.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Thank you for your order. We've received your payment and are processing your custom storybook.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm">Order ID:</span>
              <span className="font-mono bg-muted px-2 py-1 rounded text-sm">{orderId}</span>
              <button
                onClick={copyOrderId}
                className="text-primary hover:text-primary/80 p-1 rounded-md"
                aria-label="Copy order ID"
              >
                <Copy className="h-4 w-4" />
              </button>
              {copiedOrderId && (
                <span className="text-xs text-green-600 dark:text-green-400">Copied!</span>
              )}
            </div>
          </div>
          
          {/* Order Status */}
          <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Status</h2>
              
              <div className="relative">
                {/* Status Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>
                
                {/* Status Steps */}
                <div className="space-y-8">
                  {/* Step 1: Order Placed */}
                  <div className="flex">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4 pt-1">
                      <h3 className="font-medium">Order Placed</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 2: Processing */}
                  <div className="flex">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center border border-border">
                        <Clock className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4 pt-1">
                      <h3 className="font-medium">Processing</h3>
                      <p className="text-sm text-muted-foreground">
                        Your book is being created by our team
                      </p>
                    </div>
                  </div>
                  
                  {/* Step 3: Shipping */}
                  <div className="flex">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center border border-border">
                        <Truck className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4 pt-1">
                      <h3 className="font-medium">Shipping</h3>
                      <p className="text-sm text-muted-foreground">
                        Estimated delivery by {formatDate(estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Order Items */}
            <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
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
                          Theme: {item.theme && typeof item.theme === 'string' ? `${item.theme.charAt(0).toUpperCase()}${item.theme.slice(1)}` : 'Custom'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Hardcover, 20 pages
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${order.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Shipping</span>
                    <span className="text-green-600 dark:text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${order.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shipping Information */}
            <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="p-2 bg-muted rounded-md mr-3">
                      <Home className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Shipping Address</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.shippingDetails.fullName}<br />
                        {order.shippingDetails.address}<br />
                        {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.postalCode}<br />
                        {order.shippingDetails.country}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-2 bg-muted rounded-md mr-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Contact Information</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Email: {order.shippingDetails.email}<br />
                        Phone: {order.shippingDetails.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-2 bg-muted rounded-md mr-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Estimated Delivery</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(estimatedDelivery)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm mb-8">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">What's Next?</h2>
              
              <div className="space-y-4 text-sm">
                <p>
                  Our team will now start creating your custom storybook based on the uploaded artwork.
                  This process typically takes 7-10 business days.
                </p>
                <p>
                  You'll receive an email notification when your order ships with tracking information.
                </p>
                <p>
                  If you have any questions or need assistance, please contact our customer support
                  at <a href="mailto:support@turn-art-pages.com" className="text-primary hover:underline">support@turn-art-pages.com</a>.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Continue Shopping
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;