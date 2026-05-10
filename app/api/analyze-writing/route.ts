import { NextResponse } from "next/server";
import { analyzeRequestSchema } from "@/lib/analysis-schema";
import { getCurrentUser } from "@/lib/auth";
import { getDatabaseConfig } from "@/lib/env";
import { analyzeWritingWithProvider } from "@/lib/openai-analyzer";
import { prisma } from "@/lib/prisma";
import { countWords } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    if (!getDatabaseConfig()) {
      return NextResponse.json(
        { error: "Missing DATABASE_URL. Add your Prisma database connection string to .env.local." },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in before analyzing writing." }, { status: 401 });
    }

    const body = await request.json();
    const input = analyzeRequestSchema.parse(body);
    const analysis = await analyzeWritingWithProvider({
      title: input.title,
      originalText: input.original_text
    });

    const entry = await prisma.writingEntry.create({
      data: {
        userId: user.id,
        title: input.title,
        originalText: input.original_text,
        improvedText: analysis.improved_text,
        mainAdvice: analysis.main_advice,
        wordCount: countWords(input.original_text),
        overallScore: analysis.overall_score,
        scores: {
          create: {
            grammar: analysis.scores.grammar,
            vocabulary: analysis.scores.vocabulary,
            spelling: analysis.scores.spelling,
            punctuation: analysis.scores.punctuation,
            organization: analysis.scores.organization,
            clarity: analysis.scores.clarity,
            naturalness: analysis.scores.naturalness,
            sentenceVariety: analysis.scores.sentence_variety
          }
        },
        sentenceFeedback: {
          create: analysis.sentence_feedback.map((item) => ({
            originalSentence: item.original_sentence,
            improvedSentence: item.improved_sentence,
            explanation: item.explanation,
            mistakeType: item.mistake_type
          }))
        }
      },
      select: { id: true }
    });

    return NextResponse.json({
      entry_id: entry.id,
      ...analysis
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong while analyzing your writing.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
