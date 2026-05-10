import { z } from "zod";
import { scoreKeys } from "@/types/writing";

const scoreSchema = z.number().int().min(1).max(100);

export const analyzeWritingSchema = z.object({
  overall_score: scoreSchema,
  scores: z.object(
    Object.fromEntries(scoreKeys.map((key) => [key, scoreSchema])) as Record<
      (typeof scoreKeys)[number],
      typeof scoreSchema
    >
  ),
  improved_text: z.string().min(1),
  main_advice: z.array(z.string().min(1)).min(1).max(6),
  sentence_feedback: z
    .array(
      z.object({
        original_sentence: z.string().min(1),
        improved_sentence: z.string().min(1),
        explanation: z.string().min(1),
        mistake_type: z.string().min(1)
      })
    )
    .min(1)
});

export const analyzeRequestSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(120, "Keep the title under 120 characters."),
  original_text: z
    .string()
    .trim()
    .min(10, "Add at least one complete sentence before analyzing.")
    .max(12000, "Keep one entry under 12,000 characters.")
});
