import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import GoogleSignIn from '../components/auth/GoogleSignIn';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading, error: authError, clearError } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Determine the intended destination after login
  const from = location.state?.from?.pathname || '/';
  
  // If user is already logged in, redirect to intended destination
  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);
  
  // Set up any auth error from the useAuth hook
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  // Handle regular email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Clear previous errors
      setError('');
      setIsSubmitting(true);
      
      // Validate inputs
      if (!email.trim()) {
        setError('Email is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!password) {
        setError('Password is required');
        setIsSubmitting(false);
        return;
      }
      
      // Submit login request
      await login(email, password);
      
      // Success - navigate will happen in useEffect when user state updates
      setSuccessMessage('Login successful! Redirecting...');
      
    } catch (err) {
      // Handle error cases
      let errorMessage = 'Failed to log in. Please try again.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid login credentials. Please check your email and password.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle successful Google sign-in
// In LoginPage.jsx, update the handleGoogleSuccess function
const handleGoogleSuccess = (user) => {
    setSuccessMessage('Google sign-in successful! Redirecting...');
    
    // Explicitly navigate after a short delay
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 1000);
  };
  
  // Handle Google sign-in error
  const handleGoogleError = (error) => {
    let errorMessage = 'Google sign-in failed. Please try again.';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled. Please try again.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    
    setError(errorMessage);
  };
  
  // If still loading auth state, show a loading indicator
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
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
          <h1 className="text-2xl font-bold mt-4">Sign In to Your Account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your credentials to access your account
          </p>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>{successMessage}</p>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-md flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
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
          
          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                placeholder="Enter your password"
                autoComplete="current-password"
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
          </div>
          
          {/* Login Button */}
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
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="px-4 text-sm text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>
        
        {/* Google Sign In */}
        <div className="mb-6">
          <GoogleSignIn 
            onSuccess={handleGoogleSuccess} 
            onError={handleGoogleError}
            buttonText="Continue with Google"
          />
        </div>
        
        {/* Sign Up Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;