import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div className="glass rounded-[28px] p-8">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted))]">The page may have moved or the entry is private.</p>
        <Link
          href="/dashboard"
          className="focus-ring primary-gradient mt-6 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
