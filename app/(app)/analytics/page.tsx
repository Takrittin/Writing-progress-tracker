import { BarChart3, CalendarDays, TrendingDown, Trophy } from "lucide-react";
import { ProgressCharts } from "@/components/analytics-charts";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getDatabaseConfig, getJwtConfig } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { average, formatShortDate } from "@/lib/utils";
import { metricLabels, scoreKeys } from "@/types/writing";

export default async function AnalyticsPage() {
  if (!getDatabaseConfig() || !getJwtConfig()) {
    return null;
  }

  const { user } = await requireUser();
  const rows = await prisma.writingEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" }
  });
  const scores = await prisma.writingScore.findMany({
    where: { writingEntry: { userId: user.id } }
  });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekScores = rows
    .filter((entry) => entry.createdAt >= weekStart)
    .map((entry) => entry.overallScore ?? 0)
    .filter(Boolean);
  const monthScores = rows
    .filter((entry) => entry.createdAt >= monthStart)
    .map((entry) => entry.overallScore ?? 0)
    .filter(Boolean);

  const metricAverages = scoreKeys.map((key) => {
    const values = scores.map((score) => {
      if (key === "sentence_variety") {
        return score.sentenceVariety ?? 0;
      }

      return score[key] ?? 0;
    }).filter(Boolean);
    return { key, label: metricLabels[key], score: average(values) };
  });
  const bestMetric = metricAverages.reduce((best, item) => (item.score > best.score ? item : best), metricAverages[0]);
  const weakestMetric = metricAverages.reduce((weakest, item) => (item.score < weakest.score ? item : weakest), metricAverages[0]);

  const lineData = rows.map((entry) => ({
    date: formatShortDate(entry.createdAt.toISOString()),
    score: entry.overallScore ?? 0
  }));
  const metricData = metricAverages.map((item) => ({
    metric: item.label.split(" ")[0],
    score: item.score
  }));

  return (
    <>
      <PageHeading title="Analytics" description="Weekly and monthly progress from your saved writing." />

      {rows.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Analyze writing to unlock score trends, best metrics, and improvement patterns."
          actionHref="/new"
          actionLabel="Analyze Writing"
        />
      ) : (
        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Average this week" value={average(weekScores)} detail="Last 7 days" icon={CalendarDays} tone="primary" />
            <StatCard label="Average this month" value={average(monthScores)} detail="Current month" icon={BarChart3} tone="success" />
            <StatCard label="Best metric" value={bestMetric?.label ?? "No data"} detail={`${bestMetric?.score ?? 0}/100 average`} icon={Trophy} tone="warning" />
            <StatCard label="Weakest metric" value={weakestMetric?.label ?? "No data"} detail={`${weakestMetric?.score ?? 0}/100 average`} icon={TrendingDown} tone="danger" />
          </div>

          <ProgressCharts lineData={lineData} metricData={metricData} />

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="liquid-card rounded-[26px] p-5">
              <h2 className="text-lg font-semibold">Weekly progress</h2>
              <p className="mt-3 text-4xl font-semibold text-[hsl(var(--primary))]">{average(weekScores)}</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">
                Average overall score from entries created in the last 7 days.
              </p>
            </section>
            <section className="liquid-card rounded-[26px] p-5">
              <h2 className="text-lg font-semibold">Monthly progress</h2>
              <p className="mt-3 text-4xl font-semibold text-[hsl(var(--primary))]">{average(monthScores)}</p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted))]">
                Average overall score from entries created this calendar month.
              </p>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
