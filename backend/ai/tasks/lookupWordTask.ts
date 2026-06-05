import type { ProviderName } from "../../providers/types";
import { buildLookupWordPrompt } from "../../prompts/lookupWordPrompt";
import { lookupWordResponseJsonSchema, lookupWordResponseSchema, type LookupWordResult } from "../schemas/lookupWordSchema";

export type { LookupWordResult } from "../schemas/lookupWordSchema";

export interface LookupWordInput {
  word: string;
}

export const lookupWordTask = {
  buildPrompt({ word }: LookupWordInput) {
    return buildLookupWordPrompt({ word });
  },
  schema: lookupWordResponseJsonSchema,
  validator: lookupWordResponseSchema,
  defaultModels: {
    gemini: ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-2.5-flash"],
    litellm: [process.env.LITELLM_MODEL || "gpt-3.5-turbo"],
    openai: ["gpt-4o-mini"],
    grok: ["grok-2-latest"],
  } satisfies Record<ProviderName, string[]>,
};
