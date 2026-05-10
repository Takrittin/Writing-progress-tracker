import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "primary"
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    primary: "border-[hsl(var(--primary)/0.28)] bg-[hsl(var(--primary)/0.13)] text-[hsl(var(--primary))] dark:border-[hsl(var(--primary)/0.44)] dark:bg-[hsl(var(--primary)/0.22)]",
    success: "border-[hsl(var(--success)/0.26)] bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] dark:border-[hsl(var(--success)/0.42)] dark:bg-[hsl(var(--success)/0.2)]",
    warning: "border-[hsl(var(--warning)/0.28)] bg-[hsl(var(--warning)/0.14)] text-[hsl(var(--warning))] dark:border-[hsl(var(--warning)/0.42)] dark:bg-[hsl(var(--warning)/0.2)]",
    danger: "border-[hsl(var(--danger)/0.26)] bg-[hsl(var(--danger)/0.12)] text-[hsl(var(--danger))] dark:border-[hsl(var(--danger)/0.42)] dark:bg-[hsl(var(--danger)/0.2)]"
  }[tone];

  return (
    <div className="liquid-card rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[hsl(var(--muted))]">{label}</p>
          <p className="mt-3 text-[32px] font-semibold tracking-normal">{value}</p>
          {detail ? <p className="mt-2 text-sm leading-5 text-[hsl(var(--muted))]">{detail}</p> : null}
        </div>
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_white] dark:shadow-[inset_0_1px_0_hsl(0_0%_100%/0.14)]",
            toneClass
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
      </div>
    </div>
  );
}
