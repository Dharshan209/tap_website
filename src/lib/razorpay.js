import { v4 as uuidv4 } from 'uuid';

// Enhanced logging for Razorpay events
const logRazorpayEvent = (eventType, details = {}) => {
  console.log('Razorpay Event:', {
    type: eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      logRazorpayEvent('script_already_loaded');
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      logRazorpayEvent('script_loaded_successfully');
      resolve(true);
    };
    
    script.onerror = (error) => {
      logRazorpayEvent('script_load_error', { error });
      reject(new Error('Failed to load Razorpay script'));
    };
    
    document.body.appendChild(script);
  });
};

// Create Razorpay order via backend API
export const createRazorpayOrder = async (amount, currency = 'INR', metadata = {}) => {
  try {
    // Validate amount
    if (amount === undefined || amount === null || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount. Must be a positive number.');
    }

    // Convert amount to paise
    const amountInPaise = Math.round(amount * 100);
    
    // Use environment variable for backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5020';
    
    logRazorpayEvent('order_creation_started', { amount, amountInPaise, metadata });

    const response = await fetch(`${backendUrl}/api/create-order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        amount: amountInPaise, 
        currency,
        metadata // Include additional metadata for order reference
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      logRazorpayEvent('order_creation_failed', { 
        status: response.status, 
        error: errorData 
      });
      throw new Error(errorData.error || 'Failed to create Razorpay order');
    }

    const data = await response.json();
    
    logRazorpayEvent('order_created_successfully', { 
      orderId: data.id 
    });

    // Store order ID in localStorage for recovery
    try {
      localStorage.setItem('razorpay_last_order', JSON.stringify({
        id: data.id,
        amount: amountInPaise,
        currency,
        timestamp: new Date().toISOString(),
        metadata
      }));
    } catch (e) {
      console.warn('Could not store order details in localStorage:', e);
    }

    return data;
  } catch (error) {
    logRazorpayEvent('order_creation_error', { 
      message: error.message 
    });
    throw error;
  }
};

// Initialize Razorpay Checkout with enhanced error handling and retry capability
export const initiateRazorpayCheckout = async ({
  amount,
  currency = 'INR',
  name = 'TAP - Turn Art into Pages',
  description = 'Custom Storybook Purchase',
  orderId,
  notes = {},
  prefill = {},
  theme = { color: '#6366F1' },
  firebaseOrderId, // Pass Firebase order ID for reference
  onSuccess,
  onError,
  onRetry
}) => {
  try {
    // Load Razorpay script
    await loadRazorpayScript();

    // Validate inputs
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid checkout amount');
    }

    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const key = import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.RAZORPAY_KEY_ID;
    if (!key) {
      throw new Error('Razorpay API key not found. Please check your environment variables.');
    }
    console.log("Razorpay key found:", key.substring(0, 8) + '...');
    
    const amountInPaise = Math.round(amount * 100);

    logRazorpayEvent('checkout_initiated', { 
      amount, 
      orderId, 
      firebaseOrderId,
      key 
    });

    // Store current checkout info for potential retry and recovery
    try {
      localStorage.setItem('razorpay_current_checkout', JSON.stringify({
        orderId,
        firebaseOrderId,
        amount: amountInPaise,
        currency,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Could not store checkout details in localStorage:', e);
    }

    const options = {
      key,
      amount: amountInPaise,
      currency,
      name,
      description,
      order_id: orderId,
      handler: function (response) {
        logRazorpayEvent('payment_success', { 
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          firebaseOrderId
        });

        // Clear checkout info from localStorage on success
        try {
          localStorage.removeItem('razorpay_current_checkout');
        } catch (e) {
          console.warn('Could not clear checkout details from localStorage:', e);
        }

        // Add additional verification and logging
        if (!response.razorpay_payment_id) {
          console.error('Payment success event missing payment ID!');
        }

        onSuccess && onSuccess({
          ...response,
          firebaseOrderId,
          timestamp: new Date().toISOString()
        });
      },
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || '',
        ...prefill
      },
      notes: {
        ...notes,
        source: 'TAP_STORYBOOK_PURCHASE',
        firebaseOrderId: firebaseOrderId || ''
      },
      theme: { 
        color: theme.color || '#6366F1' 
      },
      modal: {
        ondismiss: () => {
          logRazorpayEvent('checkout_dismissed');
          
          // Prompt user if they want to retry
          const shouldRetry = window.confirm('Payment window was closed. Would you like to try again?');
          
          if (shouldRetry && onRetry) {
            onRetry();
          } else {
            onError && onError(new Error('Payment cancelled by user'));
          }
        },
        // Add animation to make it smoother
        animation: true
      },
      retry: {
        enabled: true,
        max_count: 3
      },
      timeout: 300, // 5 minutes
      config: { 
        display: { 
          language: 'en',
          hide_topbar: false
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    
    // Manage UI specific events
    razorpayInstance.on('payment.error', function() {
      // This is a UI error, more specific failure will come in payment.failed
      logRazorpayEvent('payment_ui_error');
    });
    
    razorpayInstance.on('payment.failed', function (failureResponse) {
      const errorDetails = {
        code: failureResponse.error?.code,
        description: failureResponse.error?.description,
        source: failureResponse.error?.source,
        step: failureResponse.error?.step,
        reason: failureResponse.error?.reason,
        firebaseOrderId
      };
      
      logRazorpayEvent('payment_failed', errorDetails);
      
      if (failureResponse.error?.code === 'BAD_REQUEST_ERROR' && onRetry) {
        // Offer retry for specific recoverable errors
        const shouldRetry = window.confirm('Payment failed. Would you like to try again?');
        if (shouldRetry) {
          onRetry();
          return;
        }
      }
      
      onError && onError(failureResponse.error || new Error('Payment failed'));
    });
    
    // Open the checkout form
    razorpayInstance.open();

  } catch (error) {
    logRazorpayEvent('checkout_error', { 
      message: error.message,
      firebaseOrderId
    });
    onError && onError(error);
    throw error;
  }
};

// Utility function to verify a Razorpay payment
export const verifyRazorpayPayment = async (paymentId, orderId, signature) => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5020';
    
    const response = await fetch(`${backendUrl}/api/verify-payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        paymentId, 
        orderId,
        signature
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      logRazorpayEvent('payment_verification_failed', { 
        paymentId,
        orderId,
        error: errorData 
      });
      throw new Error(errorData.error || 'Failed to verify payment');
    }

    const data = await response.json();
    logRazorpayEvent('payment_verified', { paymentId, orderId });
    return data.verified;
  } catch (error) {
    logRazorpayEvent('payment_verification_error', { 
      message: error.message,
      paymentId,
      orderId
    });
    throw error;
  }
};