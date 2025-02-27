import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { User, Package, Settings, Clock, ShoppingBag, LogOut, Edit, Camera } from 'lucide-react';
import { format } from 'date-fns';

// Import user profile components
import OrderHistory from '../components/profile/OrderHistory';
import AccountSettings from '../components/profile/AccountSettings';

const ProfilePage = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const { getDocuments } = useFirestore('orders');
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('orders');
  
  // State for orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoadingOrders(true);
        const orderData = await getDocuments([
          { field: 'userId', operator: '==', value: user.uid }
        ], 'createdAt', 'desc');
        
        setOrders(orderData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    fetchOrders();
  }, [user, getDocuments]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // If not logged in, redirect to login
  if (!authLoading && !user) {
    return <Navigate to="/login" replace state={{ from: { pathname: '/profile' } }} />;
  }
  
  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="py-12">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto"
        >
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start mb-8 md:space-x-6">
            {/* Profile Avatar */}
            <div className="relative mb-4 md:mb-0">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-background text-primary p-1.5 rounded-full border border-primary hover:bg-primary/10 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">
                {user.displayName || 'My Account'}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start mt-4 space-x-2">
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Log Out
                </button>
              </div>
            </div>
            
            {/* Edit Profile Button */}
            <div>
              <button className="inline-flex items-center px-4 py-2 border border-input rounded-md text-sm hover:bg-muted transition-colors">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-border mb-8">
            <nav className="flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-4 px-1 inline-flex items-center text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Order History
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-4 px-1 inline-flex items-center text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'settings'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div>
            {activeTab === 'orders' && (
              <OrderHistory orders={orders} loading={loadingOrders} />
            )}
            
            {activeTab === 'settings' && (
              <AccountSettings user={user} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;