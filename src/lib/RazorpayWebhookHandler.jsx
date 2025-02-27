import crypto from 'crypto';
import admin from 'firebase-admin';

// Webhook Event Types
const WEBHOOK_EVENTS = {
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_CREATED: 'refund.created',
  INVOICE_GENERATED: 'invoice.generated'
};

class RazorpayWebhookHandler {
  constructor(firestore, razorpayWebhookSecret) {
    this.firestore = firestore;
    this.webhookSecret = razorpayWebhookSecret;
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature, secret) {
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return generatedSignature === signature;
  }

  // Process different webhook events
  async processWebhookEvent(event) {
    switch (event.event) {
      case WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
        return this.handleSuccessfulPayment(event.payload);
      
      case WEBHOOK_EVENTS.PAYMENT_FAILED:
        return this.handleFailedPayment(event.payload);
      
      case WEBHOOK_EVENTS.REFUND_CREATED:
        return this.handleRefund(event.payload);
      
      default:
        console.warn('Unhandled webhook event:', event.event);
        return null;
    }
  }

  // Handle successful payment
  async handleSuccessfulPayment(payload) {
    const { order_id, payment_id } = payload;

    try {
      // Find the corresponding order in Firestore
      const orderQuery = await this.firestore
        .collection('orders')
        .where('razorpayOrderId', '==', order_id)
        .limit(1)
        .get();

      if (orderQuery.empty) {
        console.error('No matching order found for Razorpay order:', order_id);
        return null;
      }

      const orderDoc = orderQuery.docs[0];
      
      // Update order status
      await orderDoc.ref.update({
        status: 'paid',
        paymentStatus: 'completed',
        razorpayPaymentId: payment_id,
        paidAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log successful payment
      console.log('Payment processed successfully:', {
        orderId: orderDoc.id,
        razorpayOrderId: order_id
      });

      return orderDoc.id;
    } catch (error) {
      console.error('Error processing successful payment webhook:', error);
      throw error;
    }
  }

  // Handle payment failure
  async handleFailedPayment(payload) {
    const { order_id, payment_id, error_code, error_description } = payload;

    try {
      const orderQuery = await this.firestore
        .collection('orders')
        .where('razorpayOrderId', '==', order_id)
        .limit(1)
        .get();

      if (orderQuery.empty) {
        console.error('No matching order found for failed payment:', order_id);
        return null;
      }

      const orderDoc = orderQuery.docs[0];
      
      // Update order with failure details
      await orderDoc.ref.update({
        status: 'payment_failed',
        paymentStatus: 'failed',
        razorpayPaymentId: payment_id,
        paymentErrorCode: error_code,
        paymentErrorDescription: error_description,
        failedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.warn('Payment failed for order:', {
        orderId: orderDoc.id,
        errorCode: error_code,
        errorDescription: error_description
      });

      return orderDoc.id;
    } catch (error) {
      console.error('Error processing failed payment webhook:', error);
      throw error;
    }
  }

  // Handle refund
  async handleRefund(payload) {
    const { order_id, refund_id, amount } = payload;

    try {
      const orderQuery = await this.firestore
        .collection('orders')
        .where('razorpayOrderId', '==', order_id)
        .limit(1)
        .get();

      if (orderQuery.empty) {
        console.error('No matching order found for refund:', order_id);
        return null;
      }

      const orderDoc = orderQuery.docs[0];
      
      // Update order with refund details
      await orderDoc.ref.update({
        status: 'refunded',
        refundId: refund_id,
        refundAmount: amount / 100, // Convert paise to rupees
        refundedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('Refund processed:', {
        orderId: orderDoc.id,
        refundId: refund_id
      });

      return orderDoc.id;
    } catch (error) {
      console.error('Error processing refund webhook:', error);
      throw error;
    }
  }

 // Main webhook handler
async handleWebhook(rawBody, signature) {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(rawBody, signature, this.webhookSecret)) {
      throw new Error('Invalid webhook signature');
    }
  
    const event = JSON.parse(rawBody);
    return this.processWebhookEvent(event);
  }
}

export default RazorpayWebhookHandler;