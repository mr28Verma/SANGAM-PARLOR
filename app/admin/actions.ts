"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginState = { error: string };

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get("username");
  const password = formData.get("password");
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    return { error: "Username or password is incorrect." };
  }
  try {
    await signIn("credentials", { username, password, redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Username or password is incorrect." };
    throw error;
  }
  return { error: "Username or password is incorrect." };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
