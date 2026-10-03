import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';

const router = Router();

// Get Audit Trail (Admin only)
router.get('/', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const collegeId = req.user?.collegeId || '11111111-1111-1111-1111-111111111111';
  const logs = db.getAuditLogs(collegeId);
  res.json({
    logs,
    count: logs.length,
  });
});

export default router;
