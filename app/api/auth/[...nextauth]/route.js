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
    // ============================================================================================
    // PROVIDER NORMAL (NO PERMITE ADMINS)
    // ============================================================================================
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: { label: "Password", type: "password", placeholder: "Password" },
      },
      async authorize(credentials) {
        try {
          const userFound = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!userFound) throw new Error("User not found");

          // ❌ IMPEDIR QUE UN ADMIN ENTRE POR AQUI
          if (userFound.role === UserRole.ADMIN) {
            throw new Error("Unauthorized");
          }

          // ✅ VALIDAR QUE EL ROL DEL USUARIO COINCIDA CON EL ROL SOLICITADO
          if (credentials.role && userFound.role !== credentials.role) {
            throw new Error(`This account is registered as ${userFound.role.toLowerCase()}. Please select the correct login mode.`);
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            userFound.password
          );
          if (!isPasswordValid) throw new Error("Invalid password");

          return {
            id: userFound.id,
            name: userFound.name,
            email: userFound.email,
            image: userFound.image,
            role: userFound.role,
          };
        } catch (error) {
          console.error("Error in authorize:", error);
          throw error;
        }
      },
    }),

    // ============================================================================================
    // PROVIDER EXCLUSIVO ADMIN (NO EXPONE NAME/IMAGE)
    // ============================================================================================
    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const admin = await db.user.findUnique({
          where: { email: credentials.email },
        });

        // ❌ No existe o no es admin
        if (!admin || admin.role !== UserRole.ADMIN) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.password
        );
        if (!isPasswordValid) return null;

        // 🔒 NO devolvemos name ni image
        return {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        };
      },
    }),

    // ============================================================================================
    // GOOGLE PROVIDER (SE MANTIENE IGUAL)
    // ============================================================================================
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // --------------------------------------------------------------------------------------------
    // SIGN IN
    // --------------------------------------------------------------------------------------------
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          let userRole = UserRole.ARTIST;

          let dbUser = await db.user.findUnique({
            where: { email: user.email },
            include: { accounts: true },
          });

          if (!dbUser) {
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

            userRole = dbUser.role;
          }

          user.id = dbUser.id;
          user.role = userRole;

          return true;
        }
      } catch (error) {
        console.error("Error in signIn:", error);
        return false;
      }

      return true;
    },

    // --------------------------------------------------------------------------------------------
    // REDIRECT
    // --------------------------------------------------------------------------------------------
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

    // --------------------------------------------------------------------------------------------
    // JWT
    // --------------------------------------------------------------------------------------------
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // --------------------------------------------------------------------------------------------
    // SESSION
    // --------------------------------------------------------------------------------------------
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      if (token?.role) {
        session.user.role = token.role;
      }

      // Siempre traer el rol más actualizado
      if (session.user.email) {
        const dbUser = await db.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          session.user.role = dbUser.role;
        }
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
