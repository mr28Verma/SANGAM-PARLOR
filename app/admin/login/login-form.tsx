"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form className="admin-login-form" action={action} aria-busy={pending}>
      <label htmlFor="admin-username">USERNAME</label>
      <input id="admin-username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={80} aria-describedby="admin-username-help" />
      <span className="admin-login-field-help" id="admin-username-help">Use the admin username configured for this salon.</span>
      <label htmlFor="admin-password">PASSWORD</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200} />
      {state.error && <p className="admin-login-error" role="alert" aria-live="assertive">{state.error}</p>}
      <button className="admin-login-submit" type="submit" disabled={pending} aria-busy={pending}>
        <span className="admin-login-submit-label">{pending ? "SIGNING IN" : "SIGN IN"}</span>
        {pending ? <span className="admin-login-spinner" aria-hidden="true" /> : <span className="admin-login-submit-arrow" aria-hidden="true">&gt;</span>}
      </button>
    </form>
  );
}
