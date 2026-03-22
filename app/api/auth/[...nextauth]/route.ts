export const runtime = "nodejs";

import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    // 🔐 Credentials Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        await connectDB();

        const user = await User.findOne({ email });
        if (!user) return null;

        // ❗ block google-only users
        if (!user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    // 🌐 Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      // 🔥 Create user if Google login
      if (account?.provider === "google") {
        await connectDB();

        const existing = await User.findOne({ email: user.email });

        if (!existing) {
          await User.create({
            name: user.name,
            email: user.email,
            password: "", // no password for google users
            role: "user",
          });
        }
      }

      return true;
    },

    async jwt({ token, user }: any) {
      if (user) {
        await connectDB();

        const dbUser = await User.findOne({ email: user.email });

        token.id = dbUser?._id.toString();
        token.role = dbUser?.role || "user";
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt" as const,
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };