import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="liquid-card flex flex-col items-center justify-center rounded-[26px] px-6 py-14 text-center">
      <span className="icon-glass flex h-12 w-12 items-center justify-center rounded-2xl text-[hsl(var(--primary))]">
        <Icon className="h-6 w-6" strokeWidth={1.9} />
      </span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted))]">{description}</p>
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref} className="mt-6">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}
