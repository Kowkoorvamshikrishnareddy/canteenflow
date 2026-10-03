import { Router, Response } from 'express';
import { db } from '../../database/index.js';
import { AuthenticatedRequest, requireRole } from '../../middleware/auth.js';
import { UserRole } from '../../shared/types.js';

const router = Router();

// List users (Admin only)
router.get('/', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const users = Array.from(db.profiles.values());
  res.json({
    users,
    count: users.length,
  });
});

// Update user role (Admin only)
router.put('/:id/role', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  const validRoles: UserRole[] = ['student', 'staff', 'admin'];

  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'INVALID_ROLE', message: 'Valid roles: student, staff, admin' });
  }

  const user = db.profiles.get(String(req.params.id));
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

  // Prevent admin from locking out self
  if (req.user?.id === user.id && role !== 'admin') {
    return res.status(400).json({ error: 'CANNOT_DEMOTE_SELF', message: 'You cannot remove your own admin access' });
  }

  user.role = role;
  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    collegeId: user.collegeId,
    actorId: req.user?.id,
    actorName: req.user?.fullName,
    event: 'USER_ROLE_CHANGED',
    metadata: { targetUserId: user.id, targetEmail: user.email, newRole: role },
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: `Updated ${user.fullName}'s role to ${role}`,
    user,
  });
});

export default router;
