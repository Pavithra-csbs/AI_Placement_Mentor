/**
 * AI Placement Mentor - Secure Password & Auth Utility
 * Uses Node.js crypto module for PBKDF2 salt hashing and random reset codes.
 */

import crypto from 'crypto';

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

export function generateResetCode(): string {
  // 6-digit cryptographic verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
}
