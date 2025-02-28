import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';

// Import icons
import { 
  Package, 
  Users, 
  BarChart, 
  Settings,
  RefreshCw,
  X,
  Download,
  FileText,
  Bell,
  Search,
  Calendar,
  PieChart,
  ShoppingCart,
  Shield
} from 'lucide-react';

// Import all admin components individually to avoid any import issues
import StatsCards from '../components/admin/StatsCards';
import OrderFilters from '../components/admin/OrderFilters';
import OrderTable from '../components/admin/OrderTable';
import OrderDetails from '../components/admin/OrderDetails';
import UserManagement from '../components/admin/UserManagement';
import GoogleDriveExporter from '../components/admin/GoogleDriveExporter';
import ImageDownloader from '../components/admin/ImageDownloader';
import { saveOrderImagesAsZip, getImagesByOrderId } from '../utils/firebaseStorageUtils';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { getDocuments, updateDocument, subscribeToCollection } = useFirestore('orders');
  const productsFirestore = useFirestore('products');
  const usersFirestore = useFirestore('users');
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('orders');
  const [activeSubTab, setActiveSubTab] = useState('list');
  
  // State for order data
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for selected order and order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Filters and Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Status stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    revenue: 0,
    todayOrders: 0,
    monthlyOrders: 0,
    avgOrderValue: 0
  });
  
  // Products and users stats
  const [productsStats, setProductsStats] = useState({
    total: 0,
    categories: {},
    topSelling: []
  });
  
  const [usersStats, setUsersStats] = useState({
    total: 0,
    newThisMonth: 0,
    activeUsers: 0,
    topCustomers: []
  });
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  
  // Fetch orders with real-time updates
  useEffect(() => {
    let unsubscribe = null;
    
    const setupOrderSubscription = () => {
      setLoading(true);
      
      // Setup real-time subscription
      unsubscribe = subscribeToCollection(
        {
          orderBy: [{ field: 'createdAt', direction: 'desc' }],
          limit: 100 // Get more orders for better statistics
        },
        (err, ordersData) => {
          if (err) {
            setError('Failed to load orders. Please try again.');
            setLoading(false);
            return;
          }
          
          setOrders(ordersData);
          setFilteredOrders(ordersData);
          
          // Calculate comprehensive stats
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          
          const totalRevenue = ordersData.reduce((sum, order) => sum + (order.amount || 0), 0);
          
          const statsData = {
            total: ordersData.length,
            pending: ordersData.filter(order => order.status === 'pending').length,
            processing: ordersData.filter(order => order.status === 'processing').length,
            shipped: ordersData.filter(order => order.status === 'shipped').length,
            delivered: ordersData.filter(order => order.status === 'delivered').length,
            revenue: totalRevenue,
            avgOrderValue: totalRevenue > 0 ? totalRevenue / ordersData.length : 0,
            todayOrders: ordersData.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= today;
            }).length,
            monthlyOrders: ordersData.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= firstDayOfMonth;
            }).length
          };
          
          setStats(statsData);
          setError(null);
          setLoading(false);
          
          // Check for new orders to update notifications
          const newOrders = ordersData.filter(order => {
            const orderDate = new Date(order.createdAt);
            const hourAgo = new Date();
            hourAgo.setHours(hourAgo.getHours() - 1);
            return orderDate >= hourAgo && order.status === 'pending';
          });
          
          if (newOrders.length > 0) {
            const newNotifications = newOrders.map(order => ({
              id: order.id,
              type: 'new_order',
              message: `New order #${order.id.slice(0, 8)} received`,
              createdAt: order.createdAt,
              read: false,
              data: order
            }));
            
            setNotifications(prev => {
              const merged = [...newNotifications, ...prev];
              // Remove duplicates based on id
              return merged.filter((item, index, self) => 
                index === self.findIndex((t) => t.id === item.id)
              );
            });
            
            setHasUnreadNotifications(true);
          }
        }
      );
    };
    
    if (!authLoading && user && isAdmin && activeTab === 'orders') {
      setupOrderSubscription();
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [getDocuments, subscribeToCollection, user, isAdmin, authLoading, activeTab]);
  
  // Fetch product stats
  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        if (activeTab !== 'analytics') return;
        
        const products = await productsFirestore.getDocuments({
          orderBy: [{ field: 'salesCount', direction: 'desc' }],
          limit: 10
        });
        
        // Calculate product statistics
        const categories = products.reduce((acc, product) => {
          const category = product.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        
        setProductsStats({
          total: products.length,
          categories,
          topSelling: products.slice(0, 5) // Top 5 selling products
        });
      } catch (err) {
        console.error('Failed to fetch product stats:', err);
      }
    };
    
    if (!authLoading && user && isAdmin) {
      fetchProductStats();
    }
  }, [productsFirestore, user, isAdmin, authLoading, activeTab]);
  
  // Fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        if (activeTab !== 'analytics' && activeTab !== 'users') return;
        
        const users = await usersFirestore.getDocuments({
          orderBy: [{ field: 'createdAt', direction: 'desc' }],
          limit: 100
        });
        
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        // Calculate user statistics
        const newThisMonth = users.filter(user => {
          const createdAt = new Date(user.createdAt);
          return createdAt >= firstDayOfMonth;
        }).length;
        
        // Get top customers based on order count or amount
        // In a real app, you'd have a more sophisticated query
        const topCustomers = users
          .filter(user => user.orderCount > 0)
          .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
          .slice(0, 5);
        
        setUsersStats({
          total: users.length,
          newThisMonth,
          activeUsers: users.filter(user => user.lastLogin).length,
          topCustomers
        });
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      }
    };
    
    if (!authLoading && user && isAdmin) {
      fetchUserStats();
    }
  }, [usersFirestore, user, isAdmin, authLoading, activeTab]);
  
  // Filter and sort orders with enhanced filtering
  useEffect(() => {
    if (!orders.length) return;
    
    // Apply filters
    let result = [...orders];
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        order =>
          order.id.toLowerCase().includes(term) ||
          (order.shippingDetails?.fullName && order.shippingDetails.fullName.toLowerCase().includes(term)) ||
          (order.shippingDetails?.email && order.shippingDetails.email.toLowerCase().includes(term)) ||
          (order.phone && order.phone.includes(term)) ||
          (order.productDetails && order.productDetails.some(product => 
            product.name && product.name.toLowerCase().includes(term)
          ))
      );
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case 'amount':
          comparison = b.amount - a.amount;
          break;
        case 'customer':
          comparison = (a.shippingDetails?.fullName || '').localeCompare(b.shippingDetails?.fullName || '');
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'items':
          comparison = (b.productDetails?.length || 0) - (a.productDetails?.length || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? -comparison : comparison;
    });
    
    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm, sortBy, sortDirection, dateRange]);
  
  // Apply pagination to filtered orders
  const paginatedOrders = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
    setSortDirection('desc');
    setDateRange({ start: null, end: null });
    setCurrentPage(1);
  };
  
  // Notification management
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setHasUnreadNotifications(false);
  };
  
  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    
    // Check if there are still unread notifications
    const hasUnread = notifications.some(
      n => n.id !== notificationId && !n.read
    );
    setHasUnreadNotifications(hasUnread);
  };
  
  // Update order status with enhanced tracking
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Add a timestamp for status change tracking
      const statusUpdate = {
        status: newStatus,
        statusUpdatedAt: new Date().toISOString(),
        statusHistory: [{
          status: newStatus,
          timestamp: new Date().toISOString(),
          updatedBy: user.email || 'admin'
        }]
      };
      
      await updateDocument(orderId, statusUpdate);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            // Preserve previous status history if it exists
            const previousHistory = order.statusHistory || [];
            return { 
              ...order, 
              status: newStatus,
              statusUpdatedAt: statusUpdate.statusUpdatedAt,
              statusHistory: [
                ...statusUpdate.statusHistory,
                ...previousHistory
              ]
            };
          }
          return order;
        })
      );
      
      // Close modal if it's open
      if (isViewModalOpen) {
        setSelectedOrder(prev => {
          if (prev && prev.id === orderId) {
            const previousHistory = prev.statusHistory || [];
            return { 
              ...prev, 
              status: newStatus,
              statusUpdatedAt: statusUpdate.statusUpdatedAt,
              statusHistory: [
                ...statusUpdate.statusHistory,
                ...previousHistory
              ]
            };
          }
          return prev;
        });
      }
      
      // Update stats
      setStats(prevStats => {
        const updatedOrder = orders.find(order => order.id === orderId);
        if (!updatedOrder) return prevStats;
        
        const oldStatus = updatedOrder.status;
        
        return {
          ...prevStats,
          [oldStatus]: prevStats[oldStatus] - 1,
          [newStatus]: prevStats[newStatus] + 1
        };
      });
      
      // Add notification for status change
      const notification = {
        id: `${orderId}-status-${Date.now()}`,
        type: 'status_update',
        message: `Order #${orderId.slice(0, 8)} updated to ${newStatus}`,
        createdAt: new Date().toISOString(),
        read: true,
        data: { orderId, status: newStatus }
      };
      
      setNotifications(prev => [notification, ...prev]);
      
      return true;
    } catch (err) {
      // Show error notification
      setError('Failed to update order status. Please try again.');
      console.error('Status update error:', err);
      return false;
    }
  };
  
  // Bulk update order status
  const bulkUpdateOrderStatus = async (orderIds, newStatus) => {
    try {
      // Create a batch of update operations
      const updatePromises = orderIds.map(id => 
        updateOrderStatus(id, newStatus)
      );
      
      await Promise.all(updatePromises);
      return true;
    } catch (err) {
      setError('Failed to update multiple orders. Please try again.');
      return false;
    }
  };
  
  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };
  
  // Export order data to CSV
  const exportOrdersToCSV = useCallback(() => {
    try {
      // Create CSV header
      let csvContent = 'Order ID,Date,Customer,Email,Status,Amount,Items\n';
      
      // Add order data
      filteredOrders.forEach(order => {
        const row = [
          order.id,
          new Date(order.createdAt).toLocaleString(),
          order.shippingDetails?.fullName || '',
          order.shippingDetails?.email || '',
          order.status || '',
          order.amount || 0,
          (order.productDetails?.length || 0)
        ].map(cell => `"${cell}"`).join(',');
        
        csvContent += row + '\n';
      });
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `orders-export-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Add notification
      const notification = {
        id: `export-${Date.now()}`,
        type: 'export',
        message: 'Orders exported successfully',
        createdAt: new Date().toISOString(),
        read: true
      };
      
      setNotifications(prev => [notification, ...prev]);
    } catch (err) {
      setError('Failed to export orders. Please try again.');
      console.error('Export error:', err);
    }
  }, [filteredOrders]);
  
  // Redirect if not admin
  if (!authLoading && (!user || !isAdmin)) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/admin' } }} />;
  }
  
  // Calculate revenue stats (placeholder for now)
  const calculateRevenue = () => {
    // Calculate total revenue from orders
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    return totalRevenue;
  };

  // Update stats with revenue
  useEffect(() => {
    if (orders.length > 0) {
      const revenue = calculateRevenue();
      setStats(prevStats => ({
        ...prevStats,
        revenue
      }));
    }
  }, [orders]);

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container px-4 md:px-6 mx-auto py-8">
        {/* Dashboard Header with Notifications */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage orders, users, and view analytics for your business
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification indicator */}
            <div className="relative">
              <button 
                onClick={() => setActiveSubTab(activeSubTab === 'notifications' ? 'list' : 'notifications')}
                className="p-2 rounded-full hover:bg-muted transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                )}
              </button>
              
              {/* Notification dropdown */}
              {activeSubTab === 'notifications' && (
                <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-border flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    <div>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-3 border-b border-border flex gap-3 hover:bg-muted/50 ${!notification.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`rounded-full p-2 ${notification.type === 'new_order' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {notification.type === 'new_order' ? <ShoppingCart className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </span>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Admin Tabs - with enhanced styling and additional options */}
        <div className="bg-background rounded-lg shadow-sm mb-8 p-1">
          <nav className="flex flex-wrap">
            <button
              onClick={() => {setActiveTab('orders'); setActiveSubTab('list');}}
              className={`px-4 py-3 rounded-md inline-flex items-center text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Package className="h-4 w-4 mr-2" />
              Orders
              {stats.pending > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => {setActiveTab('users'); setActiveSubTab('list');}}
              className={`px-4 py-3 rounded-md inline-flex items-center text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Users className="h-4 w-4 mr-2" />
              User Management
            </button>
            <button
              onClick={() => {setActiveTab('products'); setActiveSubTab('list');}}
              className={`px-4 py-3 rounded-md inline-flex items-center text-sm font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Products
            </button>
            <button
              onClick={() => {setActiveTab('analytics'); setActiveSubTab('list');}}
              className={`px-4 py-3 rounded-md inline-flex items-center text-sm font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => {setActiveTab('settings'); setActiveSubTab('list');}}
              className={`px-4 py-3 rounded-md inline-flex items-center text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
            <button
              onClick={() => {setActiveTab('security'); setActiveSubTab('list');}}
              className={`px-4 py-3 rounded-md inline-flex items-center text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Shield className="h-4 w-4 mr-2" />
              Security
            </button>
          </nav>
        </div>
        
        {/* Actions Bar with Export and Other Tools */}
        {activeTab === 'orders' && activeSubTab === 'list' && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-3 bg-background rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={exportOrdersToCSV}
                className="px-4 py-2 inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm font-medium transition-colors"
              >
                <FileText className="h-4 w-4" />
                Export to CSV
              </button>
              <GoogleDriveExporter orders={filteredOrders} />
              <ImageDownloader orders={filteredOrders} />
              
              {/* Direct Image Download by Order ID */}
              <div className="relative group">
                <button
                  className="px-4 py-2 inline-flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setActiveSubTab(activeSubTab === 'directImageAccess' ? 'list' : 'directImageAccess')}
                >
                  <Download className="h-4 w-4" />
                  Download by Order ID
                </button>
                
                {activeSubTab === 'directImageAccess' && (
                  <div className="absolute right-0 top-full mt-2 z-30 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
                    <h4 className="font-medium text-sm mb-2">Download Images by Order ID</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Enter order ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (!searchTerm) return;
                            // Use the directly imported function
                            saveOrderImagesAsZip(
                              searchTerm,
                              (progress) => console.log(`Download progress: ${progress}%`),
                              () => {
                                console.log('Download complete');
                                setActiveSubTab('list'); // Close the dropdown after download starts
                              },
                              (error) => console.error('Download error:', error)
                            );
                          }}
                          disabled={!searchTerm}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                        <button
                          onClick={() => setActiveSubTab('list')}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="h-9 rounded-md border border-input px-3 py-1 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(filteredOrders.length, 1 + (currentPage - 1) * itemsPerPage)}-
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Content with smooth transitions */}
        <div className="animate-in fade-in-50 duration-300">
          {/* Orders Tab */}
          {activeTab === 'orders' && activeSubTab === 'list' && (
            <div>
              {/* Stats Cards with enhanced data */}
              <StatsCards stats={stats} />
              
              {/* Filters and Search with date range */}
              <OrderFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                dateRange={dateRange}
                setDateRange={setDateRange}
                resetFilters={resetFilters}
              />
              
              {/* Orders Table with pagination and bulk actions */}
              <OrderTable 
                orders={paginatedOrders()}
                totalOrders={filteredOrders.length}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                viewOrderDetails={viewOrderDetails}
                updateOrderStatus={updateOrderStatus}
                bulkUpdateOrderStatus={bulkUpdateOrderStatus}
                resetFilters={resetFilters}
              />
              
              {/* Order Details Modal with enhanced functionality */}
              {isViewModalOpen && selectedOrder && (
                <OrderDetails 
                  order={selectedOrder} 
                  onClose={() => setIsViewModalOpen(false)} 
                  updateOrderStatus={(orderId, newStatus, additionalData = {}) => {
                    // Combine status update with any additional data like notes, tracking, etc.
                    const updatedData = {
                      status: newStatus,
                      ...additionalData
                    };
                    return updateOrderStatus(orderId, newStatus, updatedData);
                  }}
                />
              )}
            </div>
          )}
          
          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <UserManagement />
          )}
          
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-background border border-border rounded-lg p-8 text-center shadow-sm">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Product Management Coming Soon</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                We're building a comprehensive product management interface to help you manage your inventory,
                product catalog, and pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="p-6 border border-border rounded-lg bg-muted/30 flex-1 max-w-xs mx-auto">
                  <h3 className="font-medium mb-2">Upcoming Features</h3>
                  <ul className="text-sm text-muted-foreground text-left list-disc pl-5 space-y-1">
                    <li>Product inventory management</li>
                    <li>Product variant control</li>
                    <li>Bulk product import/export</li>
                    <li>Product category management</li>
                  </ul>
                </div>
                <div className="p-6 border border-border rounded-lg bg-muted/30 flex-1 max-w-xs mx-auto">
                  <h3 className="font-medium mb-2">Current Product Stats</h3>
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Products:</span>
                      <span className="font-medium">{productsStats.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Categories:</span>
                      <span className="font-medium">{Object.keys(productsStats.categories || {}).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Top Selling:</span>
                      <span className="font-medium">{productsStats.topSelling?.[0]?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Analytics Tab with improved placeholder */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Revenue Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="text-xl font-bold">${stats.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Avg. Order Value</span>
                      <span className="font-medium">${stats.avgOrderValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Today's Orders</span>
                      <span className="font-medium">{stats.todayOrders}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Customer Insights</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Users</span>
                      <span className="font-medium">{usersStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">New This Month</span>
                      <span className="font-medium">{usersStats.newThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="font-medium">{usersStats.activeUsers}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Order Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-medium">{stats.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Processing</span>
                      <span className="font-medium">{stats.processing}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Shipped</span>
                      <span className="font-medium">{stats.shipped}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Delivered</span>
                      <span className="font-medium">{stats.delivered}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Product Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Products</span>
                      <span className="font-medium">{productsStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Categories</span>
                      <span className="font-medium">{Object.keys(productsStats.categories || {}).length}</span>
                    </div>
                    {productsStats.topSelling && productsStats.topSelling[0] && (
                      <div>
                        <span className="text-muted-foreground block mb-1">Top Seller:</span>
                        <span className="font-medium text-sm">{productsStats.topSelling[0].name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium mb-4">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  We're building a comprehensive analytics dashboard with charts, trends, and detailed reports.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 border border-border rounded-lg bg-muted/30">
                    <h4 className="font-medium mb-2">Sales Trends</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Daily, weekly, monthly sales</li>
                      <li>Year-over-year comparison</li>
                      <li>Revenue forecasting</li>
                    </ul>
                  </div>
                  <div className="p-5 border border-border rounded-lg bg-muted/30">
                    <h4 className="font-medium mb-2">Customer Analytics</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Customer retention rates</li>
                      <li>Customer lifetime value</li>
                      <li>Purchase behavior analysis</li>
                    </ul>
                  </div>
                  <div className="p-5 border border-border rounded-lg bg-muted/30">
                    <h4 className="font-medium mb-2">Product Insights</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Best and worst performers</li>
                      <li>Inventory turnover rates</li>
                      <li>Product combination analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings Tab with improved placeholders and sections */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4">
                      <Settings className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Store Settings</h2>
                    <p className="text-muted-foreground mb-4">
                      Configure your store settings, including store information, currencies, and regional settings.
                    </p>
                  </div>
                  
                  <div className="lg:w-2/3 space-y-4">
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Store Information</h4>
                      <p className="text-sm text-muted-foreground">Configure store name, logo, and contact details</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Regional Settings</h4>
                      <p className="text-sm text-muted-foreground">Set timezone, currency, and date formats</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Business Hours</h4>
                      <p className="text-sm text-muted-foreground">Set operating hours and holidays</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium border-b border-border pb-3 mb-4">Payment Settings</h3>
                  <div className="space-y-4">
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Payment Gateways</h4>
                      <p className="text-sm text-muted-foreground">Configure payment methods and processors</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Currency Options</h4>
                      <p className="text-sm text-muted-foreground">Set supported currencies and exchange rates</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Tax Settings</h4>
                      <p className="text-sm text-muted-foreground">Configure tax rates and regions</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium border-b border-border pb-3 mb-4">Shipping & Delivery</h3>
                  <div className="space-y-4">
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Shipping Methods</h4>
                      <p className="text-sm text-muted-foreground">Configure shipping carriers and rates</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Shipping Zones</h4>
                      <p className="text-sm text-muted-foreground">Set up regions for shipping calculations</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Fulfillment Settings</h4>
                      <p className="text-sm text-muted-foreground">Configure order processing workflows</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Tab - New */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4">
                      <Shield className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Security Settings</h2>
                    <p className="text-muted-foreground mb-4">
                      Manage security settings, user permissions, and access controls for your store.
                    </p>
                  </div>
                  
                  <div className="lg:w-2/3 space-y-4">
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Admin Users</h4>
                      <p className="text-sm text-muted-foreground">Manage administrator accounts and permissions</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Configure 2FA for enhanced security</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Login Security</h4>
                      <p className="text-sm text-muted-foreground">Password policies and login attempt restrictions</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium border-b border-border pb-3 mb-4">Access Control</h3>
                  <div className="space-y-4">
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Role Management</h4>
                      <p className="text-sm text-muted-foreground">Configure user roles and permissions</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">API Access</h4>
                      <p className="text-sm text-muted-foreground">Manage API keys and permissions</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Content Restrictions</h4>
                      <p className="text-sm text-muted-foreground">Control access to specific content and features</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium border-b border-border pb-3 mb-4">Security Measures</h3>
                  <div className="space-y-4">
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Security Logs</h4>
                      <p className="text-sm text-muted-foreground">View and analyze security-related activity</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Data Protection</h4>
                      <p className="text-sm text-muted-foreground">Configure data retention and privacy settings</p>
                    </div>
                    <div className="rounded-md bg-background border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <h4 className="font-medium mb-1">Fraud Prevention</h4>
                      <p className="text-sm text-muted-foreground">Configure fraud detection and prevention settings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;