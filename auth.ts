import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { consumeLoginAttempt } from "@/lib/admin-rate-limit";
import { verifyAdminPassword } from "@/lib/admin-credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: process.env.NODE_ENV === "development" || process.env.VERCEL === "1" || process.env.AUTH_TRUST_HOST === "true",
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60, updateAge: 15 * 60 },
  providers: [Credentials({
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, request) {
      const username = typeof credentials.username === "string" ? credentials.username.trim() : "";
      const password = typeof credentials.password === "string" ? credentials.password : "";
      const configuredUsername = process.env.ADMIN_USERNAME?.trim();
      const configuredPassword = process.env.ADMIN_PASSWORD;
      const secret = process.env.AUTH_SECRET;
      const missingConfiguration = [
        !configuredUsername && "ADMIN_USERNAME",
        !configuredPassword && "ADMIN_PASSWORD",
        !secret && "AUTH_SECRET",
      ].filter((key): key is string => Boolean(key));
      if (missingConfiguration.length) {
        console.error("[admin-auth] login is not configured; missing environment variable names:", missingConfiguration.join(", "));
        return null;
      }
      if (!configuredUsername || !configuredPassword || !secret) return null;
      if (!username || !password) return null;

      const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      const ip = request.headers.get("x-real-ip") || forwarded || "unknown";
      const attempt = await consumeLoginAttempt(ip);
      if (attempt !== "allowed") {
        if (attempt === "limited") console.warn("[admin-auth] login attempt limit reached for this client.");
        if (attempt === "unavailable") console.error("[admin-auth] login denied because rate-limit storage is unavailable.");
        return null;
      }

      const passwordMatches = verifyAdminPassword(password, configuredPassword);
      if (username !== configuredUsername || !passwordMatches) {
        console.info("[admin-auth] credentials rejected.");
        return null;
      }
      return { id: "sangam-admin", name: "Sangam Parlour Admin", role: "admin" };
    },
  })],
  callbacks: {
    jwt({ token, user }) {
      if (user?.role === "admin") token.role = "admin";
      return token;
    },
    session({ session, token }) {
      if (session.user && token.role === "admin") session.user.role = "admin";
      return session;
    },
  },
});
