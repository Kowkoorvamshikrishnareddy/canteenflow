import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';
import { OrderStatus, OrderType } from '../../shared/types.js';

const router = Router();

// Get orders
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role || 'student';
  const canteenId = req.user?.canteenId || '22222222-2222-2222-2222-222222222222';
  const status = req.query.status as OrderStatus | undefined;

  let orders;
  if (role === 'student') {
    orders = db.getOrders({ userId: req.user?.id, status });
  } else {
    // Staff & Admin see live canteen queue
    orders = db.getOrders({ canteenId, status });
  }

  res.json({
    orders,
    count: orders.length,
  });
});

// Get single order
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const orderId = String(req.params.id);
  const order = db.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found' });
  }

  // Security check: student can only view own order
  if (req.user?.role === 'student' && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Cannot inspect another student\'s order' });
  }

  res.json(order);
});

// Place new order (Immediate or Scheduled)
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  const {
    collegeId,
    canteenId,
    orderType,
    items,
    paymentMethod,
    pickupSlotId,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'EMPTY_CART', message: 'Cannot place an empty order' });
  }

  try {
    const method = paymentMethod || 'UPI';
    const initialPaymentStatus = method === 'CASH' ? 'CASH_DUE' : (req.body.paymentStatus || 'PENDING');

    const order = db.createOrder({
      collegeId: collegeId || req.user?.collegeId || '11111111-1111-1111-1111-111111111111',
      canteenId: canteenId || req.user?.canteenId || '22222222-2222-2222-2222-222222222222',
      userId: req.user?.id || '55555555-5555-5555-5555-555555555555',
      userName: req.user?.fullName || 'Student',
      orderType: (orderType as OrderType) || 'IMMEDIATE',
      items,
      paymentMethod: method,
      paymentStatus: initialPaymentStatus,
      pickupSlotId,
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'ORDER_CREATION_FAILED',
      message: err.message,
    });
  }
});

// Update order status (Staff & Admin action)
router.post('/:id/status', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { status, reason } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'STATUS_REQUIRED' });
  }

  try {
    const orderId = String(req.params.id);
    const actor = req.user ? { id: req.user.id, name: req.user.fullName } : undefined;
    const updatedOrder = db.updateOrderStatus(orderId, status as OrderStatus, actor, reason);

    res.json({
      message: `Order transitioned to ${status}`,
      order: updatedOrder,
    });
  } catch (err: any) {
    res.status(400).json({
      error: 'TRANSITION_FAILED',
      message: err.message,
    });
  }
});

// Cancel order (Student or Staff)
router.post('/:id/cancel', (req: AuthenticatedRequest, res: Response) => {
  const orderId = String(req.params.id);
  const order = db.getOrderById(orderId);
  if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' });

  // Students can only cancel if not already preparing or collected
  if (req.user?.role === 'student') {
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    if (['PREPARING', 'READY', 'COLLECTED'].includes(order.status)) {
      return res.status(400).json({
        error: 'CANCELLATION_DISALLOWED',
        message: 'Order has already begun preparation or is ready. Cannot cancel.',
      });
    }
  }

  try {
    const updated = db.updateOrderStatus(
      orderId,
      'CANCELLED',
      req.user ? { id: req.user.id, name: req.user.fullName } : undefined,
      req.body.reason || 'User cancelled'
    );
    res.json({ message: 'Order cancelled successfully', order: updated });
  } catch (err: any) {
    res.status(400).json({ error: 'CANCEL_FAILED', message: err.message });
  }
});

export default router;
