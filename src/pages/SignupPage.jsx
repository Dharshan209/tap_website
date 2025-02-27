import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Check } from 'lucide-react';
import GoogleSignIn from '../components/auth/GoogleSignIn';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, user, loading: authLoading, error: authError, clearError } = useAuth();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false
  });
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
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
  
  // Check password strength
  useEffect(() => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /\d/.test(password)
    });
  }, [password]);
  
  // Handle regular email/password signup
  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      // Clear previous errors
      setError('');
      setIsSubmitting(true);
      
      // Validate inputs
      if (!name.trim()) {
        setError('Name is required');
        setIsSubmitting(false);
        return;
      }
      
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
      
      if (password !== confirmPassword) {
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
      
      // Submit signup request
      await signup(email, password, name);
      
      // Success message
      setSuccessMessage('Account created successfully! Please check your email for verification.');
      
      // Redirect to home after short delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (err) {
      // Handle error cases
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please try another email or sign in.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle successful Google sign-in
  const handleGoogleSuccess = (user) => {
    setSuccessMessage('Google sign-in successful! Redirecting...');
    // Navigation will happen automatically through the useEffect
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
          <h1 className="text-2xl font-bold mt-4">Create Your Account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Join TAP to create custom storybooks from your child's artwork
          </p>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-md flex items-center text-sm">
            <Check className="h-5 w-5 mr-2 flex-shrink-0" />
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
        
        {/* Google Sign In */}
        <div className="mb-6">
          <GoogleSignIn 
            onSuccess={handleGoogleSuccess} 
            onError={handleGoogleError}
            buttonText="Continue with Google"
          />
        </div>
        
        {/* Divider */}
        <div className="mb-6 flex items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="px-4 text-sm text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>
        
        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          </div>
          
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
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
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
                placeholder="Create a password"
                autoComplete="new-password"
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
            {password.length > 0 && (
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors bg-background"
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
            )}
          </div>
          
          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary border-input rounded focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-muted-foreground">
                I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
          </div>
          
          {/* Signup Button */}
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
                <span>Creating Account...</span>
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>
        
        {/* Sign In Link */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;