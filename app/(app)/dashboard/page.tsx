import { BookOpen, CircleGauge, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getDatabaseConfig, getJwtConfig } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { average, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  if (!getDatabaseConfig() || !getJwtConfig()) {
    return null;
  }

  const { user } = await requireUser();
  const rows = await prisma.writingEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  const latest = rows[0];
  const scores = rows.map((entry) => entry.overallScore ?? 0).filter((score) => score > 0);

  return (
    <>
      <PageHeading
        title="Dashboard"
        description={`Welcome${user.email ? `, ${user.email}` : ""}.`}
        action={<ButtonLink href="/new">New writing</ButtonLink>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Latest writing score"
          value={latest?.overallScore ?? "No score"}
          detail={latest ? latest.title : "Start with a new entry"}
          icon={CircleGauge}
          tone="primary"
        />
        <StatCard label="Total writing entries" value={rows.length} detail="Private entries" icon={FileText} tone="success" />
        <StatCard label="Average score" value={scores.length ? average(scores) : "No score"} detail="Across all entries" icon={TrendingUp} tone="warning" />
        <StatCard label="Latest word count" value={latest?.wordCount ?? 0} detail={latest ? formatDate(latest.createdAt.toISOString()) : "No writing yet"} icon={BookOpen} tone="primary" />
      </div>

      <section className="mt-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent writing</h2>
          {rows.length > 0 ? (
            <Link href="/history" className="text-sm font-semibold text-[hsl(var(--primary))]">
              View History
            </Link>
          ) : null}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No writing yet"
            description="Create your first entry to see scores, feedback, and progress here."
            actionHref="/new"
            actionLabel="Analyze Writing"
          />
        ) : (
          <div className="liquid-card overflow-hidden rounded-[26px]">
            <div className="divide-y divide-[hsl(var(--border)/0.38)]">
              {rows.slice(0, 5).map((entry) => (
                <Link
                  href={`/entries/${entry.id}`}
                  key={entry.id}
                  className="grid gap-3 px-5 py-4 transition hover:bg-white/38 sm:grid-cols-[1fr_auto_auto]"
                >
                  <div>
                    <p className="font-semibold">{entry.title}</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted))]">{formatDate(entry.createdAt.toISOString())}</p>
                  </div>
                  <p className="text-sm text-[hsl(var(--muted))]">{entry.wordCount ?? 0} words</p>
                  <p className="font-semibold text-[hsl(var(--primary))]">{entry.overallScore ?? 0}/100</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
