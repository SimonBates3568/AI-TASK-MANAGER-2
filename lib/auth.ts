// Lightweight auth helper.
// This file provides a small shim to get the current user id on the server.
// It's intentionally minimal so the app keeps working in development without
// NextAuth. To enable full auth, wire this up to NextAuth's getServerSession
// and return session.user.id (or your user id field).

import { NextRequest } from 'next/server';
import cookie from 'cookie';

/**
 * Try to get the current user id for server handlers.
 * - In dev, set DEV_USER_ID in .env to impersonate a user for local testing.
 * - When NextAuth is configured, replace the fallback with a call to
 *   getServerSession(...) and return session.user.id.
 */
export async function getCurrentUserId(req?: Request | NextRequest): Promise<string | null> {
  // 1) Developer convenience: if DEV_USER_ID is set, use it.
  if (process.env.DEV_USER_ID) return process.env.DEV_USER_ID;

  // 2) If a request is provided, try to read a dev cookie (set by the demo auth route).
  try {
    if (req) {
      const cookieHeader = (req as any).headers?.get ? (req as any).headers.get('cookie') : (req as any).headers?.cookie || null;
      if (cookieHeader) {
        const parsed = cookie.parse(cookieHeader || '');
        if (parsed.dev_user_id) return parsed.dev_user_id;
      }
    }
  } catch (e) {
    // ignore cookie parsing errors
  }

  // 3) If NextAuth is installed and configured, return the signed-in user's id.
  try {
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('./nextAuthOptions');
  const session = await getServerSession(authOptions as any);
    return (session as any)?.user?.id ?? null;
  } catch (e) {
    // Not configured or not installed — fall back to null
    return null;
  }
}
