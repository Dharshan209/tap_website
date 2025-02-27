import React, { useState } from 'react';
import { X, Mail, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const PasswordResetForm = ({ user, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleResetPassword = async () => {
    if (!user || !user.email) {
      setError('User email is not available');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, user.email);
      
      // Show success message
      setSuccess(true);
      
    } catch (err) {
      console.error('Error sending password reset email:', err);
      
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold">Reset Password</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {!success ? (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md flex items-center text-sm">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  <p className="font-medium">Send a password reset email to:</p>
                </div>
                <p className="text-muted-foreground bg-muted p-3 rounded-md">
                  {user?.email || 'Unknown email'}
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                This will send a password reset email to the user. They will be able to set a new password by following the link in the email.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center mb-4 text-green-600">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium mb-2">Reset Email Sent</h3>
              <p className="text-muted-foreground mb-6">
                A password reset link has been sent to {user?.email}. The link will expire in 1 hour.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetForm;