import React from 'react';
import { MoreHorizontal, Clock, Package, Truck, CheckCircle } from 'lucide-react';

const OrderStatusDropdown = ({ orderId, currentStatus, updateOrderStatus }) => {
  return (
    <div className="relative group">
      <button
        className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        aria-label="More options"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-10 hidden group-hover:block">
        <div className="py-1">
          <button
            onClick={() => updateOrderStatus(orderId, 'pending')}
            disabled={currentStatus === 'pending'}
            className={`flex w-full items-center px-4 py-2 text-sm hover:bg-muted ${currentStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Clock className="h-4 w-4 mr-2 text-amber-500" />
            Mark as Pending
          </button>
          <button
            onClick={() => updateOrderStatus(orderId, 'processing')}
            disabled={currentStatus === 'processing'}
            className={`flex w-full items-center px-4 py-2 text-sm hover:bg-muted ${currentStatus === 'processing' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Package className="h-4 w-4 mr-2 text-blue-500" />
            Mark as Processing
          </button>
          <button
            onClick={() => updateOrderStatus(orderId, 'shipped')}
            disabled={currentStatus === 'shipped'}
            className={`flex w-full items-center px-4 py-2 text-sm hover:bg-muted ${currentStatus === 'shipped' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Truck className="h-4 w-4 mr-2 text-purple-500" />
            Mark as Shipped
          </button>
          <button
            onClick={() => updateOrderStatus(orderId, 'delivered')}
            disabled={currentStatus === 'delivered'}
            className={`flex w-full items-center px-4 py-2 text-sm hover:bg-muted ${currentStatus === 'delivered' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            Mark as Delivered
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusDropdown;