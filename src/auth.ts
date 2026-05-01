import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

function authSecret(): string {
  const fromEnv =
    process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Set AUTH_SECRET (or NEXTAUTH_SECRET) in the environment for production.",
    );
  }
  return "nadee-textile-dev-only-auth-secret-min-32-chars-do-not-use-in-prod";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret(),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        await connectDB();
        const email = String(credentials.email).toLowerCase().trim();
        const user = await User.findOne({ email }).lean();
        if (!user?.passwordHash) {
          return null;
        }
        const ok = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash,
        );
        if (!ok) {
          return null;
        }
        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        if (user.id) {
          token.sub = user.id;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? "";
        session.user.role = (token.role as "user" | "admin") ?? "user";
      }
      return session;
    },
  },
});
