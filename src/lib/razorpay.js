// lib/razorpay.js
import axios from 'axios';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5500'
});

// Load the Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Function to create a Razorpay order through our backend
export const createRazorpayOrder = async (amount, currency, metadata = {}) => {
  try {
    // Ensure amount is a number
    const amountInPaise = Math.round(Number(amount) * 100);
    
    // Call your backend API to create the order
    // Use the api instance with correct baseURL
    const response = await api.post('/api/razorpay/create-order', {
      amount: amountInPaise,
      currency,
      metadata
    });

    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

// Function to initiate the Razorpay checkout
export const initiateRazorpayCheckout = async ({
  amount,
  orderId,
  name,
  description,
  prefill = {},
  notes = {},
  onSuccess,
  onError,
  onDismiss
}) => {
  try {
    // Load the Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay checkout script');
    }

    // Initialize Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // amount in paisa
      currency: 'INR',
      name: name || 'TAP - Turn Art into Pages',
      description: description || 'Custom Storybook Purchase',
      order_id: orderId,
      handler: function (response) {
        // Call the success callback with the payment details
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response);
        }
      },
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || ''
      },
      notes: notes,
      theme: {
        color: '#7C3AED' // This should match your primary color
      },
      modal: {
        ondismiss: function () {
          if (onDismiss && typeof onDismiss === 'function') {
            onDismiss();
          }
        },
        escape: false,
        backdropclose: false
      }
    };

    // Create new Razorpay instance
    const razorpayInstance = new window.Razorpay(options);
    
    // Register error event
    razorpayInstance.on('payment.failed', function (response) {
      if (onError && typeof onError === 'function') {
        onError({
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
          metadata: response.error.metadata
        });
      }
    });

    // Open Razorpay checkout
    razorpayInstance.open();
    
    return razorpayInstance;
  } catch (error) {
    console.error('Razorpay checkout error:', error);
    if (onError && typeof onError === 'function') {
      onError(error);
    }
    throw error;
  }
};

// Function to verify payment with your backend
export const verifyRazorpayPayment = async (paymentId, orderId, signature) => {
  try {
    const response = await api.post('/api/razorpay/verify-payment', {
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature
    });
    
    return response.data.success;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
};