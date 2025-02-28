import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigationType } from 'react-router-dom'
import App from './App.jsx'
import './styles/globals.css'

// Register service worker for offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

// Enhanced Error Boundary for the entire application
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isNetworkError: false,
      isDynamicImportError: false,
    }
  }

  static getDerivedStateFromError(error) {
    // Detect specific error types for better error messages
    const isNetworkError = error.message && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed')
    );
    
    const isDynamicImportError = error.message && (
      error.message.includes('dynamically imported module') ||
      error.message.includes('Failed to fetch dynamically imported module')
    );
    
    return { 
      hasError: true,
      isNetworkError,
      isDynamicImportError,
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error to monitoring service (future implementation)
    console.error('Application error:', error, errorInfo)
    
    // If it's an import error, we should clear the cache to prevent future issues
    if (error.message && error.message.includes('dynamically imported module')) {
      // Try to clear cache for next reload
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }
    }
  }

  handleReload = () => {
    // For dynamic import errors, we need a hard reload to clear the cache
    if (this.state.isDynamicImportError) {
      window.location.href = window.location.href.split('#')[0]; // Remove any hash
      window.location.reload(true); // Force reload from server
    } else {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      // Customize the error message based on the type of error
      let errorTitle = "Something went wrong";
      let errorMessage = "We're sorry, but there was an error in the application. Our team has been notified.";
      
      if (this.state.isNetworkError) {
        errorTitle = "Network Error";
        errorMessage = "We're having trouble connecting to our servers. Please check your internet connection and try again.";
      } else if (this.state.isDynamicImportError) {
        errorTitle = "Loading Error";
        errorMessage = "We're having trouble loading part of the application. This might be due to a new update or connection issue.";
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 border border-border">
            <h1 className="text-2xl font-bold text-destructive mb-4">{errorTitle}</h1>
            <p className="text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <div className="space-y-2">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Reload the application
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-muted text-foreground py-2 rounded-md hover:bg-muted/80 transition-colors"
              >
                Try again without reloading
              </button>
              <a 
                href="/"
                className="block w-full text-center bg-secondary text-secondary-foreground py-2 rounded-md hover:bg-secondary/90 transition-colors mt-2"
              >
                Go to home page
              </a>
            </div>
            
            {/* Show technical details in development mode */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 p-3 bg-muted rounded-md">
                <p className="font-mono text-xs break-all whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Performance measurement
const reportWebVitals = (metric) => {
  // Analytics implementation (future)
  if (import.meta.env.MODE === 'production') {
    // Send metrics to analytics
    console.log(metric)
  }
}

// Create and render the root
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

// Web Vitals reporting
if (import.meta.env.MODE === 'production') {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(reportWebVitals)
    getFID(reportWebVitals)
    getFCP(reportWebVitals)
    getLCP(reportWebVitals)
    getTTFB(reportWebVitals)
  })
}