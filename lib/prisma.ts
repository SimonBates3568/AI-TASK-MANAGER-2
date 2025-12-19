import { PrismaClient } from '@prisma/client';

declare global {
  // allow global prisma during dev to avoid connection limits
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Use globalThis for better compatibility with TypeScript environments
export const prisma = (globalThis as any).prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') (globalThis as any).prisma = prisma;
