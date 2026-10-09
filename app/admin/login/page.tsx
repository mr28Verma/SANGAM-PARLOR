import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login | Sangam Parlour", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "admin") redirect("/admin");
  return (
    <main className="admin-login-page">
      <Link className="admin-login-brand" href="/">SANGAM <span>PARLOUR</span></Link>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <p className="admin-eyebrow">PRIVATE SALON PORTAL</p>
        <h1 id="admin-login-title">Welcome back.</h1>
        <p className="admin-login-intro">Sign in to manage appointment requests.</p>
        <LoginForm />
        <Link className="admin-back-link" href="/">Return to Sangam Parlour <span aria-hidden="true">↗</span></Link>
      </section>
      <p className="admin-login-caption">SANGAM PARLOUR <span>·</span> OWNER ACCESS</p>
    </main>
  );
}
