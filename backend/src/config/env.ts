import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root or backend root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((v) => parseInt(v, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // JWT & Security
  JWT_SECRET: z.string().default('canteenflow_super_secret_jwt_key_2026'),
  SESSION_SECRET: z.string().default('canteenflow_session_secret_key_2026'),

  // Supabase (Optional for local/demo execution; required for live integration)
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  // Razorpay (Optional for sandbox/demo simulator)
  RAZORPAY_KEY_ID: z.string().optional().default(''),
  RAZORPAY_KEY_SECRET: z.string().optional().default(''),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : {
      PORT: parseInt(process.env.PORT || '5000', 10),
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
      JWT_SECRET: process.env.JWT_SECRET || 'canteenflow_super_secret_jwt_key_2026',
      SESSION_SECRET: process.env.SESSION_SECRET || 'canteenflow_session_secret_key_2026',
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    };

export const isLiveSupabaseConfigured = Boolean(
  env.SUPABASE_URL && env.SUPABASE_URL.startsWith('http') && env.SUPABASE_SERVICE_ROLE_KEY
);

export const isRazorpayLiveConfigured = Boolean(
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
);
