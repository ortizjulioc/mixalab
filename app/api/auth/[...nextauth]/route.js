import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import db from "@/utils/lib/prisma";
import bcrypt from "bcrypt";
import { UserStatus } from "@/app/generated/prisma";

export const authOptions = {
  providers: [
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

    // --- Google Provider ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Verificar si ya existe en BD
        let dbUser = await db.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (!dbUser) {
          // Crear usuario y cuenta en la misma transacción
          dbUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
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
          // Si ya existe el User pero no la Account -> crearla
          const existingAccount = dbUser.accounts.find(
            (a) => a.provider === account.provider && a.providerAccountId === account.providerAccountId
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

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
