"use client";

import { Loader2, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const next = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok || result.error) {
        setError(result.error ?? "Authentication failed.");
        return;
      }

      router.push(next);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-strong w-full max-w-md rounded-[28px] p-7">
      <div className="mb-6">
        <h1 className="text-[32px] font-semibold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">
          {mode === "login" ? "Continue tracking your writing progress." : "Start your private writing workspace."}
        </p>
      </div>

      <label className="block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <div className="liquid-input mt-2 flex h-12 items-center gap-2 rounded-full px-4">
        <Mail className="h-4 w-4 text-[hsl(var(--muted))]" />
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="focus-ring min-w-0 flex-1 bg-transparent text-sm outline-none"
          autoComplete="email"
        />
      </div>

      <label className="mt-5 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <div className="liquid-input mt-2 flex h-12 items-center gap-2 rounded-full px-4">
        <Lock className="h-4 w-4 text-[hsl(var(--muted))]" />
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          className="focus-ring min-w-0 flex-1 bg-transparent text-sm outline-none"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-[hsl(var(--danger)/0.28)] bg-[hsl(var(--danger)/0.1)] px-3 py-2 text-sm text-[hsl(var(--danger))]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="focus-ring primary-gradient mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {mode === "login" ? "Login" : "Sign up"}
      </button>
    </form>
  );
}
