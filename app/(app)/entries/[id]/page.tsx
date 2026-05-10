import { notFound } from "next/navigation";
import { MetricGrid } from "@/components/metric-grid";
import { PageHeading } from "@/components/ui/page-heading";
import { requireUser } from "@/lib/auth";
import { getDatabaseConfig, getJwtConfig } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { formatDate, getScoreTone } from "@/lib/utils";
import type { WritingScoreMap } from "@/types/writing";

export default async function ResultDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!getDatabaseConfig() || !getJwtConfig()) {
    return null;
  }

  const { user } = await requireUser();
  const entry = await prisma.writingEntry.findFirst({
    where: { id, userId: user.id },
    include: {
      scores: true,
      sentenceFeedback: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!entry) {
    notFound();
  }

  const score = entry.scores;
  const scoreMap = score
    ? ({
        grammar: score.grammar ?? 0,
        vocabulary: score.vocabulary ?? 0,
        spelling: score.spelling ?? 0,
        punctuation: score.punctuation ?? 0,
        organization: score.organization ?? 0,
        clarity: score.clarity ?? 0,
        naturalness: score.naturalness ?? 0,
        sentence_variety: score.sentenceVariety ?? 0
      } satisfies WritingScoreMap)
    : {};

  return (
    <>
      <PageHeading title={entry.title} description={`${formatDate(entry.createdAt.toISOString())} · ${entry.wordCount ?? 0} words`} />

      <section className="glass-strong mb-5 rounded-[26px] p-6">
        <p className="text-sm font-medium text-[hsl(var(--muted))]">Overall score</p>
        <p className={`mt-2 text-6xl font-semibold tracking-normal ${getScoreTone(entry.overallScore ?? 0)}`}>
          {entry.overallScore ?? 0}
        </p>
      </section>

      <MetricGrid scores={scoreMap} />

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="liquid-card rounded-[26px] p-5">
          <h2 className="text-lg font-semibold">Original writing</h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-[hsl(var(--muted))]">{entry.originalText}</p>
        </article>
        <article className="liquid-card rounded-[26px] p-5">
          <h2 className="text-lg font-semibold">Improved writing</h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-7">{entry.improvedText}</p>
        </article>
      </section>

      <section className="liquid-card mt-5 rounded-[26px] p-5">
        <h2 className="text-lg font-semibold">Main advice</h2>
        <ul className="mt-4 grid gap-3">
          {entry.mainAdvice.map((item) => (
            <li key={item} className="rounded-2xl bg-white/42 px-4 py-3 text-sm leading-6">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="liquid-card mt-5 overflow-hidden rounded-[26px]">
        <div className="border-b border-[hsl(var(--border)/0.42)] bg-white/24 px-5 py-4">
          <h2 className="text-lg font-semibold">Sentence feedback</h2>
        </div>
        <div className="hidden grid-cols-[1fr_1fr_1.2fr_160px] gap-4 border-b border-[hsl(var(--border)/0.42)] px-5 py-3 text-sm font-semibold text-[hsl(var(--muted))] lg:grid">
          <span>My sentence</span>
          <span>Better sentence</span>
          <span>Explanation</span>
          <span>Mistake type</span>
        </div>
        <div className="divide-y divide-[hsl(var(--border)/0.38)]">
          {entry.sentenceFeedback.map((item) => (
            <div key={item.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1fr_1.2fr_160px]">
              <p className="text-sm leading-6 text-[hsl(var(--muted))]">{item.originalSentence}</p>
              <p className="text-sm leading-6">{item.improvedSentence}</p>
              <p className="text-sm leading-6 text-[hsl(var(--muted))]">{item.explanation}</p>
              <p className="text-sm font-medium text-[hsl(var(--primary))]">{item.mistakeType}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
