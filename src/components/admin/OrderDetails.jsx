import React, { useState, useEffect, useRef } from 'react';
import { format, differenceInDays, addDays } from 'date-fns';
import { 
  X, 
  Download, 
  Eye, 
  Package, 
  Home, 
  Mail, 
  Calendar, 
  AlertCircle,
  Check,
  Truck,
  ClipboardList,
  MessageSquare,
  Clock,
  Save,
  Link,
  FileText,
  History,
  Printer,
  Phone,
  Image
} from 'lucide-react';

// Import necessary components
import StatusBadge from './StatusBadge';
import ImageDownloader from './ImageDownloader';
import OrderImageViewer from './OrderImageViewer';
import GoogleDriveExporter from './GoogleDriveExporter';

const OrderDetails = ({ order, onClose, updateOrderStatus }) => {
  // References
  const printFrameRef = useRef(null);
  const notesTextareaRef = useRef(null);
  
  // State for image viewer
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
  // State for error handling
  const [error, setError] = useState(null);
  
  // State for tracking changes and UI
  const [adminNotes, setAdminNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCarrier, setShippingCarrier] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [editableDeliveryDate, setEditableDeliveryDate] = useState(null);
  
  // Validate order and prevent rendering if invalid
  useEffect(() => {
    if (!order || typeof order !== 'object') {
      setError('Invalid order data');
      console.error('Invalid order object:', order);
      return;
    }
    
    // Initialize states from order data
    if (order.adminNotes) setAdminNotes(order.adminNotes);
    if (order.trackingNumber) setTrackingNumber(order.trackingNumber);
    if (order.shippingCarrier) setShippingCarrier(order.shippingCarrier);
    
    // Set estimated delivery date (either from the order or calculate it)
    const estimatedDate = order.estimatedDeliveryDate 
      ? new Date(order.estimatedDeliveryDate) 
      : addDays(new Date(order.createdAt || new Date()), 15);
    
    setEditableDeliveryDate(format(estimatedDate, 'yyyy-MM-dd'));
  }, [order]);
  
  // Format date safely with optional time
  const formatDate = (dateString, includeTime = false) => {
    try {
      if (!dateString) return 'N/A';
      
      const dateObj = new Date(dateString);
      return includeTime 
        ? format(dateObj, 'MMM dd, yyyy, h:mm a') 
        : format(dateObj, 'MMM dd, yyyy');
    } catch (err) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };
  
  // Save admin notes
  const saveNotes = async () => {
    try {
      // In a real app, this would call the updateOrderStatus or similar function
      await updateOrderStatus(order.id, order.status, {
        adminNotes: adminNotes
      });
      
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (err) {
      setError('Failed to save notes. Please try again.');
    }
  };
  
  // Save shipping information
  const saveShippingInfo = async () => {
    try {
      await updateOrderStatus(order.id, order.status, {
        trackingNumber,
        shippingCarrier,
        estimatedDeliveryDate: editableDeliveryDate,
      });
      
      // Show success message
      alert('Shipping information updated successfully');
    } catch (err) {
      setError('Failed to update shipping information. Please try again.');
    }
  };
  
  // Send message to customer
  const sendCustomerMessage = async () => {
    if (!customerMessage.trim()) {
      alert('Please enter a message');
      return;
    }
    
    try {
      // In a real app, this would call an API to send the message
      await updateOrderStatus(order.id, order.status, {
        customerMessages: [...(order.customerMessages || []), {
          message: customerMessage,
          sentBy: 'admin',
          sentAt: new Date().toISOString()
        }]
      });
      
      // Reset message field and show success
      setCustomerMessage('');
      alert('Message sent successfully');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };
  
  // Print order
  const printOrder = () => {
    const printContent = document.getElementById('printable-order-content');
    const WinPrint = window.open('', '', 'width=900,height=650');
    WinPrint.document.write('<html><head><title>Order Details</title>');
    WinPrint.document.write('<style>');
    WinPrint.document.write(`
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
      h1 { font-size: 24px; margin-bottom: 10px; }
      h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
      .order-status { padding: 5px 10px; border-radius: 4px; font-weight: bold; display: inline-block; }
      .pending { background-color: #fff3cd; color: #856404; }
      .processing { background-color: #d1ecf1; color: #0c5460; }
      .shipped { background-color: #d4edda; color: #155724; }
      .delivered { background-color: #d4edda; color: #155724; }
      .section { margin-bottom: 20px; }
      .logo { font-size: 24px; font-weight: bold; }
    `);
    WinPrint.document.write('</style></head><body>');
    WinPrint.document.write('<div class="header">');
    WinPrint.document.write('<div class="logo">Your Store Name</div>');
    WinPrint.document.write(`<div>Order #: ${order.id}</div>`);
    WinPrint.document.write('</div>');
    WinPrint.document.write(printContent.innerHTML);
    WinPrint.document.write('</body></html>');
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 500);
  };

  // Check if order has valid images - enhanced to check for storage paths too
  const hasValidImages = () => {
    if (!order) return false;
    
    // Always return true if we have an order ID - we'll try to fetch by order ID
    // and provide proper feedback if no images are found
    if (order.id) return true;
    
    // If we need to check the actual items
    if (!order.items) return false;
    
    return order.items.some(item => 
      // Check for image array
      (Array.isArray(item.images) && 
       item.images.length > 0 && 
       item.images.some(img => img && (img.path || img.storagePath))) ||
      // Or check for single storagePath/coverImage
      (item.storagePath || item.storageUrl || item.coverImage)
    );
  };

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="bg-white rounded-lg p-6 max-w-md w-full border-2 border-red-500">
          <div className="flex items-center mb-4 text-red-500">
            <AlertCircle className="h-6 w-6 mr-2" />
            <h2 className="text-lg font-semibold">Order Details Error</h2>
          </div>
          <p className="text-gray-800 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-md"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white sticky top-0 z-10">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Order #{order.id ? order.id.slice(0, 8) : 'N/A'}</h2>
            <StatusBadge status={order.status || 'pending'} className="ml-3" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={printOrder}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="Print Order"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="bg-gray-100 border-b border-gray-200 sticky top-16 z-10">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'details' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-blue-600 text-gray-600'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Order Details
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'shipping' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-blue-600 text-gray-600'
              }`}
            >
              <Truck className="h-4 w-4" />
              Shipping & Tracking
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'communication' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-blue-600 text-gray-600'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Customer Communication
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'history' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent hover:text-blue-600 text-gray-600'
              }`}
            >
              <History className="h-4 w-4" />
              Order History
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)] bg-white">
          {/* Order Details Tab */}
          {activeTab === 'details' && (
            <div id="printable-order-content">
              {/* Order Summary */}
              <div className="flex flex-col md:flex-row justify-between mb-6 bg-gray-100 rounded-lg p-4 border border-gray-200">
                <div>
                  <p className="text-sm font-bold text-gray-700">Order ID</p>
                  <p className="font-mono font-bold text-black">{order.id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Date</p>
                  <p className="font-bold text-black">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Status</p>
                  <StatusBadge status={order.status || 'pending'} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Payment</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Paid
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden mb-6 shadow-md">
                <div className="bg-blue-50 p-4 border-b border-gray-200">
                  <h3 className="text-sm font-bold text-gray-800">Order Items</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className="p-4 flex items-start hover:bg-gray-50">
                        <div className="h-20 w-16 bg-gray-100 rounded overflow-hidden mr-4 flex-shrink-0">
                          {item.coverImage ? (
                            <img
                              src={item.coverImage}
                              alt={item.childName ? `${item.childName}'s Book` : 'Custom Book'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-gray-900">
                            {item.childName ? `${item.childName}'s Book` : 'Custom Storybook'}
                          </h4>
                          <p className="text-xs text-gray-700 mt-1">
                            Theme: {item.theme ? item.theme.charAt(0).toUpperCase() + item.theme.slice(1) : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-700 mt-1">
                            Hardcover, 20 pages
                          </p>
                          {item.customizations && (
                            <div className="mt-2 text-xs text-gray-700">
                              <p className="font-medium">Customizations:</p>
                              <ul className="list-disc pl-4 mt-1 space-y-1">
                                {Object.entries(item.customizations).map(([key, value]) => (
                                  <li key={key}>{key}: {value}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-blue-600">₹{item.price?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-700">
                      No items in this order
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 p-4 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-800">Subtotal</span>
                    <span className="text-gray-800">₹{order.subtotal?.toLocaleString('en-IN') || order.amount?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  {order.discounts > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Discount</span>
                      <span>-₹{order.discounts?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                  )}
                  {order.shipping > 0 && (
                    <div className="flex justify-between mb-2">
                      <span>Shipping</span>
                      <span>₹{order.shipping?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                  )}
                  {order.tax > 0 && (
                    <div className="flex justify-between mb-2">
                      <span>Tax</span>
                      <span>₹{order.tax?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                    <span className="text-gray-800">Total</span>
                    <span className="text-blue-600">₹{order.amount?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Order Actions</h3>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {/* Download buttons */}
                    <button className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
                      <FileText className="h-4 w-4 mr-2" />
                      Download Invoice
                    </button>

                    {/* Conditional Image Download - Made more prominent */}
                    {hasValidImages() ? (
                      <div>
                        <div className="p-3 mb-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm font-medium text-green-600 mb-1 flex items-center">
                            <Image className="h-4 w-4 mr-1" />
                            This order has images available for viewing and download.
                          </p>
                          <p className="text-xs text-green-600">
                            Note: If no images appear, they may have been uploaded with a different order ID.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <ImageDownloader order={order} orderId={order.id} buttonText="Download Images" />
                          <GoogleDriveExporter order={order} orderId={order.id} />
                          <button
                            onClick={() => setIsImageViewerOpen(true)}
                            className="inline-flex items-center justify-center rounded-md border-2 border-blue-600 bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Images
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-800 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-md font-medium">
                        No images available for this order
                      </p>
                    )}
                  </div>

                  {/* Status Update Dropdown */}
                  <div>
                    <label htmlFor="status-select" className="block text-sm font-bold text-gray-700 mb-1">Update Status:</label>
                    <select
                      id="status-select"
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="py-2 px-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-gray-800"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Information */}
              <h3 className="text-sm font-bold text-gray-800 mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Shipping Address */}
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start mb-2">
                    <Home className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="font-bold text-gray-800">Shipping Address</h3>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {fullName}<br />
                    {address}<br />
                    {city}, {state} {postalCode}<br />
                    {country}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start mb-2">
                    <Mail className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="font-bold text-gray-800">Contact Details</h3>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Email: {email}<br />
                    Phone: {phone}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a 
                      href={`mailto:${email}`} 
                      className="inline-flex items-center justify-center text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                    >
                      <Mail className="h-3 w-3 mr-1" /> Email
                    </a>
                    <a 
                      href={`tel:${phone}`} 
                      className="inline-flex items-center justify-center text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                    >
                      <Phone className="h-3 w-3 mr-1" /> Call
                    </a>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start mb-2">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="font-bold text-gray-800">Delivery Information</h3>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    <p>Order Date: {formatDate(order.createdAt)}</p>
                    <p className="mt-1">Estimated Delivery: 
                      {order.estimatedDeliveryDate 
                        ? formatDate(order.estimatedDeliveryDate) 
                        : formatDate(addDays(new Date(order.createdAt || new Date()), 15))
                      }
                    </p>
                    {order.trackingNumber && (
                      <p className="mt-1">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  rows="3"
                  placeholder="Add internal notes about this order"
                  ref={notesTextareaRef}
                ></textarea>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-gray-500">
                    {notesSaved && (
                      <span className="text-green-600 flex items-center">
                        <Check className="h-4 w-4 mr-1" /> Notes saved
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={saveNotes}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Shipping & Tracking Tab */}
          {activeTab === 'shipping' && (
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="p-4 bg-blue-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800">Shipping Information</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Carrier
                      </label>
                      <select
                        value={shippingCarrier}
                        onChange={(e) => setShippingCarrier(e.target.value)}
                        className="w-full py-2 px-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select carrier</option>
                        <option value="delhivery">Delhivery</option>
                        <option value="bluedart">BlueDart</option>
                        <option value="ecom">Ecom Express</option>
                        <option value="fedex">FedEx</option>
                        <option value="dhl">DHL</option>
                        <option value="xpressbees">XpressBees</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full py-2 px-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Enter tracking number"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Delivery Date
                    </label>
                    <input
                      type="date"
                      value={editableDeliveryDate}
                      onChange={(e) => setEditableDeliveryDate(e.target.value)}
                      className="w-full py-2 px-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    {trackingNumber && shippingCarrier && (
                      <a
                        href={`https://www.google.com/search?q=${shippingCarrier}+tracking+${trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Link className="h-4 w-4 mr-1" />
                        Track Package
                      </a>
                    )}
                    <button
                      onClick={saveShippingInfo}
                      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Shipping Information
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="p-4 bg-blue-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800">Shipping Address</h3>
                </div>
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        <span className="font-bold">{fullName}</span><br />
                        {address}<br />
                        {city}, {state} {postalCode}<br />
                        {country}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Phone: {phone}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          `${address}, ${city}, ${state} ${postalCode}, ${country}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md border-2 border-blue-600 bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
                      >
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800">Package Information</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items</p>
                      <p className="text-lg font-bold text-gray-800">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weight</p>
                      <p className="text-lg font-bold text-gray-800">{order.packageWeight || '0.5'} kg</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dimensions</p>
                      <p className="text-lg font-bold text-gray-800">{order.packageDimensions || '25 × 20 × 5 cm'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Customer Communication Tab */}
          {activeTab === 'communication' && (
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="p-4 bg-blue-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800">Send Message to Customer</h3>
                </div>
                <div className="p-4">
                  <select 
                    className="w-full py-2 px-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mb-3"
                    onChange={(e) => {
                      if (e.target.value) {
                        setCustomerMessage(e.target.value);
                      }
                    }}
                    value=""
                  >
                    <option value="">-- Select template or type custom message --</option>
                    <option value="Your order has been confirmed and is being processed. Thank you for shopping with us!">Order Confirmation</option>
                    <option value="Your order has been shipped and is on its way to you. Track your package using the tracking number provided.">Shipping Notification</option>
                    <option value="We noticed you haven't completed the customization process for your order. Please complete it to avoid delays.">Customization Reminder</option>
                    <option value="We need additional information to process your order. Please reply to this message.">Information Request</option>
                  </select>
                  
                  <textarea
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    rows="4"
                    placeholder="Type your message to the customer"
                  ></textarea>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm text-gray-500">
                      Message will be sent to {email}
                    </div>
                    <button
                      onClick={sendCustomerMessage}
                      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800">Communication History</h3>
                </div>
                
                {order.customerMessages && order.customerMessages.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {order.customerMessages.map((msg, index) => (
                      <div key={index} className={`p-4 ${msg.sentBy === 'admin' ? 'bg-blue-50' : 'bg-white'}`}>
                        <div className="flex justify-between mb-1">
                          <span className={`font-bold ${msg.sentBy === 'admin' ? 'text-blue-600' : 'text-gray-800'}`}>
                            {msg.sentBy === 'admin' ? 'Store Admin' : 'Customer'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(msg.sentAt, true)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages in the communication history</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Order History Tab */}
          {activeTab === 'history' && (
            <div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="p-4 bg-blue-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Order Status History</h3>
                  <button 
                    onClick={() => setShowStatusHistory(!showStatusHistory)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showStatusHistory ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                <div className="p-1">
                  {/* Status Timeline */}
                  <div className="relative px-4 py-6">
                    {/* Timeline Line */}
                    <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-blue-200"></div>
                    
                    {/* Timeline Events */}
                    <div className="space-y-6">
                      {/* Current Status */}
                      <div className="relative flex items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white absolute">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="ml-12">
                          <h4 className="font-bold text-blue-600">
                            {(order.status || 'Pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {order.statusUpdatedAt 
                              ? formatDate(order.statusUpdatedAt, true)
                              : formatDate(order.createdAt, true)
                            }
                          </p>
                          {showStatusHistory && order.statusUpdatedBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Updated by: {order.statusUpdatedBy}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Status History */}
                      {order.statusHistory && showStatusHistory && order.statusHistory.map((status, index) => (
                        <div key={index} className="relative flex items-start">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-gray-600 absolute left-1">
                            <Clock className="h-3 w-3" />
                          </div>
                          <div className="ml-12">
                            <h4 className="font-medium text-gray-700">
                              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(status.timestamp, true)}
                            </p>
                            {status.updatedBy && (
                              <p className="text-xs text-gray-500 mt-1">
                                Updated by: {status.updatedBy}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Order Created Event */}
                      <div className="relative flex items-start">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-gray-600 absolute left-1">
                          <Check className="h-3 w-3" />
                        </div>
                        <div className="ml-12">
                          <h4 className="font-medium text-gray-700">Order Created</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.createdAt, true)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 bg-blue-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Order Details</h3>
                  </div>
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-600">Order ID</td>
                          <td className="py-2 text-right font-mono">{order.id || 'N/A'}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-600">Date Created</td>
                          <td className="py-2 text-right">{formatDate(order.createdAt)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-600">Payment Method</td>
                          <td className="py-2 text-right">{order.paymentMethod || 'Credit Card'}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-600">Payment ID</td>
                          <td className="py-2 text-right font-mono">{order.paymentId || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-600">Customer IP</td>
                          <td className="py-2 text-right">{order.customerIp || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4 bg-blue-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Customer Information</h3>
                  </div>
                  <div className="p-4">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-600">Name</td>
                          <td className="py-2 text-right">{fullName}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-600">Email</td>
                          <td className="py-2 text-right">{email}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-600">Phone</td>
                          <td className="py-2 text-right">{phone}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-600">Account</td>
                          <td className="py-2 text-right">{order.userId ? 'Registered' : 'Guest'}</td>
                        </tr>
                        {order.userId && (
                          <tr>
                            <td className="py-2 text-gray-600">Customer ID</td>
                            <td className="py-2 text-right font-mono">{order.userId}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {isImageViewerOpen && (
        <OrderImageViewer
          order={order}
          orderId={order.id}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderDetails;