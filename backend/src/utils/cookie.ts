import { CookieOptions } from 'express';

/**
 * Industry-standard cookie configuration for cross-origin authentication
 *
 * Key requirements for cross-origin cookies:
 * 1. sameSite: 'none' - Required for cross-origin requests
 * 2. secure: true - Required when sameSite is 'none' (HTTPS only)
 * 3. httpOnly: true - Prevents XSS attacks from accessing the cookie
 * 4. path: '/' - Cookie available for all routes
 */

const isProduction = process.env.NODE_ENV === 'production';

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction, // Must be true in production for sameSite: 'none'
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const CLEAR_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

export const COOKIE_NAMES = {
  REFRESH_TOKEN: 'refreshToken',
} as const;
