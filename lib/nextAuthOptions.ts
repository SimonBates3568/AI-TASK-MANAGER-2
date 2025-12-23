import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma.js';

export const authOptions: any = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    GitHubProvider({ clientId: process.env.GITHUB_ID || '', clientSecret: process.env.GITHUB_SECRET || '' }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) session.user.id = user.id;
      return session;
    }
  }
};
