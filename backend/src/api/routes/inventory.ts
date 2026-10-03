import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';

const router = Router();

// Get inventory overview (Staff & Admin)
router.get('/', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const canteenId = req.user?.canteenId || '22222222-2222-2222-2222-222222222222';
  const inventory = db.getInventory(canteenId);
  res.json({
    canteenId,
    inventory,
    lowStockCount: inventory.filter((i) => i.isLowStock).length,
  });
});

// Adjust stock (Staff & Admin)
router.post('/adjust', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const { menuItemId, changeQty, reason } = req.body;

  if (!menuItemId || changeQty === undefined) {
    return res.status(400).json({ error: 'MISSING_FIELDS', message: 'menuItemId and changeQty are required' });
  }

  try {
    const updated = db.adjustInventory(menuItemId, Number(changeQty), reason || 'Manual Adjustment', req.user?.id);
    res.json({
      message: 'Stock updated successfully',
      inventory: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'STOCK_ADJUSTMENT_FAILED', message: err.message });
  }
});

// Get stock movement history
router.get('/movements', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  res.json({
    movements: db.inventoryMovements.slice(-50).reverse(),
  });
});

export default router;
