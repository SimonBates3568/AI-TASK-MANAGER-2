import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/nextAuthOptions';

// Ensure this route runs on the Node runtime — the Prisma adapter requires Node.
export const runtime = 'nodejs';

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
