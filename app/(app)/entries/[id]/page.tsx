import { Fragment } from "react";
import { notFound } from "next/navigation";
import { MetricGrid } from "@/components/metric-grid";
import { PageHeading } from "@/components/ui/page-heading";
import { requireUser } from "@/lib/auth";
import { getDatabaseConfig, getJwtConfig } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getChangedSentencePairs, normalizeSentenceText, splitIntoSentences } from "@/lib/sentence-feedback";
import { formatDate, getScoreTone } from "@/lib/utils";
import type { WritingScoreMap } from "@/types/writing";

type SavedSentenceFeedback = {
  id: string;
  originalSentence: string;
  improvedSentence: string;
  explanation: string;
  mistakeType: string | null;
};

type DisplaySentenceFeedback = SavedSentenceFeedback & {
  isDerived?: boolean;
};

const improvedSentenceHighlightClass =
  "rounded-lg bg-emerald-400/15 px-1 py-0.5 text-[hsl(var(--foreground))] ring-1 ring-emerald-300/30 dark:bg-emerald-400/20 dark:ring-emerald-300/30";

function hasDisplayFeedbackForPair(items: DisplaySentenceFeedback[], originalSentence: string, improvedSentence: string) {
  const normalizedOriginal = normalizeSentenceText(originalSentence);
  const normalizedImproved = normalizeSentenceText(improvedSentence);

  return items.some(
    (item) =>
      normalizeSentenceText(item.originalSentence) === normalizedOriginal ||
      normalizeSentenceText(item.improvedSentence) === normalizedImproved
  );
}

function getDisplaySentenceFeedback(
  originalText: string,
  improvedText: string,
  savedFeedback: SavedSentenceFeedback[]
): DisplaySentenceFeedback[] {
  const displayFeedback: DisplaySentenceFeedback[] = [...savedFeedback];
  const changedPairs = getChangedSentencePairs(originalText, improvedText);

  changedPairs.forEach((pair, index) => {
    if (hasDisplayFeedbackForPair(displayFeedback, pair.originalSentence, pair.improvedSentence)) {
      return;
    }

    displayFeedback.push({
      id: `derived-${index}-${normalizeSentenceText(pair.improvedSentence)}`,
      originalSentence: pair.originalSentence,
      improvedSentence: pair.improvedSentence,
      explanation:
        "This sentence was changed in the improved version. Compare the wording and structure to see how it became clearer and more natural.",
      mistakeType: "Sentence rewrite",
      isDerived: true
    });
  });

  return displayFeedback;
}

function getHighlightedImprovedSentences(
  originalText: string,
  improvedText: string,
  feedback: DisplaySentenceFeedback[]
) {
  const highlightedSentences = new Set<string>();

  getChangedSentencePairs(originalText, improvedText).forEach((pair) => {
    highlightedSentences.add(normalizeSentenceText(pair.improvedSentence));
  });

  feedback.forEach((item) => {
    if (normalizeSentenceText(item.originalSentence) !== normalizeSentenceText(item.improvedSentence)) {
      highlightedSentences.add(normalizeSentenceText(item.improvedSentence));
    }
  });

  return highlightedSentences;
}

function HighlightedImprovedText({
  text,
  highlightedSentences
}: {
  text: string;
  highlightedSentences: Set<string>;
}) {
  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    return <p className="mt-4 text-base leading-7 text-[hsl(var(--muted))]">No improved writing saved.</p>;
  }

  return (
    <p className="mt-4 text-base leading-8">
      {sentences.map((sentence, index) => {
        const isHighlighted = highlightedSentences.has(normalizeSentenceText(sentence));

        return (
          <Fragment key={`${sentence}-${index}`}>
            <span className={isHighlighted ? improvedSentenceHighlightClass : undefined}>{sentence}</span>
            {index < sentences.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </p>
  );
}

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
  const improvedText = entry.improvedText ?? "";
  const sentenceFeedback = getDisplaySentenceFeedback(entry.originalText, improvedText, entry.sentenceFeedback);
  const highlightedImprovedSentences = getHighlightedImprovedSentences(
    entry.originalText,
    improvedText,
    sentenceFeedback
  );

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
          <HighlightedImprovedText text={improvedText} highlightedSentences={highlightedImprovedSentences} />
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
          {sentenceFeedback.map((item) => (
            <div key={item.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1fr_1.2fr_160px]">
              <p className="text-sm leading-6 text-[hsl(var(--muted))]">{item.originalSentence}</p>
              <p className="text-sm leading-6">
                <span className={improvedSentenceHighlightClass}>{item.improvedSentence}</span>
              </p>
              <p className="text-sm leading-6 text-[hsl(var(--muted))]">{item.explanation}</p>
              <p className="text-sm font-medium text-[hsl(var(--primary))]">
                {item.mistakeType ?? "Sentence rewrite"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
