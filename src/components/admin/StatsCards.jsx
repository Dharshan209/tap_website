import React from 'react';
import { Clock, Package, Truck, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const StatusCard = ({ title, value, icon, iconColor, bgColor, borderColor }) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-5 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px] duration-300`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={`${iconColor} p-2 rounded-full ${bgColor.replace('bg-', 'bg-opacity-20')}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

const StatsCards = ({ stats }) => {
  // Calculate percentages for visual indicators
  const totalOrders = stats.total || 1; // Prevent division by zero
  const pendingPercent = Math.round((stats.pending / totalOrders) * 100);
  const processingPercent = Math.round((stats.processing / totalOrders) * 100);
  const shippedPercent = Math.round((stats.shipped / totalOrders) * 100);
  const deliveredPercent = Math.round((stats.delivered / totalOrders) * 100);
  
  // If revenue is available, include it, otherwise use placeholder
  const revenue = stats.revenue ? `₹${stats.revenue.toLocaleString('en-IN')}` : 'N/A';
  
  return (
    <div className="mb-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatusCard 
          title="Total Orders" 
          value={stats.total} 
          icon={<Package className="h-5 w-5" />} 
          iconColor="text-primary"
          bgColor="bg-background"
          borderColor="border-border"
        />
        
        <StatusCard 
          title="Pending" 
          value={stats.pending} 
          icon={<Clock className="h-5 w-5" />} 
          iconColor="text-amber-500"
          bgColor="bg-amber-50 dark:bg-amber-950/20"
          borderColor="border-amber-100 dark:border-amber-900/30"
        />
        
        <StatusCard 
          title="Processing" 
          value={stats.processing} 
          icon={<AlertCircle className="h-5 w-5" />}
          iconColor="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-950/20"
          borderColor="border-blue-100 dark:border-blue-900/30"
        />
        
        <StatusCard 
          title="Shipped" 
          value={stats.shipped} 
          icon={<Truck className="h-5 w-5" />}
          iconColor="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-950/20"
          borderColor="border-purple-100 dark:border-purple-900/30"
        />
        
        <StatusCard 
          title="Delivered" 
          value={stats.delivered} 
          icon={<CheckCircle className="h-5 w-5" />}
          iconColor="text-green-500"
          bgColor="bg-green-50 dark:bg-green-950/20"
          borderColor="border-green-100 dark:border-green-900/30"
        />
        
        <StatusCard 
          title="Revenue" 
          value={revenue} 
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-50 dark:bg-emerald-950/20"
          borderColor="border-emerald-100 dark:border-emerald-900/30"
        />
      </div>
      
      {/* Status Progress Bar */}
      <div className="bg-background border border-border rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-medium mb-3">Order Status Distribution</h3>
        <div className="h-4 flex rounded-full overflow-hidden">
          <div 
            className="bg-amber-500" 
            style={{ width: `${pendingPercent}%` }}
            title={`Pending: ${stats.pending} (${pendingPercent}%)`}
          ></div>
          <div 
            className="bg-blue-500" 
            style={{ width: `${processingPercent}%` }}
            title={`Processing: ${stats.processing} (${processingPercent}%)`}
          ></div>
          <div 
            className="bg-purple-500" 
            style={{ width: `${shippedPercent}%` }}
            title={`Shipped: ${stats.shipped} (${shippedPercent}%)`}
          ></div>
          <div 
            className="bg-green-500" 
            style={{ width: `${deliveredPercent}%` }}
            title={`Delivered: ${stats.delivered} (${deliveredPercent}%)`}
          ></div>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
            <span>Pending ({pendingPercent}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Processing ({processingPercent}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
            <span>Shipped ({shippedPercent}%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>Delivered ({deliveredPercent}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;