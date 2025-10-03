import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/utils/lib/prisma";
import bcrypt from "bcrypt";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials, req) {
        console.log("Credentials:", credentials);

        const userFound = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        console.log("User found in authorize:", userFound);
        if (!userFound) return null;
        console.log("User found:", userFound);

       const isPasswordValid = await bcrypt.compare(credentials.password, userFound.password);
       if (!isPasswordValid) return null;

       return {
        id: userFound.id,
        name: userFound.name,
        email: userFound.email,
        image: userFound.image,
       };

      },
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
