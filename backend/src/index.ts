import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { env, isLiveSupabaseConfigured, isRazorpayLiveConfigured } from './config/env.js';
import { logger } from './utils/logger.js';
import { authMiddleware } from './middleware/auth.js';
import { realtimeHub } from './modules/realtime/sse.js';

// Route imports
import authRoutes from './api/routes/auth.js';
import collegeRoutes from './api/routes/colleges.js';
import menuRoutes from './api/routes/menu.js';
import inventoryRoutes from './api/routes/inventory.js';
import schedulingRoutes from './api/routes/scheduling.js';
import orderRoutes from './api/routes/orders.js';
import pickupRoutes from './api/routes/pickup.js';
import paymentRoutes from './api/routes/payments.js';
import analyticsRoutes from './api/routes/analytics.js';
import userRoutes from './api/routes/users.js';
import auditRoutes from './api/routes/audit.js';
import feedbackRoutes from './api/routes/feedback.js';
import realtimeRoutes from './api/routes/realtime.js';

const app = express();

// Enable reverse proxy trust in production (Render, Vercel, Railway, AWS)
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);

  // Enforce HTTPS redirection in production
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Permit frontend dynamic styling & inline assets
    crossOriginEmbedderPolicy: false,
    hsts: env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  })
);

// CORS for Frontend
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  })
);

// Body Parsers & Cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.SESSION_SECRET));

// Request Tracking Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = uuidv4().slice(0, 8);
  (req as any).requestId = requestId;
  res.setHeader('X-CanteenFlow-Request-Id', requestId);
  next();
});

// Global Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. System throttling active.' },
});
app.use('/api/', apiLimiter);

// Health Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    platform: 'CanteenFlow',
    version: '1.0.0',
    mode: isLiveSupabaseConfigured ? 'LIVE_DATABASE' : 'DEVELOPMENT_DEMO',
    supabaseConnected: isLiveSupabaseConfigured,
    razorpayConfigured: isRazorpayLiveConfigured,
    activeRealtimeConnections: realtimeHub.getConnectedCount(),
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Authentication middleware applied globally to /api
app.use('/api', authMiddleware);

// Mount Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/realtime', realtimeRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'ENDPOINT_NOT_FOUND',
    message: `CanteenFlow API endpoint [${req.method} ${req.path}] not recognized.`,
  });
});

// Central Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || 'sys';
  logger.error(`Unhandled Exception [${requestId}]:`, err);

  res.status(err.status || 500).json({
    error: 'SYSTEM_ERROR',
    message: err.message || 'An internal system error occurred.',
    requestId,
  });
});

// Start Server (Only when running standalone server, not inside Vercel serverless functions)
if (process.env.VERCEL !== '1') {
  app.listen(env.PORT, () => {
    logger.info(`══════════════════════════════════════════════════════════`);
    logger.info(`  CANTEENFLOW // SMART CAMPUS CANTEEN PLATFORM          `);
    logger.info(`  PORT:        ${env.PORT} | NODE_ENV: ${env.NODE_ENV}   `);
    logger.info(`  MODE:        ${isLiveSupabaseConfigured ? 'LIVE SUPABASE ✓' : 'DEV/DEMO MODE (Sandbox) 🚀'} `);
    logger.info(`  RAZORPAY:    ${isRazorpayLiveConfigured ? 'LIVE GATEWAY ✓' : 'SIMULATOR MODE 💳'} `);
    logger.info(`  CLIENT URL:  ${env.CLIENT_URL}                         `);
    logger.info(`══════════════════════════════════════════════════════════`);
  });
}

export default app;
