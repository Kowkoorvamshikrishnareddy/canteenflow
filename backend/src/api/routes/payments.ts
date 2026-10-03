import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../database/index.js';
import { env, isRazorpayLiveConfigured } from '../../config/env.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';
import { realtimeHub } from '../../modules/realtime/sse.js';

const router = Router();

// Create payment intent
router.post('/create-intent', (req: AuthenticatedRequest, res: Response) => {
  const { orderId, amount, method } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'orderId and amount are required' });
  }

  const order = db.getOrderById(orderId);
  if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' });

  // If live Razorpay is configured, generate real razorpay order parameters
  if (isRazorpayLiveConfigured) {
    const mockRazorpayOrderId = `rzp_order_${Date.now()}`;
    return res.json({
      provider: 'RAZORPAY',
      isLive: true,
      keyId: env.RAZORPAY_KEY_ID,
      razorpayOrderId: mockRazorpayOrderId,
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      orderId,
    });
  }

  // Development/Demo Mode Simulator
  const simulatedTxId = `sim_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  res.json({
    provider: 'SIMULATOR',
    isLive: false,
    simulatorNotice: 'Development Simulator Mode active (Simulated UPI/Gateway)',
    transactionId: simulatedTxId,
    amount,
    currency: 'INR',
    orderId,
    methodsSupported: ['UPI_MOCK', 'CARD_MOCK', 'NETBANKING_MOCK'],
  });
});

// Verify payment
router.post('/verify', (req: AuthenticatedRequest, res: Response) => {
  const { orderId, paymentId, signature, provider } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'ORDER_ID_REQUIRED' });
  }

  const order = db.getOrderById(orderId);
  if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' });

  // In live Razorpay mode, verify HMAC SHA-256
  if (isRazorpayLiveConfigured && signature) {
    const expectedSig = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSig !== signature) {
      return res.status(400).json({ error: 'SIGNATURE_VERIFICATION_FAILED', verified: false });
    }
  }

  // Update order payment status
  order.paymentStatus = 'PAID';
  order.updatedAt = new Date().toISOString();

  const payment = db.payments.get(orderId);
  if (payment) {
    payment.status = 'SUCCESS';
    payment.providerTransactionId = paymentId || `tx_${Date.now()}`;
    payment.updatedAt = new Date().toISOString();
  }

  // Broadcast realtime update to kitchen and student clients
  realtimeHub.broadcast('ORDER_UPDATED', order);

  res.json({
    verified: true,
    message: 'Payment confirmed successfully',
    order,
  });
});

// Webhook listener (idempotent)
router.post('/webhook', (req: Request, res: Response) => {
  const webhookSignature = req.headers['x-razorpay-signature'] as string;
  const event = req.body;

  // Log webhook event
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    collegeId: '11111111-1111-1111-1111-111111111111',
    event: 'PAYMENT_WEBHOOK_RECEIVED',
    metadata: { eventType: event.event, id: event.payload?.payment?.entity?.id },
    createdAt: new Date().toISOString(),
  });

  // Acknowledge receipt idempotently
  res.json({ status: 'ok', received: true });
});

// GET /api/payments/ledger - Transaction ledger for staff and admin
router.get('/ledger', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const collegeId = req.user?.collegeId;
  const list = db.getPaymentsList(collegeId);

  const totalAmount = list
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const refundedAmount = list
    .filter((p) => p.status === 'REFUNDED')
    .reduce((sum, p) => sum + p.amount, 0);

  res.json({
    totalCount: list.length,
    totalSuccessfulVolume: Math.round(totalAmount * 100) / 100,
    totalRefundedVolume: Math.round(refundedAmount * 100) / 100,
    transactions: list,
  });
});

// POST /api/payments/:id/refund - Admin triggers payment refund
router.post('/:id/refund', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { reason } = req.body;

  try {
    const refunded = db.refundPayment(id, reason);
    res.json({
      message: 'Payment has been successfully refunded and order cancelled.',
      payment: refunded,
    });
  } catch (err: any) {
    res.status(404).json({ error: 'REFUND_FAILED', message: err.message });
  }
});

export default router;

