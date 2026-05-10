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
    primary: "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.13)]",
    success: "text-[hsl(var(--success))] bg-[hsl(var(--success)/0.12)]",
    warning: "text-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.14)]",
    danger: "text-[hsl(var(--danger))] bg-[hsl(var(--danger)/0.12)]"
  }[tone];

  return (
    <div className="liquid-card rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[hsl(var(--muted))]">{label}</p>
          <p className="mt-3 text-[32px] font-semibold tracking-normal">{value}</p>
          {detail ? <p className="mt-2 text-sm leading-5 text-[hsl(var(--muted))]">{detail}</p> : null}
        </div>
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_white]", toneClass)}>
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
      </div>
    </div>
  );
}
