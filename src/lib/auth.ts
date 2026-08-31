import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
});

// Server-side auth helpers
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  const userRole = (session.user as { role: string }).role;
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Forbidden");
  }
  return session;
}

// Seed admin user
export async function seedAdminUser() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@mvmfox.com" },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        email: "admin@mvmfox.com",
        name: "MVM FOX Admin",
        passwordHash,
        role: "SUPER_ADMIN",
      },
    });
    console.log("✓ Admin user created: admin@mvmfox.com / admin123");
  }
}
