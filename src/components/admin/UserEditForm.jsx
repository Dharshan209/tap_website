import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, ShieldOff } from 'lucide-react';

const UserEditForm = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    isAdmin: false,
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        isAdmin: user.isAdmin || false,
        notes: user.notes || ''
      });
    }
  }, [user]);
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsSubmitting(true);
      
      // Validate inputs
      if (!formData.displayName.trim()) {
        setError('Name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.email.trim()) {
        setError('Email is required');
        setIsSubmitting(false);
        return;
      }
      
      // Save the updated user data
      await onSave({
        ...formData,
        updatedAt: new Date().toISOString()
      });
      
      // Close modal on success
      onClose();
      
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Name Input */}
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                placeholder="Enter user's full name"
              />
            </div>
          </div>
          
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                placeholder="Enter user's email"
              />
            </div>
          </div>
          
          {/* Admin Role Toggle */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="isAdmin"
                name="isAdmin"
                type="checkbox"
                checked={formData.isAdmin}
                onChange={handleChange}
                className="h-4 w-4 text-primary border-input rounded focus:ring-2 focus:ring-primary/30"
              />
              <label htmlFor="isAdmin" className="ml-2 flex items-center text-sm font-medium">
                {formData.isAdmin ? (
                  <>
                    <Shield className="h-4 w-4 mr-1 text-primary" />
                    Admin User
                  </>
                ) : (
                  <>
                    <ShieldOff className="h-4 w-4 mr-1 text-muted-foreground" />
                    Regular User
                  </>
                )}
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              Admin users have access to all administrative functions
            </p>
          </div>
          
          {/* Notes Textarea */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Admin Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
              placeholder="Add notes about this user (only visible to admins)"
            ></textarea>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditForm;