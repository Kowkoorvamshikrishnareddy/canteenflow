import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';

const router = Router();

// Get current college & canteen configuration
router.get('/current', (req: AuthenticatedRequest, res: Response) => {
  const collegeId = req.user?.collegeId || '11111111-1111-1111-1111-111111111111';
  const college = db.colleges.get(collegeId);
  const canteens = Array.from(db.canteens.values()).filter((c) => c.collegeId === collegeId);

  if (!college) {
    return res.status(404).json({ error: 'COLLEGE_NOT_FOUND' });
  }

  res.json({
    college,
    canteens,
    activeCanteen: canteens[0] || null,
  });
});

// Update college settings (Admin only)
router.put('/current', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const collegeId = req.user!.collegeId;
  const college = db.colleges.get(collegeId);
  if (!college) return res.status(404).json({ error: 'COLLEGE_NOT_FOUND' });

  const { name, settings } = req.body;
  if (name) college.name = name;
  if (settings) {
    college.settings = { ...college.settings, ...settings };
  }

  res.json({ message: 'College settings updated', college });
});

// Update canteen operating hours or settings (Staff or Admin)
router.put('/canteen/:id', requireRole(['staff', 'admin']), (req: AuthenticatedRequest, res: Response) => {
  const canteen = db.canteens.get(String(req.params.id));
  if (!canteen) return res.status(404).json({ error: 'CANTEEN_NOT_FOUND' });

  const { operatingHours, settings, isActive } = req.body;
  if (operatingHours) canteen.operatingHours = { ...canteen.operatingHours, ...operatingHours };
  if (settings) canteen.settings = { ...canteen.settings, ...settings };
  if (isActive !== undefined) canteen.isActive = isActive;

  res.json({ message: 'Canteen settings updated', canteen });
});

export default router;
