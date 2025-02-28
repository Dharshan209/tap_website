import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { ToastProvider } from './components/ui/toast';
import { AnimatePresence, motion } from 'framer-motion';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Using lazy loading for better performance (with error handling)
const lazyLoad = (importFn) => {
  return lazy(() => 
    importFn().catch(error => {
      console.error('Error loading module:', error);
      // Return a minimal module that renders an error message
      return { 
        default: () => (
          <div className="flex items-center justify-center min-h-[50vh] text-center p-8">
            <div>
              <h2 className="text-xl font-semibold mb-2">Loading Error</h2>
              <p className="text-gray-600 mb-4">
                We're having trouble loading this page. Please try refreshing.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      };
    })
  );
};

const HomePage = lazyLoad(() => import('./pages/HomePage'));
const ProductPage = lazyLoad(() => import('./pages/ProductPage'));
const CartPage = lazyLoad(() => import('./pages/CartPage'));
const CheckoutPage = lazyLoad(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazyLoad(() => import('./pages/OrderConfirmationPage'));
const ProfilePage = lazyLoad(() => import('./pages/ProfilePage'));
const AdminDashboard = lazyLoad(() => import('./pages/AdminDashboard'));
const LoginPage = lazyLoad(() => import('./pages/LoginPage'));
const SignupPage = lazyLoad(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazyLoad(() => import('./pages/ForgotPasswordPage'));
const AboutPage = lazyLoad(() => import('./pages/AboutPage'));
const ContactPage = lazyLoad(() => import('./pages/ContactPage'));
const NotFoundPage = lazyLoad(() => import('./pages/NotFoundPage'));
const LegalPage = lazyLoad(() => import('./pages/LegalPage'));

// Auth context for Firebase Authentication
import { AuthProvider } from './hooks/useAuth';

// Import spinner component
import { FullPageSpinner } from './components/ui/spinner';

function App() {
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  // Reset scroll position when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Simulate brief loading state for smoother transitions
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="tap-ui-theme">
      <ToastProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow relative">
              <Suspense fallback={<FullPageSpinner message="Loading application..." className="min-h-screen" />}>
                <AnimatePresence mode="wait">
                  {isPageLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-background z-10 flex items-center justify-center"
                    >
                      <FullPageSpinner message="Loading content..." />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={location.pathname}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                    <Routes location={location}>
                      {/* Public Routes */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/product" element={<ProductPage />} />
                      <Route path="/product/:productId" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/legal" element={<LegalPage />} />
                      
                      {/* Protected Admin Route */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/*" element={<AdminDashboard />} />
                      
                      {/* 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </motion.div>
                )}
              </AnimatePresence>
            </Suspense>
          </main>
          <Footer />
        </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;