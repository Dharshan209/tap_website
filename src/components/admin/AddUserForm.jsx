import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

const AddUserForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
    notes: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Password strength indicators
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false
  });
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Update password requirements
    if (name === 'password') {
      setPasswordRequirements({
        minLength: value.length >= 8,
        hasLetter: /[a-zA-Z]/.test(value),
        hasNumber: /\d/.test(value)
      });
    }
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
      
      if (!formData.password) {
        setError('Password is required');
        setIsSubmitting(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsSubmitting(false);
        return;
      }
      
      // Check password strength
      if (!passwordRequirements.minLength || !passwordRequirements.hasLetter || !passwordRequirements.hasNumber) {
        setError('Password does not meet the requirements');
        setIsSubmitting(false);
        return;
      }
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Get the new user's UID
      const uid = userCredential.user.uid;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', uid), {
        displayName: formData.displayName,
        email: formData.email,
        isAdmin: formData.isAdmin,
        notes: formData.notes || '',
        createdAt: serverTimestamp(),
        createdBy: 'admin',
        lastLogin: null
      });
      
      // Call success callback with the new user data
      onSuccess({
        id: uid,
        displayName: formData.displayName,
        email: formData.email,
        isAdmin: formData.isAdmin,
        notes: formData.notes || '',
        createdAt: new Date().toISOString()
      });
      
      // Close the form
      onClose();
      
    } catch (err) {
      console.error('Error creating user:', err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use a different email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-xl font-semibold">Add New User</h2>
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
          
          {/* Full Name Input */}
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
          
          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Password Requirements */}
            {formData.password.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium">Password must have:</p>
                <div className="text-xs flex items-center">
                  <span className={`inline-block w-4 h-4 mr-2 rounded-full ${
                    passwordRequirements.minLength ? 'bg-green-500' : 'bg-muted'
                  }`}></span>
                  At least 8 characters
                </div>
                <div className="text-xs flex items-center">
                  <span className={`inline-block w-4 h-4 mr-2 rounded-full ${
                    passwordRequirements.hasLetter ? 'bg-green-500' : 'bg-muted'
                  }`}></span>
                  At least one letter
                </div>
                <div className="text-xs flex items-center">
                  <span className={`inline-block w-4 h-4 mr-2 rounded-full ${
                    passwordRequirements.hasNumber ? 'bg-green-500' : 'bg-muted'
                  }`}></span>
                  At least one number
                </div>
              </div>
            )}
          </div>
          
          {/* Confirm Password Input */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                placeholder="Confirm password"
              />
            </div>
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
            )}
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
                <Shield className="h-4 w-4 mr-1 text-primary" />
                Admin User
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
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;