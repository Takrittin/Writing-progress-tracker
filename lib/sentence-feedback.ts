import type { SentenceFeedback } from "@/types/writing";

export type SentencePair = {
  originalSentence: string;
  improvedSentence: string;
};

const sentencePattern = /[^.!?]+(?:[.!?]+|$)/g;

export function splitIntoSentences(text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return [];
  }

  const matches = trimmedText.match(sentencePattern)?.map((sentence) => sentence.trim()).filter(Boolean);

  return matches && matches.length > 0 ? matches : [trimmedText];
}

export function firstSentence(text: string) {
  return splitIntoSentences(text)[0] ?? "Original writing";
}

export function normalizeSentenceText(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function getChangedSentencePairs(originalText: string, improvedText: string): SentencePair[] {
  const originalSentences = splitIntoSentences(originalText);
  const improvedSentences = splitIntoSentences(improvedText);
  const sentenceCount = Math.max(originalSentences.length, improvedSentences.length);
  const pairs: SentencePair[] = [];

  for (let index = 0; index < sentenceCount; index += 1) {
    const originalSentence = originalSentences[index] ?? "";
    const improvedSentence = improvedSentences[index] ?? "";

    if (!originalSentence && !improvedSentence) {
      continue;
    }

    if (normalizeSentenceText(originalSentence) !== normalizeSentenceText(improvedSentence)) {
      pairs.push({
        originalSentence: originalSentence || "Original writing",
        improvedSentence: improvedSentence || originalSentence
      });
    }
  }

  return pairs;
}

export function createChangedSentenceFeedback(pair: SentencePair): SentenceFeedback {
  return {
    original_sentence: pair.originalSentence,
    improved_sentence: pair.improvedSentence,
    explanation:
      "This sentence was changed in the improved version. Compare the wording and structure to see how it became clearer and more natural.",
    mistake_type: "Sentence rewrite"
  };
}

export function createGeneralSentenceFeedback(originalText: string, improvedText?: string): SentenceFeedback {
  const originalSentence = firstSentence(originalText);
  const improvedSentence = improvedText?.trim() ? firstSentence(improvedText) : originalSentence;

  return {
    original_sentence: originalSentence,
    improved_sentence: improvedSentence,
    explanation:
      "The model did not return a specific sentence-level correction, so this item summarizes the overall rewrite and feedback.",
    mistake_type: "General feedback"
  };
}
