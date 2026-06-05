import type { ProviderName } from "../../providers/types";
import { buildAnalyzeSentencePrompt } from "../../prompts/analyzeSentencePrompt";
import { analyzeSentenceResponseJsonSchema, analyzeSentenceResponseSchema, type AnalyzeSentenceResult } from "../schemas/analyzeSentenceSchema";

export type { AnalyzeSentenceResult } from "../schemas/analyzeSentenceSchema";

export interface AnalyzeSentenceInput {
  english: string;
  vietnamese: string;
}

export const analyzeSentenceTask = {
  buildPrompt({ english, vietnamese }: AnalyzeSentenceInput) {
    return buildAnalyzeSentencePrompt({ english, vietnamese });
  },
  schema: analyzeSentenceResponseJsonSchema,
  validator: analyzeSentenceResponseSchema,
  defaultModels: {
    gemini: ["gemini-3.5-flash", "gemini-2.0-flash"],
    litellm: [process.env.LITELLM_MODEL || "gpt-3.5-turbo"],
    openai: ["gpt-4o-mini"],
    grok: ["grok-2-latest"],
  } satisfies Record<ProviderName, string[]>,
};
