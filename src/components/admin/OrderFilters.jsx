import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, RefreshCw, X, Filter, Download, Calendar } from 'lucide-react';

const OrderFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  resetFilters
}) => {
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
  };
  
  // Advanced filter state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Download CSV (placeholder)
  const downloadCSV = () => {
    alert('This would download orders as CSV file in a real application.');
  };

  return (
    <div className="bg-background border border-border rounded-lg p-5 mb-6 shadow-sm">
      <div className="flex flex-col space-y-5">
        {/* Primary filters row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders by ID, customer name or email"
              className="w-full pl-10 pr-4 py-2.5 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Status filter */}
            <div className="inline-flex items-center">
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2.5 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background appearance-none"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Sort controls */}
            <div className="inline-flex items-center rounded-md border border-input">
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-3 py-2.5 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background border-r border-input"
                aria-label="Sort by field"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="customer">Customer</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={toggleSortDirection}
                className="px-2.5 py-2.5 rounded-r-md hover:bg-muted transition-colors"
                aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortDirection === 'asc' ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {/* Actions buttons */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center justify-center py-2.5 px-4 border border-input rounded-md hover:bg-muted transition-colors text-sm font-medium"
              aria-label="Advanced filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
            
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center py-2.5 px-4 border border-input rounded-md hover:bg-muted transition-colors text-sm font-medium"
              aria-label="Export orders"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            <button
              onClick={resetFilters}
              className="flex items-center justify-center py-2.5 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              aria-label="Reset filters"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </button>
          </div>
        </div>
        
        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="bg-muted/30 border border-border rounded-md p-4 animate-in fade-in-50 duration-200">
            <h3 className="text-sm font-medium mb-3">Date Filter</h3>
            <div className="flex flex-wrap gap-4">
              <div className="w-full sm:w-auto">
                <label htmlFor="date-from" className="block text-xs font-medium text-muted-foreground mb-1">
                  From
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input 
                    type="date" 
                    id="date-from"
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-auto">
                <label htmlFor="date-to" className="block text-xs font-medium text-muted-foreground mb-1">
                  To
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input 
                    type="date" 
                    id="date-to"
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <button
                  className="py-2 px-4 border border-input rounded-md hover:bg-muted transition-colors text-sm font-medium h-[38px]"
                  onClick={() => setDateRange({ from: '', to: '' })}
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Additional filters could be added here */}
            
            <div className="mt-4 pt-3 border-t border-border flex justify-end">
              <button
                className="py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Active filters display */}
        {(statusFilter !== 'all' || searchTerm || (dateRange.from && dateRange.to)) && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            
            {statusFilter !== 'all' && (
              <div className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Status: {statusFilter}
                <button 
                  onClick={() => setStatusFilter('all')} 
                  className="hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {searchTerm && (
              <div className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Search: {searchTerm}
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {dateRange.from && dateRange.to && (
              <div className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Date range: {dateRange.from} to {dateRange.to}
                <button 
                  onClick={() => setDateRange({ from: '', to: '' })} 
                  className="hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            <button 
              onClick={resetFilters} 
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFilters;