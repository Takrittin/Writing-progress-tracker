export const scoreKeys = [
  "grammar",
  "vocabulary",
  "spelling",
  "punctuation",
  "organization",
  "clarity",
  "naturalness",
  "sentence_variety"
] as const;

export type ScoreKey = (typeof scoreKeys)[number];

export const metricLabels: Record<ScoreKey, string> = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  spelling: "Spelling",
  punctuation: "Punctuation",
  organization: "Organization",
  clarity: "Clarity",
  naturalness: "Naturalness",
  sentence_variety: "Sentence variety"
};

export type WritingScoreMap = Record<ScoreKey, number>;

export type SentenceFeedback = {
  original_sentence: string;
  improved_sentence: string;
  explanation: string;
  mistake_type: string;
};

export type AnalyzeWritingResult = {
  overall_score: number;
  scores: WritingScoreMap;
  improved_text: string;
  main_advice: string[];
  sentence_feedback: SentenceFeedback[];
};
