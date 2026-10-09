"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form className="admin-login-form" action={action}>
      <label htmlFor="admin-username">USERNAME</label>
      <input id="admin-username" name="username" type="text" autoComplete="username" required maxLength={80} />
      <label htmlFor="admin-password">PASSWORD</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200} />
      {state.error && <p className="admin-login-error" role="alert">{state.error}</p>}
      <button className="admin-login-submit" type="submit" disabled={pending}>{pending ? "SIGNING IN…" : "SIGN IN"}<span aria-hidden="true">↗</span></button>
    </form>
  );
}
