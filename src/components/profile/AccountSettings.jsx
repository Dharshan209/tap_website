import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Home, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AccountSettings = ({ user }) => {
  const { updateUserProfile, updateEmail, resetPassword, error: authError } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    email: user.email || '',
    phone: user.phoneNumber || '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    }
  });
  
  // Loading states
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [updatingAddress, setUpdatingAddress] = useState(false);
  
  // Success states
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle address input changes
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };
  
  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setError(null);
    
    try {
      await updateUserProfile({
        displayName: formData.displayName
      });
      
      setProfileSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setUpdatingProfile(false);
    }
  };
  
  // Update email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setUpdatingEmail(true);
    setError(null);
    
    try {
      await updateEmail(formData.email);
      
      setEmailSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setEmailSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to update email. Please try again.');
      console.error('Error updating email:', err);
    } finally {
      setUpdatingEmail(false);
    }
  };
  
  // Send password reset email
  const handleResetPassword = async () => {
    setSendingReset(true);
    setError(null);
    
    try {
      await resetPassword(user.email);
      
      setResetSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setResetSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error('Error sending reset email:', err);
    } finally {
      setSendingReset(false);
    }
  };
  
  // Update shipping address
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setUpdatingAddress(true);
    setError(null);
    
    try {
      // In a real app, you would save the address to Firestore
      // For demo purposes, just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAddressSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setAddressSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to update address. Please try again.');
      console.error('Error updating address:', err);
    } finally {
      setUpdatingAddress(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
      
      {/* Error message */}
      {(error || authError) && (
        <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error || authError}</p>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Personal Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-background border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            Personal Information
          </h3>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updatingProfile}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {updatingProfile ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
            
            {profileSuccess && (
              <div className="mt-3 p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Profile updated successfully!
              </div>
            )}
          </form>
        </motion.div>
        
        {/* Email & Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-background border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-primary" />
            Email & Password
          </h3>
          
          <div className="space-y-6">
            {/* Email Form */}
            <form onSubmit={handleUpdateEmail}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updatingEmail}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {updatingEmail ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Email
                    </>
                  )}
                </button>
              </div>
              
              {emailSuccess && (
                <div className="mt-3 p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Email updated successfully!
                </div>
              )}
            </form>
            
            {/* Password Reset */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium mb-4 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-primary" />
                Password
              </h4>
              
              <p className="text-sm text-muted-foreground mb-4">
                Need to change your password? We'll send a secure reset link to your email address.
              </p>
              
              <div className="flex">
                <button
                  onClick={handleResetPassword}
                  disabled={sendingReset}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  {sendingReset ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
              
              {resetSuccess && (
                <div className="mt-3 p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Password reset email sent!
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Shipping Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-background border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Home className="h-5 w-5 mr-2 text-primary" />
            Default Shipping Address
          </h3>
          
          <form onSubmit={handleUpdateAddress}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label htmlFor="line1" className="block text-sm font-medium mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="line1"
                  name="line1"
                  value={formData.address.line1}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="line2" className="block text-sm font-medium mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="line2"
                  name="line2"
                  value={formData.address.line2}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="City"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="State"
                />
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.address.postalCode}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Postal Code"
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updatingAddress}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {updatingAddress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Address
                  </>
                )}
              </button>
            </div>
            
            {addressSuccess && (
              <div className="mt-3 p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 rounded-md text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Address updated successfully!
              </div>
            )}
          </form>
        </motion.div>
        
        {/* Contact Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-background border border-border rounded-lg p-6"
        >
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-primary" />
            Contact Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletterEmail"
                className="h-4 w-4 text-primary border-input rounded focus:ring-2 focus:ring-primary/30"
              />
              <label htmlFor="newsletterEmail" className="ml-2 text-sm">
                Receive newsletter emails about new products and updates
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="orderUpdates"
                className="h-4 w-4 text-primary border-input rounded focus:ring-2 focus:ring-primary/30"
                checked
              />
              <label htmlFor="orderUpdates" className="ml-2 text-sm">
                Receive order status updates via email
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="specialOffers"
                className="h-4 w-4 text-primary border-input rounded focus:ring-2 focus:ring-primary/30"
              />
              <label htmlFor="specialOffers" className="ml-2 text-sm">
                Receive special offers and promotions
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountSettings;