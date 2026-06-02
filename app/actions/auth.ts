"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { signIn, createUserWithPassword } from "@/lib/auth";

const Signup = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200),
  locale: z.enum(["it", "en"]).default("it"),
});

export type AuthFormState = { error?: string; values?: Record<string, string> };

export async function signupAction(
  _prev: AuthFormState,
  fd: FormData,
): Promise<AuthFormState> {
  const raw = {
    name: String(fd.get("name") ?? ""),
    email: String(fd.get("email") ?? ""),
    password: String(fd.get("password") ?? ""),
    locale: String(fd.get("locale") ?? "it"),
  };
  const parsed = Signup.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      values: { name: raw.name, email: raw.email },
    };
  }
  const { name, email, password, locale } = parsed.data;

  try {
    await createUserWithPassword({ name, email, password });
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === "email-taken") {
      return {
        error: locale === "it" ? "Email non disponibile." : "Email not available.",
        values: { name, email },
      };
    }
    return {
      error: locale === "it" ? "Errore durante la registrazione." : "Signup failed.",
      values: { name, email },
    };
  }

  await signIn("credentials", {
    email,
    password,
    redirect: true,
    redirectTo: `/${locale}/account`,
  });
  redirect(`/${locale}/account`);
}

export async function passwordSigninAction(
  _prev: AuthFormState,
  fd: FormData,
): Promise<AuthFormState> {
  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  const password = String(fd.get("password") ?? "");
  const totp = String(fd.get("totp") ?? "");
  const locale = String(fd.get("locale") ?? "it");
  const callbackUrl = String(fd.get("callbackUrl") ?? `/${locale}/account`);

  if (!email || !password) {
    return {
      error: locale === "it" ? "Email e password richieste." : "Email and password required.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      totp,
      redirect: true,
      redirectTo: callbackUrl,
    });
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw e;
    return {
      error: locale === "it" ? "Email o password non corrette." : "Incorrect email or password.",
      values: { email },
    };
  }
  redirect(callbackUrl);
}
