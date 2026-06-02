"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { passwordSigninAction, type AuthFormState } from "@/app/actions/auth";

export function SigninForm({
  locale,
  callbackUrl,
  urlError,
}: {
  locale: "it" | "en";
  callbackUrl?: string;
  urlError?: string;
}) {
  const isIt = locale === "it";
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    passwordSigninAction,
    {},
  );

  return (
    <div className="mt-8">
      {urlError && (
        <p className="mb-4 text-sm text-red-600">
          {isIt ? "Errore di accesso." : "Sign-in error."}
        </p>
      )}

      <form action={action} className="space-y-3">
        <input type="hidden" name="locale" value={locale} />
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={state.values?.email ?? ""}
        />
        <Input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
        />
        <details className="text-xs text-neutral-500">
          <summary className="cursor-pointer">
            {isIt ? "Codice 2FA (se attivato)" : "2FA code (if enabled)"}
          </summary>
          <Input
            name="totp"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            className="mt-2"
          />
        </details>
        <Button type="submit" disabled={pending} className="w-full">
          {pending
            ? isIt
              ? "Accesso…"
              : "Signing in…"
            : isIt
              ? "Accedi"
              : "Sign in"}
        </Button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </div>
  );
}
