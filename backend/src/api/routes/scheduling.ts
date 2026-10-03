import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

// Get pickup slots for a canteen with remaining capacity
router.get('/slots', (req: AuthenticatedRequest, res: Response) => {
  const canteenId = (req.query.canteenId as string) || req.user?.canteenId || '22222222-2222-2222-2222-222222222222';
  
  // Refresh slots to ensure upcoming slots exist relative to now
  db.refreshPickupSlots(canteenId);

  const slots = db.getPickupSlots(canteenId).map((s) => ({
    ...s,
    availableRemaining: Math.max(0, s.capacity - s.reservedCount),
    isFull: s.reservedCount >= s.capacity,
  }));

  res.json({
    canteenId,
    slots,
  });
});

export default router;
