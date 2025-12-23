import { PrismaClient } from '@prisma/client';

// Provide a singleton PrismaClient instance for the runtime. This mirrors lib/prisma.ts
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
