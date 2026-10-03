import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';

const router = Router();

// Get College Operational Analytics (Admin only)
router.get('/', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const collegeId = req.user?.collegeId || '11111111-1111-1111-1111-111111111111';
  const analytics = db.getAnalytics(collegeId);

  res.json({
    collegeId,
    timestamp: new Date().toISOString(),
    isLiveMetrics: true,
    analytics,
  });
});

export default router;
