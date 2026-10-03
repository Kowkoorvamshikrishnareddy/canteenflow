import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';

const router = Router();

// Lookup order by token for pickup counter
router.get('/verify', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const token = req.query.token as string;
  if (!token) {
    return res.status(400).json({ error: 'TOKEN_REQUIRED', message: 'Pickup token is required' });
  }

  const order = db.getOrderByToken(token);
  if (!order) {
    return res.status(404).json({
      error: 'ORDER_NOT_FOUND',
      message: `No active order found with token "${token}"`,
    });
  }

  res.json({
    found: true,
    order,
    isReady: order.status === 'READY',
    isCollected: order.status === 'COLLECTED',
  });
});

// Mark order as collected at the counter
router.post('/collect', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'ORDER_ID_REQUIRED' });
  }

  const order = db.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({ error: 'ORDER_NOT_FOUND' });
  }

  if (order.status === 'COLLECTED') {
    return res.status(400).json({ error: 'ALREADY_COLLECTED', message: 'Order has already been collected' });
  }

  try {
    const actor = req.user ? { id: req.user.id, name: req.user.fullName } : undefined;
    const updated = db.updateOrderStatus(orderId, 'COLLECTED', actor, 'Counter pickup verified');

    res.json({
      message: `Order ${order.orderNumber} successfully marked as collected!`,
      order: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'COLLECTION_FAILED', message: err.message });
  }
});

export default router;
