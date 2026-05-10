import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SetupRequired() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="glass-strong w-full max-w-xl rounded-[28px] p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="icon-glass flex h-11 w-11 items-center justify-center rounded-2xl text-[hsl(var(--primary))]">
            <KeyRound className="h-5 w-5" />
          </span>
          <ThemeToggle />
        </div>
        <h1 className="text-3xl font-semibold">Setup needed</h1>
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted))]">
          Add your Prisma database URL, JWT secret, and AI provider key to `.env.local`, then restart the dev server.
        </p>
        <div className="liquid-card mt-5 rounded-[22px] p-4 font-mono text-sm leading-7 text-[hsl(var(--muted))]">
          DATABASE_URL=
          <br />
          JWT_SECRET=
          <br />
          OPENAI_API_KEY=
          <br />
          OPENAI_MODEL=gpt-5.2
          <br />
          OPENROUTER_API_KEY=
          <br />
          OPENROUTER_MODEL=openai/gpt-oss-120b:free
        </div>
        <Link
          href="/login"
          className="focus-ring primary-gradient mt-6 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          Login page
        </Link>
      </div>
    </main>
  );
}
