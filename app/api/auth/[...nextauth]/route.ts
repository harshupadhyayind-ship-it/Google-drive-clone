import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "user";
    } & DefaultSession["user"];
  }

  interface User {
    role: "admin" | "user";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "user";
  }
}

export const { handlers, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
       if (!credentials) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        if (email === "admin@mail.com" && password === "123") {
          return {
            id: "1",
            name: "Admin",
            email: "admin@mail.com",
            role: "admin",
          };
        }

        if (
          credentials.email === "user@mail.com" &&
          credentials.password === "123"
        ) {
          return {
            id: "2",
            name: "User",
            email: "user@mail.com",
            role: "user",
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // 👈 store role
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;