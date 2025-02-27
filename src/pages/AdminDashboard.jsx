import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

// Import all admin components individually to avoid any import issues
import StatsCards from '../components/admin/StatsCards';
import OrderFilters from '../components/admin/OrderFilters';
import OrderTable from '../components/admin/OrderTable';
import OrderDetails from '../components/admin/OrderDetails';
import UserManagement from '../components/admin/UserManagement';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { getDocuments, updateDocument } = useFirestore('orders');
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('orders');
  
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
  
  // Status stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Get all orders
        const ordersData = await getDocuments(
          [], // No query constraints - get all orders
          'createdAt',
          'desc'
        );
        
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        
        // Calculate stats
        const statsData = {
          total: ordersData.length,
          pending: ordersData.filter(order => order.status === 'pending').length,
          processing: ordersData.filter(order => order.status === 'processing').length,
          shipped: ordersData.filter(order => order.status === 'shipped').length,
          delivered: ordersData.filter(order => order.status === 'delivered').length
        };
        
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading && user && isAdmin && activeTab === 'orders') {
      fetchOrders();
    }
  }, [getDocuments, user, isAdmin, authLoading, activeTab]);
  
  // Filter and sort orders
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
          (order.shippingDetails?.email && order.shippingDetails.email.toLowerCase().includes(term))
      );
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
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? -comparison : comparison;
    });
    
    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm, sortBy, sortDirection]);
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
    setSortDirection('desc');
  };
  
  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDocument(orderId, { status: newStatus });
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Close modal if it's open
      if (isViewModalOpen) {
        setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
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
    } catch (err) {
      console.error('Error updating order status:', err);
      // Show error notification (would implement in a full app)
    }
  };
  
  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };
  
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
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage orders, users, and view analytics for your business
            </p>
          </div>
          
          <div className="flex items-center gap-3">
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
        
        {/* Admin Tabs - with improved styling */}
        <div className="bg-background rounded-lg shadow-sm mb-8 p-1">
          <nav className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 rounded-md inline-flex items-center text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Package className="h-4 w-4 mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('users')}
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
              onClick={() => setActiveTab('analytics')}
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
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 rounded-md inline-flex items-center text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </nav>
        </div>
        
        {/* Tab Content with smooth transitions */}
        <div className="animate-in fade-in-50 duration-300">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              {/* Stats Cards */}
              <StatsCards stats={stats} />
              
              {/* Filters and Search */}
              <OrderFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                resetFilters={resetFilters}
              />
              
              {/* Orders Table - No need for extra wrapper div now that OrderTable has its own border */}
              <OrderTable 
                orders={filteredOrders}
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                viewOrderDetails={viewOrderDetails}
                updateOrderStatus={updateOrderStatus}
                resetFilters={resetFilters}
              />
              
              {/* Order Details Modal */}
              {isViewModalOpen && selectedOrder && (
                <OrderDetails 
                  order={selectedOrder} 
                  onClose={() => setIsViewModalOpen(false)} 
                  updateOrderStatus={updateOrderStatus}
                />
              )}
            </div>
          )}
          
          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <UserManagement />
          )}
          
          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-background border border-border rounded-lg p-8 text-center shadow-sm">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4">
                <BarChart className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard Coming Soon</h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                We're building a comprehensive analytics dashboard to help you track your business performance,
                including sales trends, customer behavior, and product insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="p-6 border border-border rounded-lg bg-muted/30 flex-1 max-w-xs mx-auto">
                  <h3 className="font-medium mb-2">Coming Features</h3>
                  <ul className="text-sm text-muted-foreground text-left list-disc pl-5 space-y-1">
                    <li>Real-time sales dashboard</li>
                    <li>Customer retention metrics</li>
                    <li>Product performance reports</li>
                    <li>Revenue forecasting</li>
                  </ul>
                </div>
                <div className="p-6 border border-border rounded-lg bg-muted/30 flex-1 max-w-xs mx-auto">
                  <h3 className="font-medium mb-2">Export Options</h3>
                  <ul className="text-sm text-muted-foreground text-left list-disc pl-5 space-y-1">
                    <li>CSV and Excel exports</li>
                    <li>PDF reports</li>
                    <li>Google Analytics integration</li>
                    <li>Automated email reports</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-background border border-border rounded-lg p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="text-center lg:text-left lg:flex-1">
                  <div className="inline-flex items-center justify-center p-4 bg-primary/10 text-primary rounded-full mb-4">
                    <Settings className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
                  <p className="text-muted-foreground mb-6 max-w-lg">
                    Configure your application settings, including notification preferences,
                    shipping options, and payment gateways.
                  </p>
                </div>
                
                <div className="flex-1 border border-border rounded-lg p-6 bg-muted/30">
                  <h3 className="text-lg font-medium border-b border-border pb-3 mb-4">Settings Categories</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-md bg-background hover:bg-muted transition-colors cursor-not-allowed opacity-70">
                      <h4 className="font-medium mb-1">General Settings</h4>
                      <p className="text-sm text-muted-foreground">Configure application-wide settings</p>
                    </div>
                    <div className="p-4 rounded-md bg-background hover:bg-muted transition-colors cursor-not-allowed opacity-70">
                      <h4 className="font-medium mb-1">Notification Preferences</h4>
                      <p className="text-sm text-muted-foreground">Manage email and system notifications</p>
                    </div>
                    <div className="p-4 rounded-md bg-background hover:bg-muted transition-colors cursor-not-allowed opacity-70">
                      <h4 className="font-medium mb-1">Payment Gateways</h4>
                      <p className="text-sm text-muted-foreground">Configure payment methods and processors</p>
                    </div>
                    <div className="p-4 rounded-md bg-background hover:bg-muted transition-colors cursor-not-allowed opacity-70">
                      <h4 className="font-medium mb-1">Shipping Options</h4>
                      <p className="text-sm text-muted-foreground">Set up shipping methods and rates</p>
                    </div>
                  </div>
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Settings will be available in the next update
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