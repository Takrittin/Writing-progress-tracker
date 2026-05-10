import OpenAI from "openai";
import { getOpenAIConfig, getOpenRouterConfig } from "@/lib/env";
import { analyzeWritingSchema } from "@/lib/analysis-schema";
import {
  createChangedSentenceFeedback,
  createGeneralSentenceFeedback,
  getChangedSentencePairs,
  normalizeSentenceText,
  type SentencePair
} from "@/lib/sentence-feedback";
import type { AnalyzeWritingResult } from "@/types/writing";

type OpenRouterChatCompletionParams = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
  provider?: {
    require_parameters?: boolean;
  };
};

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["overall_score", "scores", "improved_text", "main_advice", "sentence_feedback"],
  properties: {
    overall_score: { type: "integer" },
    scores: {
      type: "object",
      additionalProperties: false,
      required: [
        "grammar",
        "vocabulary",
        "spelling",
        "punctuation",
        "organization",
        "clarity",
        "naturalness",
        "sentence_variety"
      ],
      properties: {
        grammar: { type: "integer" },
        vocabulary: { type: "integer" },
        spelling: { type: "integer" },
        punctuation: { type: "integer" },
        organization: { type: "integer" },
        clarity: { type: "integer" },
        naturalness: { type: "integer" },
        sentence_variety: { type: "integer" }
      }
    },
    improved_text: { type: "string" },
    main_advice: {
      type: "array",
      items: { type: "string" }
    },
    sentence_feedback: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["original_sentence", "improved_sentence", "explanation", "mistake_type"],
        properties: {
          original_sentence: { type: "string" },
          improved_sentence: { type: "string" },
          explanation: { type: "string" },
          mistake_type: { type: "string" }
        }
      }
    }
  }
};

const coachingInstructions = [
  "You are an English writing coach for students.",
  "Return only strict JSON matching the schema.",
  "Be encouraging, concrete, and concise.",
  "Preserve the student's meaning while improving grammar, clarity, naturalness, punctuation, vocabulary, organization, and sentence variety.",
  "All scores must be integers from 1 to 100.",
  "Always include at least one main_advice item and at least one sentence_feedback item.",
  "Include one sentence_feedback item for every sentence that changed in improved_text.",
  "If the writing has no obvious sentence-level mistake, include one general feedback item that uses the original sentence, a polished version, and explains why it is already strong or how it could be refined."
].join(" ");

function isFeedbackObject(item: unknown) {
  return item != null && typeof item === "object" && !Array.isArray(item);
}

function hasFeedbackForPair(items: unknown[], pair: SentencePair) {
  const originalSentence = normalizeSentenceText(pair.originalSentence);
  const improvedSentence = normalizeSentenceText(pair.improvedSentence);

  return items.some((item) => {
    if (!isFeedbackObject(item)) {
      return false;
    }

    const feedback = item as {
      original_sentence?: unknown;
      improved_sentence?: unknown;
    };

    return (
      (typeof feedback.original_sentence === "string" &&
        normalizeSentenceText(feedback.original_sentence) === originalSentence) ||
      (typeof feedback.improved_sentence === "string" &&
        normalizeSentenceText(feedback.improved_sentence) === improvedSentence)
    );
  });
}

function normalizeAnalysisPayload(parsed: unknown, originalText: string) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return parsed;
  }

  const payload = parsed as {
    improved_text?: unknown;
    main_advice?: unknown;
    sentence_feedback?: unknown;
  };

  if (
    payload.main_advice == null ||
    (Array.isArray(payload.main_advice) && payload.main_advice.length === 0)
  ) {
    payload.main_advice = [
      "Review the improved version and focus on clarity, natural wording, and sentence flow."
    ];
  }

  const improvedText = typeof payload.improved_text === "string" ? payload.improved_text : "";
  const changedPairs = improvedText ? getChangedSentencePairs(originalText, improvedText) : [];

  if (!Array.isArray(payload.sentence_feedback) || payload.sentence_feedback.length === 0) {
    payload.sentence_feedback =
      changedPairs.length > 0
        ? changedPairs.map(createChangedSentenceFeedback)
        : [createGeneralSentenceFeedback(originalText, improvedText)];
  } else {
    for (const pair of changedPairs) {
      if (!hasFeedbackForPair(payload.sentence_feedback, pair)) {
        payload.sentence_feedback.push(createChangedSentenceFeedback(pair));
      }
    }
  }

  return payload;
}

function parseAnalysisJson(content: string, originalText: string) {
  const parsed = JSON.parse(content);
  return analyzeWritingSchema.parse(normalizeAnalysisPayload(parsed, originalText));
}

async function analyzeWithOpenAI(input: {
  title: string;
  originalText: string;
}): Promise<AnalyzeWritingResult> {
  const config = getOpenAIConfig();

  if (!config) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey: config.apiKey });

  const response = await client.responses.create({
    model: config.model,
    instructions: coachingInstructions,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Title: ${input.title}\n\nStudent writing:\n${input.originalText}`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "writing_analysis",
        strict: true,
        schema: responseSchema
      },
      verbosity: "medium"
    }
  });

  return parseAnalysisJson(response.output_text, input.originalText);
}

async function requestOpenRouterAnalysis(input: {
  title: string;
  originalText: string;
}, client: OpenAI, model: string): Promise<AnalyzeWritingResult> {
  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: coachingInstructions
      },
      {
        role: "user",
        content: `Title: ${input.title}\n\nStudent writing:\n${input.originalText}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "writing_analysis",
        strict: true,
        schema: responseSchema
      }
    },
    provider: {
      require_parameters: true
    }
  } as OpenRouterChatCompletionParams);

  const content = response.choices[0]?.message.content;

  if (!content) {
    throw new Error("OpenRouter returned an empty analysis response.");
  }

  return parseAnalysisJson(content, input.originalText);
}

async function analyzeWithOpenRouter(input: {
  title: string;
  originalText: string;
}): Promise<AnalyzeWritingResult> {
  const config = getOpenRouterConfig();

  if (!config) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      ...(config.referer ? { "HTTP-Referer": config.referer } : {}),
      "X-OpenRouter-Title": config.title
    }
  });
  const errors: string[] = [];

  for (const model of config.models) {
    try {
      return await requestOpenRouterAnalysis(input, client, model);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown OpenRouter error.";
      errors.push(`${model}: ${message}`);
    }
  }

  throw new Error(
    `OpenRouter failed with all configured free models. Tried ${config.models.join(", ")}. ${errors.at(-1) ?? ""}`
  );
}

export async function analyzeWritingWithProvider(input: {
  title: string;
  originalText: string;
}): Promise<AnalyzeWritingResult> {
  const openAIConfig = getOpenAIConfig();
  const openRouterConfig = getOpenRouterConfig();

  if (openAIConfig) {
    try {
      return await analyzeWithOpenAI(input);
    } catch (error) {
      if (!openRouterConfig) {
        throw error;
      }
    }
  }

  if (openRouterConfig) {
    return analyzeWithOpenRouter(input);
  }

  throw new Error(
    "Missing AI provider key. Add OPENAI_API_KEY or OPENROUTER_API_KEY to .env.local before analyzing writing."
  );
}
