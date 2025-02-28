// api/razorpay.js
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
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

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while creating order'
    });
  }
});

// Verify payment
router.post('/verify-payment', (req, res) => {
  try {
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
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Check if the signatures match
    const isSignatureValid = expectedSignature === razorpay_signature;
    
    if (isSignatureValid) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong while verifying payment'
    });
  }
});

module.exports = router;