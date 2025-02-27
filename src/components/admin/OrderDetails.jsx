import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  X, 
  Download, 
  Eye, 
  Package, 
  Home, 
  Mail, 
  Calendar, 
  AlertCircle,
  Check 
} from 'lucide-react';

// Import necessary components
import StatusBadge from './StatusBadge';
import ImageDownloader from './ImageDownloader';
import OrderImageViewer from './OrderImageViewer';
import GoogleDriveExporter from './GoogleDriveExporter';

const OrderDetails = ({ order, onClose, updateOrderStatus }) => {
  // State for image viewer
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
  // State for error handling
  const [error, setError] = useState(null);

  // Validate order and prevent rendering if invalid
  useEffect(() => {
    if (!order || typeof order !== 'object') {
      setError('Invalid order data');
      console.error('Invalid order object:', order);
    }
  }, [order]);

  // Format date safely
  const formatDate = (dateString) => {
    try {
      return dateString 
        ? format(new Date(dateString), 'MMM dd, yyyy') 
        : 'N/A';
    } catch (err) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  // Check if order has valid images
  const hasValidImages = () => {
    if (!order || !order.items) return false;
    
    return order.items.some(item => 
      Array.isArray(item.images) && 
      item.images.length > 0 && 
      item.images.every(img => img && img.path)
    );
  };

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-background rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4 text-destructive">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold">Order Details Error</h2>
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // If no order, return null
  if (!order) return null;

  // Safely extract shipping details
  const shippingDetails = order.shippingDetails || {};
  const {
    fullName = 'N/A',
    email = 'N/A',
    phone = 'N/A',
    address = 'N/A',
    city = 'N/A',
    state = 'N/A',
    postalCode = 'N/A',
    country = 'N/A'
  } = shippingDetails;

  // Estimated delivery date (15 days from order date)
  const estimatedDelivery = (() => {
    try {
      const deliveryDate = new Date(order.createdAt);
      deliveryDate.setDate(deliveryDate.getDate() + 15);
      return formatDate(deliveryDate);
    } catch (err) {
      console.warn('Error calculating delivery date:', err);
      return 'N/A';
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Order Summary */}
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono">{order.id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p>{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={order.status || 'pending'} />
            </div>
          </div>

          {/* Order Items */}
          <div className="border border-border rounded-lg overflow-hidden mb-6">
            <div className="bg-muted p-4 border-b border-border">
              <h3 className="text-sm font-semibold">Order Items</h3>
            </div>
            <div className="divide-y divide-border">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="p-4 flex items-start">
                    <div className="h-20 w-16 bg-muted rounded overflow-hidden mr-4 flex-shrink-0">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.childName ? `${item.childName}'s Book` : 'Custom Book'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.childName ? `${item.childName}'s Book` : 'Custom Storybook'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Theme: {item.theme ? item.theme.charAt(0).toUpperCase() + item.theme.slice(1) : 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hardcover, 20 pages
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">₹{item.price?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No items in this order
                </div>
              )}
            </div>
            <div className="bg-muted p-4 border-t border-border flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold">₹{order.amount?.toLocaleString('en-IN') || '0'}</span>
            </div>
          </div>

          {/* Order Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {/* Download buttons */}
              <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </button>

              {/* Conditional Image Download - Made more prominent */}
              {hasValidImages() ? (
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative group">
                    <ImageDownloader order={order} buttonText="Download All Images" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      Download as ZIP file
                    </div>
                  </div>
                  
                  <GoogleDriveExporter order={order} />
                  
                  <button
                    onClick={() => setIsImageViewerOpen(true)}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Images
                  </button>
                  
                  <div className="rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/30 text-green-700 dark:text-green-300 text-xs px-3 py-1.5 inline-flex items-center">
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    All image download options available
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-md">
                  No images available for this order
                </p>
              )}
            </div>

            {/* Status Update Dropdown */}
            <select
              value={order.status || 'pending'}
              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
              className="py-2 px-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Shipping Address */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start mb-2">
                <Home className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              <p className="text-sm">
                {fullName}<br />
                {address}<br />
                {city}, {state} {postalCode}<br />
                {country}
              </p>
            </div>

            {/* Contact Information */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start mb-2">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="font-semibold">Contact Details</h3>
              </div>
              <p className="text-sm">
                Email: {email}<br />
                Phone: {phone}
              </p>
            </div>

            {/* Delivery Information */}
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-start mb-2">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="font-semibold">Delivery Information</h3>
              </div>
              <p className="text-sm">
                Estimated Delivery: {estimatedDelivery}
              </p>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="mt-6 border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Admin Notes</h3>
            <textarea
              className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              rows="3"
              placeholder="Add internal notes about this order"
            ></textarea>
            <div className="text-right mt-2">
              <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {isImageViewerOpen && (
        <OrderImageViewer
          order={order}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderDetails;