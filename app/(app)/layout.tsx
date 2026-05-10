import { AppShell } from "@/components/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { requireUser } from "@/lib/auth";
import { getDatabaseConfig, getJwtConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!getDatabaseConfig() || !getJwtConfig()) {
    return <SetupRequired />;
  }

  const { user } = await requireUser();

  return <AppShell email={user.email}>{children}</AppShell>;
}
