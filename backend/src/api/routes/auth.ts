import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../database/index.js';
import { env } from '../../config/env.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router = Router();

// Get current session/profile
router.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'No active session' });
  }

  const college = db.colleges.get(req.user.collegeId);
  const canteen = req.user.canteenId ? db.canteens.get(req.user.canteenId) : undefined;

  res.json({
    user: req.user,
    college,
    canteen,
    demoMode: true,
  });
});

// Demo Persona Switcher (Allows instant testing of Student, Staff, and Admin workflows)
router.post('/demo-switch', (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.body;
  const validRoles = ['student', 'staff', 'admin'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'INVALID_ROLE', message: 'Valid roles: student, staff, admin' });
  }

  const targetProfile = Array.from(db.profiles.values()).find((p) => p.role === role);
  if (!targetProfile) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: `No demo profile for role: ${role}` });
  }

  const token = jwt.sign(
    {
      sub: targetProfile.id,
      email: targetProfile.email,
      role: targetProfile.role,
      collegeId: targetProfile.collegeId,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: `Switched active session to ${targetProfile.fullName} (${role})`,
    user: targetProfile,
    token,
  });
});

// Standard Login
router.post('/login', (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'EMAIL_REQUIRED', message: 'Email is required' });
  }

  const user = Array.from(db.profiles.values()).find(
    (p) => p.email.toLowerCase() === email.toLowerCase().trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    message: 'Login successful',
    user,
    token,
  });
});

// Logout
router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'Session closed successfully' });
});

export default router;
