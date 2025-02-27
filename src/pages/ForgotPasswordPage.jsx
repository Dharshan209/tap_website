import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Mail, AlertCircle, ArrowLeft, Check } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { resetPassword, error: authError, clearError } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors and messages
    setError('');
    clearError();
    setSuccessMessage('');
    
    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send password reset email
      await resetPassword(email);
      
      // Show success message
      setSuccessMessage('Password reset email sent! Check your inbox for instructions.');
      
      // Clear form
      setEmail('');
    } catch (err) {
      // Handle error
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setError(errorMessage || authError);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TAP
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Reset Your Password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md">
            <div className="flex items-center mb-2">
              <Check className="h-5 w-5 mr-2 flex-shrink-0" />
              <h3 className="font-medium">Email Sent</h3>
            </div>
            <p className="text-sm">{successMessage}</p>
            <div className="mt-4">
              <Link
                to="/login"
                className="text-sm font-medium text-green-800 dark:text-green-400 hover:underline"
              >
                Return to login
              </Link>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {(error || authError) && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>{error || authError}</p>
          </div>
        )}
        
        {!successMessage && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending Email...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
            
            {/* Back to Login Link */}
            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;