"use client";

import {
  BarChart3,
  Clock3,
  LayoutDashboard,
  PenLine,
  Pencil,
  Settings,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new", label: "New Writing", icon: PenLine },
  { href: "/history", label: "History", icon: Clock3 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children, email }: { children: React.ReactNode; email?: string | null }) {
  const pathname = usePathname();
  const title =
    navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ??
    "New Writing Analysis";

  return (
    <div className="min-h-screen">
      <div className="liquid-frame grid min-h-screen w-full overflow-hidden md:grid-cols-[276px_minmax(0,1fr)]">
        <aside className="liquid-sidebar relative hidden min-h-full px-5 py-6 md:block">
          <Link href="/new" className="flex items-center gap-3">
            <span className="icon-glass flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--primary))]">
              <Pencil className="h-5 w-5" />
            </span>
            <span className="text-[18px] font-semibold tracking-normal text-[hsl(var(--foreground))]">
              New Writing Analysis
            </span>
          </Link>

          <nav className="mt-14 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-12 items-center gap-4 rounded-xl border px-3 text-[17px] font-medium transition duration-200",
                    active
                      ? "nav-item-active border-white/70 bg-white/54 text-[hsl(var(--foreground))] shadow-[0_12px_28px_hsl(var(--shadow)/0.32)] dark:border-white/16 dark:bg-white/10 dark:shadow-[0_12px_30px_hsl(var(--shadow)/0.42)]"
                      : "border-transparent text-[hsl(var(--foreground)/0.82)] hover:border-white/55 hover:bg-white/32 dark:hover:border-white/16 dark:hover:bg-white/8"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active
                        ? "text-[hsl(var(--primary))] dark:drop-shadow-[0_0_8px_hsl(var(--primary)/0.38)]"
                        : "text-[hsl(var(--muted))]"
                    )}
                    strokeWidth={1.9}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex items-center gap-3" title={email ?? "User Profile"}>
              <span className="avatar-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[hsl(var(--primary))] shadow-[0_10px_24px_hsl(var(--shadow)/0.28)]">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-medium">User Profile</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="relative min-h-screen bg-[hsl(var(--background-strong)/0.45)] md:min-h-full">
          <header className="sticky top-0 z-20 border-b border-white/45 bg-[hsl(var(--background-strong)/0.58)] px-4 py-3 backdrop-blur-2xl md:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link href="/new" className="flex min-w-0 items-center gap-2">
                <span className="icon-glass flex h-9 w-9 items-center justify-center rounded-xl text-[hsl(var(--primary))]">
                  <Pencil className="h-5 w-5" />
                </span>
                <span className="truncate text-base font-semibold">{title}</span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <LogoutButton compact />
              </div>
            </div>
          </header>

          <main className="min-h-full px-4 py-8 pb-24 sm:px-8 md:px-12 md:py-12 lg:px-[118px]">
            {children}
          </main>
        </section>

        <nav className="fixed bottom-3 left-3 right-3 z-30 grid grid-cols-5 rounded-[22px] border border-white/60 bg-white/62 px-2 py-2 shadow-[0_16px_44px_hsl(var(--shadow)/0.36)] backdrop-blur-2xl dark:border-white/12 dark:bg-[hsl(var(--background-strong)/0.82)] md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-medium transition",
                  active
                    ? "mobile-nav-active bg-white/74 text-[hsl(var(--primary))] shadow-[0_8px_20px_hsl(var(--shadow)/0.18)] dark:bg-white/12 dark:drop-shadow-[0_0_8px_hsl(var(--primary)/0.34)]"
                    : "text-[hsl(var(--muted))]"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
                <span className="max-w-full truncate">{item.label.replace(" Writing", "")}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
