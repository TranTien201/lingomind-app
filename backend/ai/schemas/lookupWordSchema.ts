import { Type } from "@google/genai";
import { z } from "zod";

export const lookupWordExampleSchema = z.object({
  topic: z.string().min(1),
  english: z.string().min(1),
  vietnamese: z.string().min(1),
});

export const lookupWordRelatedWordSchema = z.object({
  word: z.string().min(1),
  partOfSpeech: z.string().min(1),
});

export const lookupWordCollocationSchema = z.object({
  phrase: z.string().min(1),
  translation: z.string().min(1),
});

export const lookupWordResponseSchema = z.object({
  word: z.string().min(1),
  partOfSpeech: z.string().min(1),
  translation: z.string().min(1),
  examples: z.array(lookupWordExampleSchema),
  relatedWords: z.array(lookupWordRelatedWordSchema),
  collocations: z.array(lookupWordCollocationSchema),
});

export type LookupWordResult = z.infer<typeof lookupWordResponseSchema>;

export const lookupWordResponseJsonSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    partOfSpeech: { type: Type.STRING },
    translation: { type: Type.STRING },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          english: { type: Type.STRING },
          vietnamese: { type: Type.STRING },
        },
        required: ["topic", "english", "vietnamese"],
      },
    },
    relatedWords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          partOfSpeech: { type: Type.STRING },
        },
        required: ["word", "partOfSpeech"],
      },
    },
    collocations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phrase: { type: Type.STRING },
          translation: { type: Type.STRING },
        },
        required: ["phrase", "translation"],
      },
    },
  },
  required: ["word", "partOfSpeech", "translation", "examples", "relatedWords", "collocations"],
} as const;
