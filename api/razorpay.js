// Vercel Serverless Function for Razorpay API
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Route handling
  const { action } = req.query;

  try {
    if (action === 'create-order') {
      return await createOrder(req, res);
    } else if (action === 'verify-payment') {
      return await verifyPayment(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in Razorpay API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}

// Create Razorpay order
async function createOrder(req, res) {
  const { amount, currency, metadata } = req.body;
  
  // Validate required fields
  if (!amount || !currency) {
    return res.status(400).json({ success: false, message: 'Amount and currency are required' });
  }

  // Create an order
  const options = {
    amount: Math.round(amount), // amount in paise
    currency: currency,
    receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    notes: metadata || {}
  };

  try {
    const order = await razorpay.orders.create(options);
    
    return res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while creating order'
    });
  }
}

// Verify payment
async function verifyPayment(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'All payment details (order_id, payment_id, signature) are required'
    });
  }

  // Create the expected signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body)
    .digest('hex');

  // Check if the signatures match
  const isSignatureValid = expectedSignature === razorpay_signature;
  
  if (isSignatureValid) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature'
    });
  }
}