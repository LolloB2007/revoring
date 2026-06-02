"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signupAction, type AuthFormState } from "@/app/actions/auth";

export function SignupForm({ locale }: { locale: "it" | "en" }) {
  const isIt = locale === "it";
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signupAction, {});

  return (
    <form action={action} className="mt-8 space-y-3">
      <input type="hidden" name="locale" value={locale} />
      <Input
        name="name"
        required
        autoComplete="name"
        placeholder={isIt ? "Nome" : "Name"}
        defaultValue={state.values?.name ?? ""}
      />
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
        autoComplete="new-password"
        minLength={10}
        placeholder={isIt ? "Password (min 10 caratteri)" : "Password (10+ chars)"}
      />
      <p className="text-xs text-neutral-500">
        {isIt
          ? "Almeno 10 caratteri, una maiuscola, una minuscola e un numero."
          : "At least 10 characters, with one uppercase, one lowercase, and one number."}
      </p>
      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? isIt
            ? "Creazione…"
            : "Creating…"
          : isIt
            ? "Crea account"
            : "Create account"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <p className="text-xs text-neutral-500">
        {isIt ? "Registrandoti accetti i nostri " : "By signing up you accept our "}
        <a href={`/${locale}/legal/terms`} className="underline underline-offset-4">
          {isIt ? "Termini di vendita" : "Terms"}
        </a>
        {isIt ? " e l'" : " and "}
        <a href={`/${locale}/legal/privacy`} className="underline underline-offset-4">
          {isIt ? "Informativa privacy" : "Privacy policy"}
        </a>
        .
      </p>
    </form>
  );
}
