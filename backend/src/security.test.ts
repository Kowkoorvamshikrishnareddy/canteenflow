import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { env } from './config/env.js';
import { requireRole, authMiddleware, AuthenticatedRequest } from './middleware/auth.js';
import { db } from './database/index.js';

describe('CanteenFlow Security & Access Control Suite', () => {
  const studentId = '55555555-5555-5555-5555-555555555555';
  const staffId = '44444444-4444-4444-4444-444444444444';
  const adminId = '33333333-3333-3333-3333-333333333333';

  it('SEC-1: generates and cryptographically verifies valid JWTs with secret', () => {
    const payload = { sub: studentId, email: 'aarav@cambridge.edu', role: 'student' };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    expect(decoded.sub).toBe(studentId);
    expect(decoded.role).toBe('student');
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it('SEC-2: strictly rejects forged or tampered JWT signatures', () => {
    const maliciousSecret = 'attacker_compromised_secret_key_999';
    const fakeToken = jwt.sign({ sub: adminId, role: 'admin' }, maliciousSecret);

    expect(() => {
      jwt.verify(fakeToken, env.JWT_SECRET);
    }).toThrow();
  });

  it('SEC-3: requireRole middleware permits authorized roles', () => {
    const middleware = requireRole(['staff', 'admin']);
    const req = { user: db.profiles.get(staffId) } as AuthenticatedRequest;
    let nextCalled = false;
    const res = {
      status: () => ({ json: () => {} }),
    } as any;

    middleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
  });

  it('SEC-4: requireRole middleware returns 403 Forbidden for insufficient permissions', () => {
    const middleware = requireRole('admin');
    const req = { user: db.profiles.get(studentId) } as AuthenticatedRequest;
    let statusReturned = 0;
    let jsonBody: any = null;

    const res = {
      status: (code: number) => {
        statusReturned = code;
        return {
          json: (body: any) => {
            jsonBody = body;
          },
        };
      },
    } as any;

    middleware(req, res, () => {});

    expect(statusReturned).toBe(403);
    expect(jsonBody?.error).toBe('FORBIDDEN');
  });

  it('SEC-5: requireRole middleware returns 401 Unauthorized for unauthenticated requests', () => {
    const middleware = requireRole('admin');
    const req = {} as AuthenticatedRequest;
    let statusReturned = 0;
    let jsonBody: any = null;

    const res = {
      status: (code: number) => {
        statusReturned = code;
        return {
          json: (body: any) => {
            jsonBody = body;
          },
        };
      },
    } as any;

    middleware(req, res, () => {});

    expect(statusReturned).toBe(401);
    expect(jsonBody?.error).toBe('UNAUTHORIZED');
  });

  it('SEC-6: authMiddleware successfully authenticates valid Bearer JWT', () => {
    const token = jwt.sign({ sub: adminId, role: 'admin' }, env.JWT_SECRET);
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as any;

    let nextCalled = false;
    authMiddleware(req, {} as any, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user?.id).toBe(adminId);
    expect(req.user?.role).toBe('admin');
  });
});
