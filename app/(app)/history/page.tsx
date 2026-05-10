import { FileText } from "lucide-react";
import Link from "next/link";
import { DeleteEntryButton } from "@/components/delete-entry-button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { requireUser } from "@/lib/auth";
import { getDatabaseConfig, getJwtConfig } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function HistoryPage() {
  if (!getDatabaseConfig() || !getJwtConfig()) {
    return null;
  }

  const { user } = await requireUser();
  const rows = await prisma.writingEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <>
      <PageHeading title="History" description="All saved writing entries for your account." />

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Your history is empty"
          description="Analyzed writing will appear here with dates, word counts, and scores."
          actionHref="/new"
          actionLabel="Analyze Writing"
        />
      ) : (
        <div className="liquid-card overflow-hidden rounded-[26px]">
          <div className="hidden grid-cols-[150px_1fr_110px_90px_190px] gap-4 border-b border-[hsl(var(--border)/0.42)] bg-white/24 px-5 py-3 text-sm font-semibold text-[hsl(var(--muted))] md:grid">
            <span>Date</span>
            <span>Title</span>
            <span>Word count</span>
            <span>Score</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-[hsl(var(--border)/0.38)]">
            {rows.map((entry) => (
              <div
                key={entry.id}
                className="grid gap-3 px-5 py-4 transition hover:bg-white/34 md:grid-cols-[150px_1fr_110px_90px_190px] md:items-center"
              >
                <p className="text-sm text-[hsl(var(--muted))]">{formatDate(entry.createdAt.toISOString())}</p>
                <p className="font-semibold">{entry.title}</p>
                <p className="text-sm text-[hsl(var(--muted))]">{entry.wordCount ?? 0} words</p>
                <p className="font-semibold text-[hsl(var(--primary))]">{entry.overallScore ?? 0}/100</p>
                <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
                  <Link
                    href={`/entries/${entry.id}`}
                    className="focus-ring inline-flex h-10 items-center justify-center rounded-full border border-white/60 bg-white/42 px-4 text-sm font-semibold transition hover:bg-white/64"
                  >
                    Open
                  </Link>
                  <DeleteEntryButton entryId={entry.id} title={entry.title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
