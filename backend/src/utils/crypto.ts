import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a consistent 32-byte key from the configured encryption key
 */
function getDerivedKey(): Buffer {
  return crypto.createHash('sha256').update(env.SESSION_SECRET).digest();
}

/**
 * Encrypts sensitive string data (e.g. OAuth refresh tokens) using AES-256-GCM
 */
export function encryptToken(text: string): string {
  if (!text) return '';
  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedContent
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts encrypted token string back to plain text
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return '';
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }

    const [ivHex, authTagHex, cipherText] = parts;
    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    throw new Error('Decryption failed');
  }
}
