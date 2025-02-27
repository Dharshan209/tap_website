import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Enhanced CORS configuration
// Enhanced CORS configuration
app.use(cors({
    origin: [
      'http://localhost:5173',  // Vite default port
      'http://localhost:5020',  // Backend server port
      'https://your-production-domain.com'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(express.json());

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  console.error('Missing Razorpay credentials');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Create Razorpay Order Endpoint
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', metadata = {} } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        details: 'Amount must be a positive number'
      });
    }

    // Create a unique receipt ID
    const receiptId = `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create Razorpay order with notes for tracking
    const orderOptions = {
      amount: Math.round(amount),
      currency,
      receipt: receiptId,
      payment_capture: 1,  // Auto-capture payment
      notes: {
        source: 'TAP_STORYBOOK_PURCHASE',
        firebaseOrderId: metadata.firebaseOrderId || '',
        orderType: metadata.orderType || 'storybook',
        customerEmail: metadata.email || '',
        ...metadata.notes
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    // Log order creation
    console.log('Razorpay Order Created:', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      metadata
    });

    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    
    res.status(500).json({ 
      error: 'Failed to create order', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Verify Payment Endpoint (using Razorpay Signature)
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;
    
    // Validate required fields
    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'paymentId, orderId, and signature are required'
      });
    }

    // Build the expected signature data
    const signatureData = orderId + '|' + paymentId;
    
    // Get Razorpay secret from environment
    const key_secret = process.env.RAZORPAY_SECRET;
    
    // Create hmac object
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(signatureData)
      .digest('hex');
    
    // Compare signatures
    const isSignatureValid = expectedSignature === signature;
    
    if (isSignatureValid) {
      // Fetch payment details from Razorpay
      const payment = await razorpay.payments.fetch(paymentId);
      
      console.log('Payment verified successfully:', {
        paymentId,
        orderId,
        amount: payment.amount / 100,
        status: payment.status
      });
      
      res.status(200).json({
        verified: true,
        payment: {
          id: payment.id,
          amount: payment.amount / 100,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact
        }
      });
    } else {
      console.warn('Payment signature verification failed:', {
        paymentId,
        orderId
      });
      
      res.status(400).json({
        verified: false,
        error: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    
    res.status(500).json({
      verified: false,
      error: 'Failed to verify payment',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Webhook Endpoint for Razorpay Events
app.post('/api/razorpay-webhook', async (req, res) => {
  try {
    // Get the webhook signature from headers
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    if (!webhookSignature) {
      return res.status(400).json({
        error: 'Missing webhook signature'
      });
    }
    
    // Get the raw body content
    const rawBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const crypto = require('crypto');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');
    
    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({
        error: 'Invalid webhook signature'
      });
    }
    
    // At this point, the webhook is verified
    const event = req.body;
    
    // Process different webhook events
    const eventType = event.event;
    console.log(`Received webhook event: ${eventType}`);
    
    switch (eventType) {
      case 'payment.authorized':
      case 'payment.captured':
        // Handle successful payment
        console.log('Payment successful:', {
          paymentId: event.payload.payment.entity.id,
          orderId: event.payload.payment.entity.order_id,
          amount: event.payload.payment.entity.amount / 100
        });
        
        // Here you would update your database record
        // This often requires integration with your database
        // For now, we'll just acknowledge receipt
        break;
        
      case 'payment.failed':
        // Handle failed payment
        console.log('Payment failed:', {
          paymentId: event.payload.payment.entity.id,
          orderId: event.payload.payment.entity.order_id,
          errorCode: event.payload.payment.entity.error_code,
          errorDescription: event.payload.payment.entity.error_description
        });
        break;
        
      case 'refund.created':
        // Handle refund
        console.log('Refund created:', {
          refundId: event.payload.refund.entity.id,
          paymentId: event.payload.refund.entity.payment_id,
          amount: event.payload.refund.entity.amount / 100
        });
        break;
        
      default:
        console.log('Unhandled webhook event:', eventType);
    }
    
    // Acknowledge receipt of webhook
    res.status(200).json({
      received: true
    });
  } catch (error) {
    console.error('Webhook Processing Error:', error);
    
    res.status(500).json({
      error: 'Failed to process webhook',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Unexpected server error', 
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 5020;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`
    Server running at:
    - http://${HOST}:${PORT}
    - Environment: ${process.env.NODE_ENV || 'development'}
  `);
});