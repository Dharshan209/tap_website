import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  User, Calendar, Eye, Package, Filter, RefreshCw, 
  AlertCircle, ChevronLeft, ChevronRight, Clipboard, 
  Download, MoreHorizontal
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import OrderStatusDropdown from './OrderStatusDropdown';

// Utility function for safe date formatting
const safeFormatDate = (dateString) => {
  try {
    return dateString 
      ? format(new Date(dateString), 'MMM dd, yyyy') 
      : 'N/A';
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return 'Invalid Date';
  }
};

// Utility function for safe amount formatting
const safeFormatAmount = (amount) => {
  try {
    const numAmount = Number(amount);
    return !isNaN(numAmount) ? numAmount.toFixed(2) : '0.00';
  } catch (error) {
    console.warn('Invalid amount:', amount);
    return '0.00';
  }
};

const OrderTable = ({ 
  orders = [], 
  loading = false,
  error = null,
  searchTerm = '',
  statusFilter = 'all',
  viewOrderDetails,
  updateOrderStatus,
  resetFilters
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // Calculate pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);
  
  // Handle bulk selection
  const toggleSelectAll = () => {
    if (selectedOrders.length === currentOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map(order => order.id));
    }
  };
  
  const toggleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };
  
  // Bulk action handler (placeholder)
  const handleBulkAction = (action) => {
    if (selectedOrders.length === 0) return;
    
    switch (action) {
      case 'download':
        alert(`Downloading ${selectedOrders.length} orders`);
        break;
      case 'export':
        alert(`Exporting ${selectedOrders.length} orders to CSV`);
        break;
      case 'copy':
        navigator.clipboard.writeText(selectedOrders.join(', '))
          .then(() => alert('Order IDs copied to clipboard'))
          .catch(() => alert('Failed to copy to clipboard'));
        break;
      default:
        break;
    }
  };

  // Error state handling
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center mb-4 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium mb-2">Failed to Load Orders</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  // Empty state
  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          {searchTerm || statusFilter !== 'all'
            ? 'No orders match your current filters. Try adjusting your search criteria.'
            : 'There are no orders in the system yet.'}
        </p>
        {(searchTerm || statusFilter !== 'all') && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  // Render orders table with pagination
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {/* Bulk action bar - only show when items are selected */}
      {selectedOrders.length > 0 && (
        <div className="bg-primary/10 border-b border-border p-2 flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium ml-2">
              {selectedOrders.length} {selectedOrders.length === 1 ? 'order' : 'orders'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleBulkAction('copy')} 
              className="text-xs flex items-center gap-1 p-1.5 rounded-md hover:bg-primary/20"
              title="Copy order IDs"
            >
              <Clipboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Copy IDs</span>
            </button>
            <button 
              onClick={() => handleBulkAction('download')} 
              className="text-xs flex items-center gap-1 p-1.5 rounded-md hover:bg-primary/20"
              title="Download selected orders"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-xs flex items-center gap-1 p-1.5 rounded-md hover:bg-primary/20 font-medium"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear selection</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={currentOrders.length > 0 && selectedOrders.length === currentOrders.length}
                    onChange={toggleSelectAll}
                  />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentOrders.map((order) => {
              // Safely process order data
              const safeOrder = {
                id: order.id || 'N/A',
                createdAt: order.createdAt || new Date().toISOString(),
                status: order.status || 'pending',
                amount: order.amount || 0,
                shippingDetails: {
                  fullName: order.shippingDetails?.fullName || 'Unknown',
                  email: order.shippingDetails?.email || 'No email'
                }
              };

              return (
                <tr key={safeOrder.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedOrders.includes(safeOrder.id)}
                      onChange={() => toggleSelectOrder(safeOrder.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="font-mono font-medium">{safeOrder.id.substring(0, 10)}...</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="ml-3 truncate max-w-[140px] sm:max-w-none">
                        <p className="text-sm font-medium truncate">{safeOrder.shippingDetails.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{safeOrder.shippingDetails.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                      {safeFormatDate(safeOrder.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={safeOrder.status} />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                    ₹{Number(safeOrder.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => viewOrderDetails(safeOrder)}
                        className="p-1.5 text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition-colors"
                        aria-label="View order details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <OrderStatusDropdown 
                        orderId={safeOrder.id} 
                        currentStatus={safeOrder.status} 
                        updateOrderStatus={updateOrderStatus} 
                      />
                      <div className="relative group">
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 mt-1 bg-background shadow-lg rounded-md border border-border p-1 w-40 hidden group-hover:block z-10">
                          <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                            Print Order
                          </button>
                          <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                            Email Customer
                          </button>
                          <button className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors text-destructive hover:bg-destructive/10">
                            Delete Order
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="border-t border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <span>
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">{Math.min(endIndex, orders.length)}</span> of{' '}
            <span className="font-medium">{orders.length}</span> orders
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
            className="text-sm border border-input rounded-md py-1 pl-2 pr-8 bg-background"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="mx-2 text-sm">
              Page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages || 1}</span>
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded-md hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;