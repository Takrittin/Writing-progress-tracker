"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/42 text-sm font-medium text-[hsl(var(--muted))] shadow-[0_8px_18px_hsl(var(--shadow)/0.16)] transition hover:-translate-y-0.5 hover:text-[hsl(var(--foreground))] disabled:cursor-not-allowed disabled:opacity-60",
        compact ? "h-9 w-9 px-0" : "h-10 px-3"
      )}
    >
      <LogOut className="h-4 w-4" />
      {compact ? null : <span className="hidden sm:inline">{isPending ? "Leaving" : "Logout"}</span>}
    </button>
  );
}
