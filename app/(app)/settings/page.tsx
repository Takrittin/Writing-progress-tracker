import { KeyRound, LogOut, Moon, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageHeading } from "@/components/ui/page-heading";
import { requireUser } from "@/lib/auth";
import { getDatabaseConfig, getJwtConfig, getOpenAIConfig, getOpenRouterConfig } from "@/lib/env";

export default async function SettingsPage() {
  if (!getDatabaseConfig() || !getJwtConfig()) {
    return null;
  }

  const { user } = await requireUser();
  const openAIConfig = getOpenAIConfig();
  const openRouterConfig = getOpenRouterConfig();

  return (
    <>
      <PageHeading title="Settings" description="Account, theme, and analysis provider preferences." />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="liquid-card rounded-[26px] p-5">
          <span className="icon-glass flex h-12 w-12 items-center justify-center rounded-2xl text-[hsl(var(--primary))]">
            <UserRound className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">User Profile</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted))]">{user.email}</p>
        </section>

        <section className="liquid-card rounded-[26px] p-5">
          <span className="icon-glass flex h-12 w-12 items-center justify-center rounded-2xl text-[hsl(var(--primary))]">
            <Moon className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">Appearance</h2>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">Switch between the soft light workspace and the darker glass view.</p>
          <div className="mt-5">
            <ThemeToggle />
          </div>
        </section>

        <section className="liquid-card rounded-[26px] p-5">
          <span className="icon-glass flex h-12 w-12 items-center justify-center rounded-2xl text-[hsl(var(--primary))]">
            <KeyRound className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">AI Analysis</h2>
          <div className="mt-4 grid gap-3 text-sm text-[hsl(var(--muted))]">
            <p>OpenAI: {openAIConfig ? openAIConfig.model : "Not configured"}</p>
            <p>OpenRouter: {openRouterConfig ? openRouterConfig.model : "Not configured"}</p>
          </div>
        </section>

        <section className="liquid-card rounded-[26px] p-5">
          <span className="icon-glass flex h-12 w-12 items-center justify-center rounded-2xl text-[hsl(var(--primary))]">
            <LogOut className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">Session</h2>
          <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">Leave this private workspace on the current device.</p>
          <div className="mt-5">
            <LogoutButton />
          </div>
        </section>
      </div>
    </>
  );
}
