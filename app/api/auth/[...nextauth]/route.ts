import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { NextAuthOptions } from 'next-auth';

// Настройка аутентификации
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        login: { label: 'Login', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { login: credentials.login },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password, 
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id.toString(), // Убедитесь, что id строка
          login: user.login,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.login = user.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          login: token.login as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin', // Укажите свою страницу входа
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
