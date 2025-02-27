import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Eye, 
  Download,
  CheckCircle, 
  Package,
  Truck,
  AlertCircle
} from 'lucide-react';

// Status badge component with proper null check
const StatusBadge = ({ status }) => {
  // Default to 'pending' if status is undefined
  const orderStatus = status || 'pending';
  
  // Get status badge styling
  const getBadgeClass = () => {
    switch (orderStatus) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500';
    }
  };

  // Get icon based on status
  const getIcon = () => {
    switch (orderStatus) {
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'processing':
        return <Package className="h-3 w-3 mr-1" />;
      case 'shipped':
        return <Truck className="h-3 w-3 mr-1" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'cancelled':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass()}`}>
      {getIcon()}
      <span className="capitalize">{orderStatus}</span>
    </span>
  );
};

// Format date safely
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    console.warn('Invalid date:', dateString);
    return 'Invalid date';
  }
};

// Format currency safely
const formatCurrency = (amount) => {
  // Use optional chaining and nullish coalescing to safely handle undefined values
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    return '₹0.00';
  }
  return `₹${numAmount.toFixed(2)}`;
};

const OrderHistory = ({ orders = [], loading = false }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Toggle order details expansion
  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  // No orders state
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-muted rounded-full">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
        <p className="text-muted-foreground mb-6">
          You haven't placed any orders yet. Start by creating your custom storybook.
        </p>
        <a
          href="/product"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create Your First Book
        </a>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-6">
        {orders.map((order) => {
          // Early return for invalid orders (safety check)
          if (!order || !order.id) {
            return null;
          }
          
          const isExpanded = expandedOrder === order.id;
          
          return (
            <div
              key={order.id}
              className="bg-background border border-border rounded-lg overflow-hidden"
            >
              {/* Order Summary - always visible */}
              <div
                className="p-4 md:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-primary/10 rounded-md flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium flex items-center flex-wrap gap-2">
                        <span>Order #{order.id?.substring(0, 8) || 'Unknown'}</span>
                        <StatusBadge status={order.status} />
                      </h3>
                      
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(order.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                    
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Details - shown when expanded */}
              {isExpanded && (
                <div className="border-t border-border p-4 md:p-6 bg-muted/20">
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div key={item?.id || index} className="flex items-start">
                            <div className="h-16 w-12 bg-muted rounded overflow-hidden mr-3 flex-shrink-0">
                              {item?.coverImage ? (
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
                              <h5 className="font-medium text-sm">
                                {item?.childName ? `${item.childName}'s Book` : 'Custom Storybook'}
                              </h5>
                              <p className="text-xs text-muted-foreground mt-1">
                                Theme: {item?.theme ? item.theme.charAt(0).toUpperCase() + item.theme.slice(1) : 'Custom'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">{formatCurrency(item?.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Shipping Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Shipping Information</h4>
                        {order.shippingDetails ? (
                          <div className="text-sm">
                            <p className="font-medium">{order.shippingDetails.fullName || 'N/A'}</p>
                            <p className="text-muted-foreground mt-1">
                              {order.shippingDetails.address || 'N/A'}<br />
                              {order.shippingDetails.city || 'N/A'}, {order.shippingDetails.state || 'N/A'} {order.shippingDetails.postalCode || 'N/A'}<br />
                              {order.shippingDetails.country || 'N/A'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Shipping information not available</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Payment Information</h4>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Status:</span>
                            <span className="font-medium">
                              {order.paymentStatus ? (
                                <span className="capitalize">{order.paymentStatus}</span>
                              ) : (
                                'N/A'
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Method:</span>
                            <span className="font-medium">Razorpay</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount:</span>
                            <span className="font-medium">{formatCurrency(order.amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      <button className="inline-flex items-center justify-center px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                      
                      <button className="inline-flex items-center justify-center px-4 py-2 text-sm border border-input bg-background rounded-md hover:bg-muted transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default OrderHistory;