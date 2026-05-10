import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function ButtonLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "focus-ring primary-gradient inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105",
        className
      )}
      {...props}
    />
  );
}
