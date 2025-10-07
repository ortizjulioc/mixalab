import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import db from "@/utils/lib/prisma";
import bcrypt from "bcrypt";
import { UserStatus, UserRole } from "@prisma/client";

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    // --- Provider de credenciales ------------------------------------------------------------------
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials) {
        const userFound = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!userFound) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(credentials.password, userFound.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        return {
          id: userFound.id,
          name: userFound.name,
          email: userFound.email,
          image: userFound.image,
        };
      },
    }),

    // --- Provider de Google ------------------------------------------------------------------------
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // 🔹 SIGN IN -----------------------------------------------------------------------------------
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Valor por defecto
        let userRole = UserRole.ARTIST;

        // Verificar si ya existe en la BD
        let dbUser = await db.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (!dbUser) {
          // Crear usuario nuevo
          dbUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: userRole,
              isVerified: true,
              status: UserStatus.ACTIVE,
              accounts: {
                create: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                },
              },
            },
            include: { accounts: true },
          });
        } else {
          // Si ya existe, asegurarse de que tenga la cuenta de Google registrada
          const existingAccount = dbUser.accounts.find(
            (a) =>
              a.provider === account.provider &&
              a.providerAccountId === account.providerAccountId
          );

          if (!existingAccount) {
            await db.account.create({
              data: {
                userId: dbUser.id,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
              },
            });
          }
        }

        return true;
      }

      return true;
    },

    // 🔹 REDIRECT -----------------------------------------------------------------------------------
    async redirect({ url, baseUrl }) {
      try {
        const parsedUrl = new URL(url, baseUrl);
        const role = parsedUrl.searchParams.get("role");

        if (role) {
          return `${baseUrl}/api/auth/finalize?role=${role}`;
        }

        return baseUrl;
      } catch {
        return baseUrl;
      }
    },

    // 🔹 JWT ----------------------------------------------------------------------------------------
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // 🔹 SESSION ------------------------------------------------------------------------------------
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
