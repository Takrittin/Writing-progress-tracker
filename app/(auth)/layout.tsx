import Link from "next/link";
import { Pencil } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-6">
      <div className="liquid-frame grid min-h-[min(720px,calc(100vh-48px))] w-full max-w-5xl overflow-hidden rounded-[28px] md:grid-cols-[276px_minmax(0,1fr)]">
        <aside className="liquid-sidebar hidden px-5 py-6 md:block">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="icon-glass flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--primary))]">
              <Pencil className="h-5 w-5" />
            </span>
            <span className="text-[18px] font-semibold">New Writing Analysis</span>
          </Link>
        </aside>
        <section className="relative flex min-h-full flex-col bg-[hsl(var(--background-strong)/0.45)]">
          <div className="flex items-center justify-between px-5 py-4 md:justify-end">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold md:hidden">
              <span className="icon-glass flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--primary))]">
                <Pencil className="h-5 w-5" />
              </span>
              Writing Progress
            </Link>
            <ThemeToggle />
          </div>
          <div className="flex flex-1 items-center justify-center px-5 pb-10">{children}</div>
        </section>
      </div>
    </main>
  );
}
